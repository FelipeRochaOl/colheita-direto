import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadRules, type Rule } from "./rules.ts";
import { availableSkills, type Agent } from "./skills.ts";

/**
 * Gera, a partir de `.ai/rules`, os formatos que cada CLI carrega sozinho por caminho:
 * - Claude Code: `.claude/rules/ai-context/<área>.md` com `paths:`;
 * - Copilot: `.github/instructions/ai-<área>.instructions.md` com `applyTo:`;
 * - índice curto no AGENTS.md e passos de ativação no BMAD (`_bmad/custom/*.toml`).
 * Só regras do time entram aqui; preferências pessoais nunca vão para arquivo versionado.
 * Áreas sem `paths` (segurança, brainstorm...) não geram arquivo: chegam pelo hook ou por `./ai rules`.
 */

const MARK = "<!-- ai-context: gerado por `./ai sync` a partir de";
const BMAD_MARK = "# ai-context: gerado por ./ai sync";

export interface SyncConfig {
  clis: string[];
}

export function loadConfig(root: string): SyncConfig {
  try {
    return JSON.parse(readFileSync(join(root, ".ai/context/config.json"), "utf8")) as SyncConfig;
  } catch {
    return { clis: ["claude", "codex", "copilot"] };
  }
}

function write(file: string, content: string, changed: string[], root: string) {
  if (existsSync(file) && readFileSync(file, "utf8") === content) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  changed.push(file.slice(root.length + 1));
}

function body(rule: Rule, root: string, agent: Agent) {
  const skills = availableSkills(root, rule.skills, agent);
  return `${MARK} ${rule.file} — edite lá -->\n# ${rule.title}\n\n${rule.body}\n${skills.length ? `\nSkills disponíveis para esta área: ${skills.join(", ")}\n` : ""}`;
}

/** Remove arquivos gerados antes que não correspondem mais a nenhuma área. */
function prune(dir: string, keep: Set<string>, changed: string[], root: string, only?: RegExp) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    if (only && !only.test(f)) continue;
    const p = join(dir, f);
    if (keep.has(p)) continue;
    try {
      if (readFileSync(p, "utf8").includes(MARK)) {
        rmSync(p);
        changed.push(`- ${p.slice(root.length + 1)}`);
      }
    } catch {
      /* diretório ou ilegível */
    }
  }
}

/** "a/{b,c}/*.{x,y}" → 4 globs sem chaves (o applyTo do Copilot separa por vírgula). */
export function expandBraces(glob: string): string[] {
  const m = /\{([^{}]*)\}/.exec(glob);
  if (!m) return [glob];
  return m[1]!.split(",").flatMap((alt) => expandBraces(glob.slice(0, m.index) + alt + glob.slice(m.index + m[0].length)));
}

const yamlList = (xs: string[]) => xs.map((x) => `  - "${x.replace(/"/g, '\\"')}"`).join("\n");

function short(xs: string[], n: number) {
  return xs.slice(0, n).map((x) => `\`${x}\``).join(", ") + (xs.length > n ? "…" : "");
}

export function agentsIndex(rules: Rule[]): string {
  const rows = rules.map((r) => {
    const when = [r.paths.length ? short(r.paths, 2) : "", r.keywords.length ? short(r.keywords, 3) : ""].filter(Boolean).join(" · ");
    return `| ${r.title} | ${when || "—"} |`;
  });
  return [
    "<!-- ai-context:start -->",
    "## Regras por área",
    "",
    "Regras do time ficam em `.ai/rules/<área>.md` e entram no contexto só quando a tarefa toca a área (por caminho de arquivo ou termo do pedido). Antes de planejar ou editar, rode `./ai rules --files <arquivos> --text \"<tarefa>\"` se elas ainda não apareceram no contexto.",
    "",
    "| Área | Quando vale |",
    "| --- | --- |",
    ...rows,
    "<!-- ai-context:end -->",
  ].join("\n");
}

/** Passos de ativação por workflow do BMAD: cada um puxa só as áreas que lhe dizem respeito. */
const BMAD_STEPS: Record<string, string> = {
  "bmad-build": './ai rules --files <arquivos que vai alterar> --text "<resumo da tarefa>"',
  "bmad-spec": './ai rules --text "<resumo da spec>"',
  "bmad-architecture": "./ai rules --area front --area back --area mobile --area patterns",
  "bmad-ux": "./ai rules --area ui --area design-system",
  "bmad-code-review": "./ai rules --area security --area qa (e --files com os arquivos do diff)",
  "bmad-qa-generate-e2e-tests": "./ai rules --area qa",
  "bmad-brainstorming": "./ai rules --area brainstorm",
};

function syncBmad(root: string, rules: Rule[], changed: string[], skipped: string[]) {
  if (!existsSync(join(root, "_bmad"))) return;
  const areas = new Set(rules.map((r) => r.area));
  for (const [skill, cmd] of Object.entries(BMAD_STEPS)) {
    const file = join(root, "_bmad/custom", `${skill}.toml`);
    if (existsSync(file) && !readFileSync(file, "utf8").startsWith(BMAD_MARK)) {
      skipped.push(`_bmad/custom/${skill}.toml (customização existente; adicione à mão: ${cmd})`);
      continue;
    }
    const wanted = [...cmd.matchAll(/--area (\S+)/g)].map((m) => m[1]!);
    if (wanted.length && !wanted.some((a) => areas.has(a))) continue;
    const step = `Antes de começar, rode \`${cmd}\` e siga as regras do time e as preferências do usuário que ele imprimir.`;
    write(file, `${BMAD_MARK} — edite .ai/rules ou apague esta linha para assumir o arquivo.\n[workflow]\nactivation_steps_append = [\n  ${JSON.stringify(step)},\n]\n`, changed, root);
  }
}

function syncAgentsMd(root: string, rules: Rule[], changed: string[]) {
  const file = join(root, "AGENTS.md");
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  const block = agentsIndex(rules);
  const re = /<!-- ai-context:start -->[\s\S]*?<!-- ai-context:end -->/;
  const next = re.test(text) ? text.replace(re, block) : `${text.trimEnd()}\n\n${block}\n`;
  if (next !== text) write(file, next, changed, root);
}

export function sync(root: string): { changed: string[]; skipped: string[] } {
  const rules = loadRules(root);
  const { clis } = loadConfig(root);
  const changed: string[] = [];
  const skipped: string[] = [];
  const scoped = rules.filter((r) => r.paths.length && r.body);

  if (clis.includes("claude")) {
    const dir = join(root, ".claude/rules/ai-context");
    const keep = new Set<string>();
    for (const r of scoped) {
      const file = join(dir, `${r.area}.md`);
      keep.add(file);
      write(file, `---\npaths:\n${yamlList(r.paths)}\n---\n${body(r, root, "claude")}`, changed, root);
    }
    prune(dir, keep, changed, root);
  }

  if (clis.includes("copilot")) {
    const dir = join(root, ".github/instructions");
    const keep = new Set<string>();
    for (const r of scoped) {
      const file = join(dir, `ai-${r.area}.instructions.md`);
      keep.add(file);
      write(file, `---\napplyTo: "${[...new Set(r.paths.flatMap(expandBraces))].join(",")}"\n---\n${body(r, root, "copilot")}`, changed, root);
    }
    prune(dir, keep, changed, root, /^ai-.*\.instructions\.md$/);
  }

  syncAgentsMd(root, rules, changed);
  syncBmad(root, rules, changed, skipped);
  return { changed, skipped };
}
