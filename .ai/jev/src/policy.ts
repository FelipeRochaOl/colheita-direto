import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Repo root, independent of the cwd the CLI/MCP server was launched from:
 * `AI_ROOT` when set, otherwise the nearest ancestor that has `.ai/policy.yaml`.
 */
function findRoot(): string {
  if (process.env.AI_ROOT) return resolve(process.env.AI_ROOT);
  let dir = import.meta.dir;
  while (true) {
    if (existsSync(resolve(dir, ".ai/policy.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

export const ROOT = findRoot();

/** Shape of `.ai/policy.yaml` (only the fields code reads). */
export interface Policy {
  graph: { path: string; max_files: number; synonyms?: Record<string, string> };
  agents: Record<string, string>;
  /** Ordered lowest → highest. */
  risk: Record<string, string>;
  tests: Record<string, string>;
  review: { true: string; false: string; force_at_risk?: string };
  /** Workflow instruction per risk level, sent to the agent. */
  workflow?: Record<string, string>;
  /** What `ai` does with the agent's changes after a successful run. */
  git?: { commit?: boolean; push?: boolean };
  /** Commands the agents may run without asking (e.g. bun, npm, pytest). */
  permissions?: { commands?: string[]; chrome?: boolean; headless_commands?: boolean };
}

const parse = (text: string) => Bun.YAML.parse(text) as Policy;

export async function loadPolicy(): Promise<Policy> {
  return parse(await Bun.file(resolve(ROOT, ".ai/policy.yaml")).text());
}

/** Sync variant for the agent adapters (they only read `permissions`). */
export function loadPolicySync(): Policy {
  return parse(readFileSync(resolve(ROOT, ".ai/policy.yaml"), "utf8"));
}

/**
 * Interpretadores e executores de pacote liberados sem argumento fixo executam
 * qualquer código (ex.: `python -c` fazendo `git push`) e anulam a denylist.
 * Só invocações específicas são aceitas: `pytest`, `npm test`, `bun run build`...
 */
const BARE_RUNNERS = new Set([
  "node", "python", "python3", "bun", "bunx", "npx", "npm", "pnpm", "yarn",
  "uv", "uvx", "pip", "pip3", "pipx", "deno", "sh", "bash", "zsh", "env", "sudo",
  "java", "go", "cargo", "rustc", "ruby", "irb", "bundle", "gem", "rake",
  "mvn", "gradle", "./gradlew", "./mvnw", "dotnet", "php", "composer", "make",
]);

/** Formas que executam um programa arbitrário mesmo com subcomando. */
const OPEN_ENDED = /^(npm|pnpm|yarn|bun|uv) (run|exec|x|dlx)$|^(go|cargo|dotnet|gradle|\.\/gradlew) run\b|^bundle exec$|^(mvn|\.\/mvnw) exec\b|^bin\/rails (runner|console)\b/;

/**
 * Allowed dev commands from the policy; `git`, bare runners and shell metacharacters are dropped.
 * Headless (sem ninguém olhando): comandos como `npm test` executam scripts do projeto que o
 * agente pode editar, então só valem com `permissions.headless_commands: true` (opt-in).
 */
export function allowedCommands(headless = false): string[] {
  const perms = loadPolicySync().permissions;
  if (headless && perms?.headless_commands !== true) return [];
  return (perms?.commands ?? [])
    .map((c) => c.trim())
    .filter((c) => c && !c.startsWith("git") && !BARE_RUNNERS.has(c) && !/[;&|`$<>]/.test(c))
    .filter((c) => !OPEN_ENDED.test(c));
}
