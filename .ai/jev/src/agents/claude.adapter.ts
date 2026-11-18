import { allowedCommands, loadPolicySync } from "../policy.ts";
import { probe, run, runInteractive, versionOf } from "./process.ts";
import type { AgentAdapter } from "./types.ts";

/**
 * Claude Code 2.x: `claude -p` (headless). `acceptEdits` auto-approves file
 * edits and filesystem commands (rm, mv, cp, mkdir, touch) inside the working
 * directory; Bash is pre-approved only for the dev commands in
 * `permissions.commands` (.ai/policy.yaml), and commit/push are denied.
 * `permissions.chrome: true` turns on Claude in Chrome (pre-approved, `-p` cannot prompt).
 */
const BASE = [
  "Read", "Edit", "Write", "Glob", "Grep", "TodoWrite",
  "Bash(ls *)", "Bash(mkdir *)",
  "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)", "Bash(git show*)",
  // Comandos só de leitura do kit (contexto, roteamento, memória, grafo).
  "Bash(./ai rules*)", "Bash(./ai areas*)", "Bash(./ai doctor*)", "Bash(./ai scripts*)", "Bash(./ai --dry-run *)",
  "Bash(ai-memory search *)", "Bash(ai-memory read-page *)", "Bash(ai-memory handoffs*)",
  "Bash(graphify path *)", "Bash(graphify explain *)",
];
const DENIED = ["Bash(git commit*)", "Bash(git push*)", "Bash(git reset*)", "Bash(git checkout*)"];

export const claudeAdapter: AgentAdapter = {
  name: "claude",
  label: "Claude Code",
  async isAvailable() {
    const version = await versionOf("claude");
    if (!version.ok) return version;
    const auth = await probe(["claude", "auth", "status"]);
    if (auth && /"loggedIn":\s*false/.test(auth.out)) {
      return { ok: false, reason: "not logged in (run `claude auth login`)" };
    }
    return version;
  },
  execute({ task, cwd, interactive }) {
    const chrome = loadPolicySync().permissions?.chrome === true;
    const allowed = [
      ...BASE,
      ...allowedCommands(!interactive).flatMap((c) => [`Bash(${c})`, `Bash(${c} *)`]),
      ...(chrome ? ["mcp__claude-in-chrome"] : []),
    ];
    const permissions = [
      ...(chrome ? ["--chrome"] : []),
      "--permission-mode", "acceptEdits",
      "--allowedTools", ...allowed,
      "--disallowedTools", ...DENIED,
    ];
    // Interactive: `claude [options] "<prompt>"` opens the TUI with the prompt already sent.
    // Options go first so the variadic tool lists don't swallow the prompt.
    return interactive
      ? runInteractive("claude", ["claude", ...permissions, "--", task], cwd)
      : run("claude", ["claude", "-p", task, ...permissions], cwd);
  },
};
