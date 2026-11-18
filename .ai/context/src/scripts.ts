import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { prefsPath } from "./rules.ts";

/**
 * Biblioteca de scripts (codeblocks reutilizáveis) — em vez de o agente reescrever
 * o mesmo script a cada sessão, ele lista, reusa e salva aqui:
 * - `.ai/scripts/`              do time, versionados no git (precedência);
 * - `~/.config/ai-kit/scripts/` pessoais, valem em todo projeto.
 * Cabeçalho nas primeiras linhas: `# desc: ...` e `# uso: ...` (ou `// desc:` em ts/js).
 */

export interface Script {
  name: string;
  file: string;
  scope: "projeto" | "pessoal";
  desc: string;
  usage: string;
}

const RUNNERS: Record<string, string[]> = {
  ".sh": ["bash"],
  ".py": ["python3"],
  ".ts": ["bun"],
  ".js": ["bun"],
  ".mjs": ["bun"],
};

export const personalScriptsDir = () => join(prefsPath(), "..", "scripts");

function header(file: string, key: string): string {
  const head = readFileSync(file, "utf8").split("\n").slice(0, 15).join("\n");
  return new RegExp(`^\\s*(?:#|//)\\s*${key}:\\s*(.+)$`, "mi").exec(head)?.[1]?.trim() ?? "";
}

function scan(dir: string, scope: Script["scope"]): Script[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => RUNNERS[extname(f)] && !f.startsWith("_"))
    .map((f) => {
      const file = join(dir, f);
      return { name: f.slice(0, -extname(f).length), file, scope, desc: header(file, "desc"), usage: header(file, "uso") };
    });
}

/** Scripts do projeto primeiro; um pessoal com o mesmo nome fica escondido. */
export function listScripts(root: string): Script[] {
  const project = scan(join(root, ".ai/scripts"), "projeto");
  const names = new Set(project.map((s) => s.name));
  return [...project, ...scan(personalScriptsDir(), "pessoal").filter((s) => !names.has(s.name))].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function runScript(root: string, name: string, args: string[]): number {
  const script = listScripts(root).find((s) => s.name === name);
  if (!script) {
    console.error(`Script "${name}" não encontrado. Veja \`./ai scripts\`.`);
    return 1;
  }
  const proc = Bun.spawnSync([...RUNNERS[extname(script.file)]!, script.file, ...args], {
    cwd: root,
    stdio: ["inherit", "inherit", "inherit"],
  });
  return proc.exitCode ?? 1;
}
