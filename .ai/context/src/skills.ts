import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Agent = "claude" | "codex" | "copilot" | "any";

/** Skills que já vêm no Claude Code (não existem como pasta). */
const CLAUDE_BUILTIN = new Set(["security-review", "code-review", "simplify"]);

function skillDirs(root: string, agent: Agent): string[] {
  const home = homedir();
  const project = [join(root, ".claude/skills"), join(root, ".agents/skills"), join(root, ".github/skills")];
  const user: Record<Exclude<Agent, "any">, string[]> = {
    claude: [join(home, ".claude/skills")],
    codex: [join(home, ".codex/skills"), join(home, ".agents/skills")],
    copilot: [join(home, ".copilot/skills"), join(home, ".agents/skills")],
  };
  return agent === "any" ? [...project, ...Object.values(user).flat()] : [...project, ...user[agent]];
}

function enabledClaudePlugins(root: string): string[] {
  const files = [join(homedir(), ".claude/settings.json"), join(root, ".claude/settings.json"), join(root, ".claude/settings.local.json")];
  const out: string[] = [];
  for (const f of files) {
    try {
      const s = JSON.parse(readFileSync(f, "utf8")) as { enabledPlugins?: Record<string, boolean> };
      for (const [k, v] of Object.entries(s.enabledPlugins ?? {})) if (v) out.push(k.split("@")[0]!);
    } catch {
      /* arquivo ausente ou inválido */
    }
  }
  return out;
}

/**
 * Filtra as skills de uma regra para as que existem para este agente:
 * - `nome` → pasta `<skills>/<nome>/SKILL.md` no projeto ou no usuário;
 * - `claude:nome` → embutida no Claude Code (só aparece para o Claude);
 * - `plugin:nome` → plugin do Claude habilitado em `enabledPlugins`.
 */
export function availableSkills(root: string, names: string[], agent: Agent): string[] {
  const dirs = skillDirs(root, agent);
  let plugins: string[] | undefined;
  return names.filter((name) => {
    if (name.startsWith("claude:")) return (agent === "claude" || agent === "any") && CLAUDE_BUILTIN.has(name.slice(7));
    if (name.startsWith("plugin:")) {
      if (agent !== "claude" && agent !== "any") return false;
      plugins ??= enabledClaudePlugins(root);
      return plugins.includes(name.slice(7));
    }
    return dirs.some((d) => existsSync(join(d, name, "SKILL.md")));
  }).map((n) => n.replace(/^(claude|plugin):/, ""));
}
