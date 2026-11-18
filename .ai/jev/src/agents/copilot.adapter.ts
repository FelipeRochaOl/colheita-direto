import { allowedCommands } from "../policy.ts";
import { run, runInteractive, versionOf } from "./process.ts";
import type { AgentAdapter } from "./types.ts";

/**
 * GitHub Copilot CLI 1.0: `copilot -p` (non-interactive) with an explicit
 * --allow-tool list (write, the dev commands in `permissions.commands`,
 * ls, rm/mv/cp/mkdir/touch, git status/diff); file access stays limited to the cwd
 * (no --allow-all-paths / --yolo), commit/push are denied, and `--no-ask-user`
 * keeps it from blocking on questions.
 */
// rm/mv/cp só no interativo: no headless, junto com `write`, ampliariam o estrago sem supervisão.
const FILE_OPS = ["rm", "mv", "cp"];
const BASE_SHELL = [
  "ls", "mkdir", "touch", "git status", "git diff",
  // Comandos só de leitura do kit; `./ai` puro fica de fora (lança agente e commita).
  "./ai rules", "./ai areas", "./ai doctor", "./ai scripts",
  "ai-memory search", "ai-memory read-page", "ai-memory handoffs", "graphify path", "graphify explain",
];

export const copilotAdapter: AgentAdapter = {
  name: "copilot",
  label: "GitHub Copilot CLI",
  isAvailable: () => versionOf("copilot"),
  execute({ task, cwd, interactive }) {
    const shell = [...allowedCommands(!interactive), ...BASE_SHELL, ...(interactive ? FILE_OPS : [])];
    const permissions = [
      "--allow-tool", "write",
      ...shell.flatMap((c) => ["--allow-tool", `shell(${c})`]),
      "--deny-tool", "shell(git commit)",
      "--deny-tool", "shell(git push)",
    ];
    // Interactive: `copilot -i "<prompt>"` opens the TUI with the prompt running;
    // tools outside the allowlist are asked to you instead of denied.
    return interactive
      ? runInteractive("copilot", ["copilot", "-i", task, ...permissions], cwd)
      : run("copilot", ["copilot", "-p", task, ...permissions, "--no-ask-user"], cwd);
  },
};
