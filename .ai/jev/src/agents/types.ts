export type AgentName = "claude" | "codex" | "copilot";

export interface AgentExecuteOptions {
  /** Full prompt (task + project + policy + context + instructions). */
  task: string;
  cwd: string;
  context?: string;
  /** Open the agent's own TUI (stdio inherited) instead of a headless run. */
  interactive?: boolean;
}

export interface Availability {
  ok: boolean;
  version?: string;
  reason?: string;
}

export interface AgentExecutionResult {
  agent: AgentName;
  exitCode: number;
  /** stdout + stderr, kept only to classify availability errors. */
  output: string;
  /** True when the CLI failed for an availability reason (auth, credits, quota) — safe to fall back. */
  unavailable: boolean;
}

export interface AgentAdapter {
  name: AgentName;
  label: string;
  isAvailable(): Promise<Availability>;
  execute(options: AgentExecuteOptions): Promise<AgentExecutionResult>;
}
