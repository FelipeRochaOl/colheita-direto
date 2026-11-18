import { probe, run, runInteractive, versionOf } from "./process.ts";
import type { AgentAdapter } from "./types.ts";

/**
 * Codex CLI 0.155: `codex exec` (headless). The `workspace-write` sandbox lets
 * it edit the repo and run commands inside it; network is enabled so it can
 * dependency installs. No approval/sandbox bypass.
 */
export const codexAdapter: AgentAdapter = {
  name: "codex",
  label: "Codex CLI",
  async isAvailable() {
    const version = await versionOf("codex");
    if (!version.ok) return version;
    const auth = await probe(["codex", "login", "status"]);
    if (!auth || auth.code !== 0) return { ok: false, reason: "not logged in (run `codex login`)" };
    return version;
  },
  execute({ task, cwd, interactive }) {
    const sandbox = ["-C", cwd, "-s", "workspace-write", "-c", "sandbox_workspace_write.network_access=true"];
    // Interactive: `codex [OPTIONS] "<prompt>"` opens the TUI; `on-request` lets it
    // ask you before anything outside the sandbox.
    return interactive
      ? runInteractive("codex", ["codex", ...sandbox, "-a", "on-request", task], cwd)
      : run("codex", ["codex", "exec", ...sandbox, task], cwd);
  },
};
