import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isProjectFile, pathMatches } from "./match.ts";
import { loadPrefs, loadRules } from "./rules.ts";
import { listScripts } from "./scripts.ts";
import { readUsage } from "./usage.ts";

/**
 * `./ai insights` — melhoria contínua em duas etapas:
 * 1. CÓDIGO coleta sinais (zero token): uso das áreas, comandos repetidos pelo agente,
 *    arquivos quentes sem regra, chamadas MCP, scripts parados, custo fixo.
 * 2. A PRÓPRIA LLM (claude/codex/copilot, `--ask`) lê o relatório compacto e PROPÕE mudanças;
 *    nada é aplicado sem o dev pedir.
 * Saída em .ai/insights/ (fora do git: pode conter comandos da sua máquina).
 */

const DAYS = 30;

function sh(root: string, cmd: string[]): string {
  const r = Bun.spawnSync(cmd, { cwd: root });
  return r.exitCode === 0 ? r.stdout.toString() : "";
}

/** Comandos de shell que o Claude Code rodou neste projeto (transcripts locais). */
function claudeCommands(root: string): { bash: Map<string, number>; mcp: Map<string, number>; sessions: number } {
  const bash = new Map<string, number>();
  const mcp = new Map<string, number>();
  const dir = join(homedir(), ".claude/projects", root.replace(/[^a-zA-Z0-9]/g, "-"));
  let sessions = 0;
  if (!existsSync(dir)) return { bash, mcp, sessions };
  const since = Date.now() - DAYS * 864e5;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (!f.endsWith(".jsonl") || statSync(p).mtimeMs < since) continue;
    sessions++;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line.includes('"tool_use"')) continue;
      try {
        const content = (JSON.parse(line) as { message?: { content?: unknown } }).message?.content;
        if (!Array.isArray(content)) continue;
        for (const c of content as { type?: string; name?: string; input?: { command?: string } }[]) {
          if (c.type !== "tool_use" || !c.name) continue;
          if (c.name.startsWith("mcp__")) mcp.set(c.name, (mcp.get(c.name) ?? 0) + 1);
          if (c.name === "Bash" && c.input?.command) {
            const key = normalizeCommand(c.input.command);
            if (key) bash.set(key, (bash.get(key) ?? 0) + 1);
          }
        }
      } catch {
        /* linha parcial */
      }
    }
  }
  return { bash, mcp, sessions };
}

/** "cd x && FOO=1 npm run test -- --watch" → "npm run test". Ignora os comandos do próprio kit. */
function normalizeCommand(cmd: string): string {
  const line = cmd.split("\n")[0]!;
  const first = line.split(/&&|\|\||;|\|/).map((s) => s.trim()).find((s) => s && !/^cd\s/.test(s)) ?? "";
  const words = first
    .replace(/^(\w+=\S+\s+)+/, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9_.:@\/-]+$/.test(w) && !w.startsWith("-") && !w.startsWith("/"));
  const n = ["npm", "bun", "uv", "pnpm", "yarn", "go", "cargo", "mvn", "./mvnw", "./gradlew", "bundle"].includes(words[0] ?? "") ? 3 : 2;
  const key = words.slice(0, n).join(" ");
  return /^(\.\/ai|echo|cat|ls|pwd|true|sleep)\b/.test(key) ? "" : key;
}

const top = <K>(m: Map<K, number>, n: number, min = 1) =>
  [...m].filter(([, v]) => v >= min).sort((a, b) => b[1] - a[1]).slice(0, n);

