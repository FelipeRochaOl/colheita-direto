import { claudeAdapter } from "./claude.adapter.ts";
import { codexAdapter } from "./codex.adapter.ts";
import { copilotAdapter } from "./copilot.adapter.ts";
import type { AgentAdapter, AgentExecutionResult, AgentName } from "./types.ts";

export const ADAPTERS: Record<AgentName, AgentAdapter> = {
  claude: claudeAdapter,
  codex: codexAdapter,
  copilot: copilotAdapter,
};

export const isAgentName = (name: string): name is AgentName => name in ADAPTERS;

export function buildPrompt(task: string, root: string, context: string, workflow?: string): string {
  return `TASK:
${task}

PROJECT:
${root}

POLICY:
Follow the project AGENTS.md.

CONTEXT:
${context || "(no graph context — inspect the project as needed)"}

WORKFLOW:
${workflow || "Implement directly. Do not write planning documents or run multi-step workflows."}

INSTRUCTIONS:
Work directly on the project.
Inspect any additional files you need.
Make the requested changes.
Validate the result.
Do not commit.
Do not push.`;
}

export interface ExecutionOutcome {
  result?: AgentExecutionResult;
  skipped: { agent: AgentName; reason: string }[];
}

/**
 * Tries agents in order. Falls back only when an agent can't run (not
 * installed, not logged in, out of credits, disabled); a real task failure
 * from an agent that started is returned as-is.
 */
export async function executeWithFallback(
  order: AgentName[],
  disabled: Set<string>,
  options: { task: string; cwd: string; context: string; workflow?: string; interactive: boolean },
  log: (line: string) => void,
  /** A run that already changed files is never retried with another agent. */
  hasChanges: () => Promise<boolean>,
): Promise<ExecutionOutcome> {
  const skipped: ExecutionOutcome["skipped"] = [];
  const prompt = buildPrompt(options.task, options.cwd, options.context, options.workflow);

  for (const name of order) {
    const adapter = ADAPTERS[name];
    const skip = (reason: string) => {
      skipped.push({ agent: name, reason });
      log(`${adapter.label} unavailable: ${reason}. Falling back to next available agent.`);
    };

    if (disabled.has(name)) {
      skip("disabled (--no / AI_UNAVAILABLE_AGENTS)");
      continue;
    }
    const availability = await adapter.isAvailable();
    if (!availability.ok) {
      skip(availability.reason ?? "not available");
      continue;
    }

    log(`\nLaunching ${adapter.label}${availability.version ? ` ${availability.version}` : ""}...\n`);
    const result = await adapter.execute({ task: prompt, cwd: options.cwd, context: options.context, interactive: options.interactive });
    if (result.unavailable && !(await hasChanges())) {
      skip(`CLI reported an availability error (exit ${result.exitCode})`);
      continue;
    }
    return { result, skipped };
  }
  return { skipped };
}
