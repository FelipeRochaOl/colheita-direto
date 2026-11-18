import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isProjectFile, pathMatches } from "./match.ts";
import { loadPrefs, loadRules } from "./rules.ts";
import { loadConfig } from "./sync.ts";
import { daysSinceLastInsight } from "./insights.ts";

/**
 * Mede o que entra em TODA sessão (custo fixo de token) e aponta regras vazias,
 * áreas cujo `paths` não casa com nenhum arquivo do repo e limites estourados.
 */

const tokens = (chars: number) => Math.round(chars / 4);
const read = (f: string) => (existsSync(f) && statSync(f).isFile() ? readFileSync(f, "utf8") : "");

/** CLAUDE.md com os `@imports` resolvidos (até 4 níveis, como o Claude Code). */
function withImports(file: string, depth = 0, seen = new Set<string>()): number {
  if (depth > 4 || seen.has(file)) return 0;
  seen.add(file);
  const text = read(file);
  let size = text.length;
  for (const m of text.matchAll(/^@(\S+)\s*$/gm)) size += withImports(resolve(dirname(file), m[1]!), depth + 1, seen);
  return size;
}

function unscopedClaudeRules(dir: string): number {
  if (!existsSync(dir)) return 0;
  let size = 0;
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    if (!f.endsWith(".md")) continue;
    const text = read(join(dir, f));
    if (!/^---[\s\S]*?\npaths:/m.test(text)) size += text.length;
  }
  return size;
}

function skillDescriptions(dir: string): { count: number; chars: number } {
  if (!existsSync(dir)) return { count: 0, chars: 0 };
  let count = 0;
  let chars = 0;
  for (const name of readdirSync(dir)) {
    const text = read(join(dir, name, "SKILL.md"));
    if (!text) continue;
    count++;
    chars += (/^description:\s*(.*)$/m.exec(text)?.[1] ?? "").length + name.length;
  }
  return { count, chars };
}

function mcpCount(root: string): number {
  try {
    return Object.keys((JSON.parse(read(join(root, ".mcp.json"))) as { mcpServers?: object }).mcpServers ?? {}).length;
  } catch {
    return 0;
  }
}

function repoFiles(root: string): string[] {
  const r = Bun.spawnSync(["git", "ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root });
  return r.exitCode === 0 ? r.stdout.toString().split("\n").filter(Boolean).filter(isProjectFile) : [];
}

export function doctor(root: string): number {
  const { clis } = loadConfig(root);
  const warn: string[] = [];
  const out: string[] = ["Custo fixo por sessão (≈ tokens, 4 caracteres = 1 token):"];
  const agentsMd = read(join(root, "AGENTS.md"));

  const row = (cli: string, parts: [string, number][]) => {
    const total = parts.reduce((s, [, n]) => s + n, 0);
    out.push(`  ${cli.padEnd(8)} ${String(tokens(total)).padStart(6)}  (${parts.filter(([, n]) => n).map(([k, n]) => `${k} ${tokens(n)}`).join(", ") || "nada"})`);
    if (tokens(total) > 4000) warn.push(`${cli}: mais de 4000 tokens fixos por sessão; enxugue o AGENTS.md ou mova trechos para .ai/rules`);
  };

  const claudeSkills = skillDescriptions(join(root, ".claude/skills"));
  const agentSkills = skillDescriptions(join(root, ".agents/skills"));
  if (clis.includes("claude")) {
    const claudeMd = existsSync(join(root, "CLAUDE.md")) ? withImports(join(root, "CLAUDE.md")) : agentsMd.length;
    row("claude", [["CLAUDE.md+imports", claudeMd], ["rules sem paths", unscopedClaudeRules(join(root, ".claude/rules"))], [`${claudeSkills.count} skills`, claudeSkills.chars]]);
  }
  if (clis.includes("codex")) row("codex", [["AGENTS.md", agentsMd.length], [`${agentSkills.count} skills`, agentSkills.chars]]);
  if (clis.includes("copilot")) {
    row("copilot", [
      ["AGENTS.md", agentsMd.length],
      ["CLAUDE.md", read(join(root, "CLAUDE.md")).length],
      ["copilot-instructions", read(join(root, ".github/copilot-instructions.md")).length],
      [`${agentSkills.count} skills`, agentSkills.chars],
    ]);
  }
  const mcps = mcpCount(root);
  out.push(`  MCP servers no .mcp.json: ${mcps} (cada um soma as descrições das tools)`);
  if (mcps > 0) warn.push(`${mcps} servidor(es) MCP no .mcp.json: se houver CLI equivalente (./ai --json, ai-memory search), prefira a CLI em bloco de código`);

  const lines = agentsMd.split("\n").length;
  if (lines > 150) warn.push(`AGENTS.md tem ${lines} linhas (> 150): mova regras de área para .ai/rules`);
  if (claudeSkills.count > 40) warn.push(`${claudeSkills.count} skills em .claude/skills: desligue as que não usa (skillOverrides)`);

  const rules = loadRules(root);
  const files = repoFiles(root);
  out.push("", `Áreas (${rules.length}):`);
  for (const r of rules) {
    const hits = r.paths.length ? files.filter((f) => pathMatches(r, f)).length : -1;
    const status = [r.body ? `${r.body.length} car.` : "vazia", hits >= 0 ? `${hits} arquivos` : "só por termos"].join(", ");
    out.push(`  ${r.area.padEnd(14)} ${status}`);
    if (!r.body) warn.push(`${r.file} está vazia: escreva as regras do time ou apague o arquivo`);
    if (hits === 0 && files.length) warn.push(`${r.file}: nenhum arquivo do repo casa com paths ${JSON.stringify(r.paths)}`);
  }

  const prefs = loadPrefs();
  const nPrefs = prefs.general.length + Object.values(prefs.areas).flat().length;
  out.push("", `Preferências pessoais: ${prefs.file} (${nPrefs ? `${nPrefs} itens` : "não encontrado ou vazio"})`);

  if (!existsSync(join(root, "graphify-out/graph.json")) && existsSync(join(root, ".ai/jev"))) {
    warn.push("graphify-out/graph.json não existe: rode `graphify update .` para o ./ai ter contexto do código");
  }

  const since = daysSinceLastInsight(root);
  out.push("", `Último ./ai insights: ${since === null ? "nunca" : `há ${since} dias`}`);
  if (since === null || since > 14) warn.push("rode `./ai insights --ask <agente>` para a LLM propor melhorias com base no uso");

  out.push("", warn.length ? "Avisos:" : "Nenhum aviso.", ...warn.map((w) => `  ! ${w}`));
  console.log(out.join("\n"));
  return warn.length ? 1 : 0;
}