export function collect(root: string): string {
  const rules = loadRules(root);
  const usage = readUsage(root, DAYS);
  const out: string[] = [`# Insights — ${new Date().toISOString().slice(0, 10)} (últimos ${DAYS} dias)`, ""];

  // 1. Uso das áreas (hook + ./ai rules)
  const byArea = new Map<string, number>();
  let injected = 0;
  for (const e of usage) {
    for (const a of e.areas ?? []) byArea.set(a, (byArea.get(a) ?? 0) + 1);
    injected += e.chars ?? 0;
  }
  out.push("## Áreas", `Injeções: ${usage.filter((e) => e.kind !== "run").length} (~${Math.round(injected / 4)} tokens no total)`);
  for (const r of rules) out.push(`- ${r.area}: ${byArea.get(r.area) ?? 0} usos${r.body ? "" : " (regra vazia)"}`);
  const unused = rules.filter((r) => !byArea.get(r.area)).map((r) => r.area);
  if (unused.length) out.push(`Nunca usadas: ${unused.join(", ")} → revisar keywords/paths ou remover.`);

  // 2. Arquivos quentes sem área
  const changed = new Map<string, number>();
  for (const f of sh(root, ["git", "log", `--since=${DAYS}.days`, "--name-only", "--pretty=format:"]).split("\n")) {
    if (f && isProjectFile(f)) changed.set(f, (changed.get(f) ?? 0) + 1);
  }
  const uncovered = new Map<string, number>();
  for (const [f, n] of changed) {
    if (rules.some((r) => pathMatches(r, f))) continue;
    const dir = f.includes("/") ? f.split("/").slice(0, 2).join("/") : f;
    uncovered.set(dir, (uncovered.get(dir) ?? 0) + n);
  }
  out.push("", "## Arquivos alterados com frequência sem regra de área");
  const unc = top(uncovered, 8, 2);
  out.push(...(unc.length ? unc.map(([d, n]) => `- ${d}: ${n} alterações`) : ["- nenhum"]));

  // 3. Comandos repetidos e MCP (Claude Code)
  const { bash, mcp, sessions } = claudeCommands(root);
  out.push("", `## Comandos repetidos pelo agente (Claude Code, ${sessions} sessões)`);
  const reps = top(bash, 12, 3);
  out.push(...(reps.length ? reps.map(([c, n]) => `- \`${c}\` ×${n}`) : ["- nenhum padrão (ou sem transcripts do Claude)"]));
  const mcps = top(mcp, 8);
  if (mcps.length) out.push("", "## Chamadas MCP", ...mcps.map(([t, n]) => `- ${t} ×${n}`));

  // 4. Scripts
  const runs = new Map<string, number>();
  for (const e of usage) if (e.script) runs.set(e.script, (runs.get(e.script) ?? 0) + 1);
  out.push("", "## Scripts (.ai/scripts + pessoais)");
  const scripts = listScripts(root);
  out.push(...(scripts.length ? scripts.map((s) => `- ${s.name} [${s.scope}]: ${runs.get(s.name) ?? 0} execuções — ${s.desc}`) : ["- nenhum"]));

  // 5. Custo fixo e preferências
  const agents = existsSync(join(root, "AGENTS.md")) ? readFileSync(join(root, "AGENTS.md"), "utf8") : "";
  const prefs = loadPrefs();
  out.push(
    "",
    "## Contexto fixo",
    `- AGENTS.md: ${agents.split("\n").length} linhas, ~${Math.round(agents.length / 4)} tokens por sessão`,
    `- Preferências pessoais: ${prefs.general.length} gerais, ${Object.values(prefs.areas).flat().length} por área`,
  );
  return out.join("\n");
}

/** Marca do pedido de insights: o hook de contexto ignora prompts com ela. */
export const INSIGHTS_MARK = "[ai-kit:insights]";

export function promptFor(report: string): string {
  return `${INSIGHTS_MARK} Você está melhorando o kit de agentes deste repositório (ver AGENTS.md e .ai/). Abaixo, sinais coletados por código.
Proponha melhorias concretas, cada uma com: o quê, por quê (cite o dado do relatório) e o texto/arquivo exato. Categorias:
1. Regras: criar/ajustar/remover .ai/rules/<área>.md (paths, keywords, regras curtas).
2. Scripts: comandos repetidos viram .ai/scripts/<nome>.sh|py|ts autocontidos com "# desc:" e "# uso:" (mostre o conteúdo).
3. Preferências: sugestões de \`./ai prefs add ...\` que você inferir do uso.
4. Economia de token: cortes no AGENTS.md, MCPs trocáveis por CLI, áreas inúteis.
Seja breve, no máximo 8 propostas, ordenadas por impacto. NÃO altere arquivos; só proponha.

${report}`;
}

/** Roda a LLM escolhida em modo só-leitura e devolve a resposta. */
export function askAgent(root: string, agent: string, prompt: string): string {
  const cmd: Record<string, string[]> = {
    claude: ["claude", "-p", prompt, "--allowedTools", "Read", "Glob", "Grep"],
    codex: ["codex", "exec", "-C", root, "-s", "read-only", prompt],
    copilot: ["copilot", "-p", prompt, "--no-ask-user"],
  };
  const c = cmd[agent];
  if (!c) throw new Error(`agente desconhecido: ${agent} (claude|codex|copilot)`);
  if (!Bun.which(c[0]!)) throw new Error(`${agent} não está no PATH`);
  const r = Bun.spawnSync(c, { cwd: root, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  if (r.exitCode !== 0) throw new Error(`${agent} saiu com código ${r.exitCode}: ${r.stderr.toString().slice(0, 300)}`);
  return r.stdout.toString().trim();
}

export function saveInsight(root: string, name: string, text: string): string {
  const dir = join(root, ".ai/insights");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${new Date().toISOString().slice(0, 10)}-${name}.md`);
  writeFileSync(file, `${text}\n`);
  return file.slice(root.length + 1);
}

/** Dias desde o último relatório (para o doctor lembrar). */
export function daysSinceLastInsight(root: string): number | null {
  const dir = join(root, ".ai/insights");
  if (!existsSync(dir)) return null;
  const dates = readdirSync(dir).map((f) => /^(\d{4}-\d{2}-\d{2})/.exec(f)?.[1]).filter(Boolean) as string[];
  if (!dates.length) return null;
  return Math.floor((Date.now() - Date.parse(dates.sort().at(-1)!)) / 864e5);
}
