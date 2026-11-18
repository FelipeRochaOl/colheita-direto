#!/usr/bin/env bun
import { ADAPTERS, executeWithFallback, isAgentName } from "./agents/executor.ts";
import { changesSince, commitAndPush, diffStat, snapshot } from "./agents/git.ts";
import type { AgentName } from "./agents/types.ts";
import { graphContext } from "./graph.ts";
import { type Judgment, assess } from "./jev.ts";
import { ROOT, loadPolicy } from "./policy.ts";
import { areaRules } from "./rules.ts";

/**
 * `ai "task description" [--json] [--dry-run] [--headless] [--agent <name>] [--no <agent>] [--workflow <level>] [--no-commit] [--no-push]`
 * Graphify → minimal context → Jev → agent, risk, tests and review → run the agent CLI → commit and push.
 */

const AGENT_NAMES: Record<string, string> = {
  codex: "Codex",
  claude: "Claude",
  copilot: "Copilot",
};
const agentName = (key: string) => AGENT_NAMES[key] ?? key;

const args = process.argv.slice(2);

const HELP = `Usage: ./ai "task description" [--dry-run] [--headless] [--agent <name>] [--no <agent>] [--workflow <level>] [--no-commit] [--no-push] [--json] [--help]

Routes a task through Graphify context + Jev (TypeSafe) to pick an agent
(Codex/Claude/Copilot), reports risk, test and review requirements, then
runs the selected agent's CLI on the repo root (falling back to the next
available agent when one can't run). After a successful run it commits
only the files the agent changed and pushes the branch (\`git\` in
.ai/policy.yaml).

Options:
  --dry-run       Route and report only; no agent CLI is executed
  --headless      Run the agent non-interactively with streamed output
                  (default when not in a terminal). In a terminal the agent's
                  own TUI opens with the prompt, so you can answer questions,
                  switch models, use plan mode, etc.
  --agent <name>  Run this agent (codex|claude|copilot), ignoring Jev routing
  --no <agent>    Agent without credit (codex|claude|copilot); repeatable.
                  Also read from AI_UNAVAILABLE_AGENTS="codex,copilot".
  --workflow <level>
                  Use this workflow level (low|moderate|high|critical|none)
                  instead of the one Jev's risk picks (\`workflow\` in
                  .ai/policy.yaml; none = implement directly)
  --no-commit     Leave the agent's changes uncommitted (implies --no-push)
  --no-push       Commit, but don't push
  --json          Emit the routing report as JSON (implies --dry-run)
  --help, -h      Show this help message

Examples:
  ./ai "add pagination to the orders list"
  ./ai --dry-run "refactor the auth middleware"
  ./ai --agent claude "fix the login redirect"
  ./ai --no codex "fix the login redirect"`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const json = args.includes("--json");
const dryRun = json || args.includes("--dry-run");
const noCommit = args.includes("--no-commit");
const noPush = args.includes("--no-push");
const interactive = !args.includes("--headless") && !!process.stdin.isTTY && !!process.stdout.isTTY;
const unavailable = new Set(
  (process.env.AI_UNAVAILABLE_AGENTS ?? "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean),
);
let forcedAgent: AgentName | undefined;
let forcedWorkflow: string | undefined;
const taskWords: string[] = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (["--json", "--dry-run", "--headless", "--no-commit", "--no-push"].includes(arg)) continue;
  if (arg === "--no") {
    const agent = args[++i];
    if (agent) unavailable.add(agent.toLowerCase());
    continue;
  }
  if (arg === "--workflow") {
    forcedWorkflow = args[++i]?.toLowerCase() ?? "";
    continue;
  }
  if (arg === "--agent") {
    const agent = args[++i]?.toLowerCase() ?? "";
    if (!isAgentName(agent)) {
      console.error(`Unknown agent "${agent}". Use codex, claude or copilot.`);
      process.exit(1);
    }
    forcedAgent = agent;
    continue;
  }
  taskWords.push(arg);
}
const task = taskWords.join(" ").trim();

if (!task) {
  console.log(HELP);
  process.exit(1);
}

const policy = await loadPolicy();
if (forcedWorkflow !== undefined && forcedWorkflow !== "none" && !policy.workflow?.[forcedWorkflow]) {
  console.error(`Unknown workflow "${forcedWorkflow}". Use ${[...Object.keys(policy.workflow ?? {}), "none"].join(", ")}.`);
  process.exit(1);
}
const context = await graphContext(task, policy);

// With --agent, Jev still judges risk/tests/review but does not route.
const judgments: Judgment[] = forcedAgent ? ["risk", "tests", "review"] : ["route", "risk", "tests", "review"];
let assessment;
try {
  assessment = await assess(task, context, policy, judgments);
} catch (error) {
  console.error(
    `Jev unavailable: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(2);
}

// If the chosen agent has no credit, fall back to the most probable available one.
let fallbackFrom: string | undefined;
const { route: jevRoute } = assessment;
if (!forcedAgent && jevRoute && unavailable.has(jevRoute.selected)) {
  // probabilities are sorted highest → lowest by `assess`.
  const next = Object.keys(jevRoute.probabilities).find(
    (agent) => !unavailable.has(agent),
  );
  if (!next) {
    console.error(
      `No agent available: ${[...unavailable].join(", ")} without credit.`,
    );
    process.exit(3);
  }
  fallbackFrom = jevRoute.selected;
  jevRoute.selected = next;
}

// BMAD workflow proportional to the risk (or the --workflow override).
const workflowLevel = forcedWorkflow ?? assessment.risk?.level;
const workflow = workflowLevel && workflowLevel !== "none" ? policy.workflow?.[workflowLevel] : undefined;

if (json) {
  console.log(
    JSON.stringify({ task, context, ...assessment, workflow: { level: workflowLevel ?? "none", instruction: workflow ?? null }, fallbackFrom }, null, 2),
  );
  process.exit(0);
}

const lines: string[] = [];
if (!context.available) {
  lines.push(
    "Graph context: graphify-out/graph.json not found (run /graphify)",
  );
} else {
  lines.push(`Graph context: ${context.files.length} arquivos relevantes`);
  if (!context.files.length)
    lines.push(
      "  (no graph match — use one targeted Graphify query before searching)",
    );
  for (const file of context.files) {
    const symbols = file.symbols.length ? `  (${file.symbols.join(", ")})` : "";
    lines.push(`  ${file.path}${symbols}`);
  }
}

const { route, risk, tests, review } = assessment;
if (forcedAgent) {
  lines.push("", `Selected: ${agentName(forcedAgent)} (--agent, Jev routing skipped)`);
} else if (route) {
  lines.push("", "Jev routing:");
  for (const [agent, p] of Object.entries(route.probabilities)) {
    lines.push(`${agentName(agent)}: ${p.toFixed(2)}`);
  }
  const fallback = fallbackFrom
    ? ` (${agentName(fallbackFrom)} without credit)`
    : "";
  lines.push("", `Selected: ${agentName(route.selected)}${fallback}`);
}
if (risk) lines.push(`Risk: ${risk.level}`);
if (tests)
  lines.push(
    `Tests: ${tests.level === "none" ? "none" : `${tests.level} required`}`,
  );
lines.push(`Workflow: ${workflowLevel ?? "none"}${forcedWorkflow ? " (--workflow)" : ""} — ${workflow ?? "implement directly"}`);
if (review) {
  const why = review.forcedByRisk
    ? "forced by risk"
    : review.probability.toFixed(2);
  lines.push(
    `Review: ${review.required ? "required" : "not required"} (${why})`,
  );
}

console.log(lines.join("\n"));

if (dryRun) {
  console.log("\nDry run: no agent executed.");
  process.exit(0);
}

// Execution order: forced agent alone, or Jev's choice then the rest by probability.
const order: AgentName[] = forcedAgent
  ? [forcedAgent]
  : [route?.selected, ...Object.keys(route?.probabilities ?? {}), ...Object.keys(ADAPTERS)]
      .filter((a): a is AgentName => !!a && isAgentName(a))
      .filter((a, i, all) => all.indexOf(a) === i);

// Regras por área (.ai/rules) escolhidas por código: arquivos do grafo + termos da task.
const rules = await areaRules(task, context.files.map((f) => f.path));

const contextSummary = [
  ...context.files.map(({ path, symbols }) => `- ${path}${symbols.length ? ` (${symbols.join(", ")})` : ""}`),
  risk ? `Risk: ${risk.level}` : "",
  tests ? `Tests: ${tests.level}` : "",
  review ? `Human review: ${review.required ? "required" : "not required"}` : "",
  rules ? `\n${rules}` : "",
].filter(Boolean).join("\n");

const before = await snapshot(ROOT);
const { result, skipped } = await executeWithFallback(
  order,
  forcedAgent ? new Set() : unavailable,
  { task, cwd: ROOT, context: contextSummary, workflow, interactive },
  (line) => console.log(line),
  async () => (await changesSince(before, ROOT)).length > 0,
);

if (!result) {
  console.error(`\nNo agent could run: ${skipped.map((s) => `${agentName(s.agent)} (${s.reason})`).join("; ")}`);
  process.exit(3);
}

const label = ADAPTERS[result.agent].label;
console.log(
  result.exitCode === 0
    ? `\n${label} finished successfully.`
    : `\n${label} exited with code ${result.exitCode}${interactive ? "" : " (task error, no fallback)"}.`,
);

const changed = await changesSince(before, ROOT);
console.log("\nChanged files:");
console.log(changed.length ? changed.map((c) => c.line).join("\n") : "(none)");
const paths = changed.map((c) => c.path);
const stat = await diffStat(paths, ROOT);
if (stat) console.log(`\n${stat}`);

// Commit/push only what this run changed, and only when the agent succeeded.
const shouldCommit = (policy.git?.commit ?? false) && !noCommit;
const shouldPush = shouldCommit && (policy.git?.push ?? false) && !noPush;
let gitFailed = false;
if (!shouldCommit) {
  console.log("\nCommit: skipped (--no-commit or policy git.commit=false)");
} else if (result.exitCode !== 0) {
  console.log("\nCommit: skipped (agent did not finish successfully)");
} else if (!paths.length) {
  console.log("\nCommit: skipped (no changes)");
} else {
  const subject = `ai(${result.agent}): ${task.split("\n")[0]!.trim()}`;
  const body = [
    `Task: ${task}`,
    `Agent: ${label}`,
    risk ? `Risk: ${risk.level}` : "",
    tests ? `Tests: ${tests.level}` : "",
    `Workflow: ${workflowLevel ?? "none"}`,
    review ? `Human review: ${review.required ? "required" : "not required"}` : "",
  ].filter(Boolean).join("\n");
  const git = await commitAndPush(paths, {
    subject: subject.length > 72 ? `${subject.slice(0, 69)}...` : subject,
    body,
  }, shouldPush, ROOT);
  for (const commit of git.commits) console.log(`\nCommitted ${commit.path}: ${commit.sha}`);
  if (git.pushed) console.log(`Pushed: ${git.pushed}`);
  else if (git.ok && !git.commits.length) console.log("\nCommit: skipped (nothing left to commit)");
  else if (git.ok) console.log("Push: skipped (--no-push or policy git.push=false)");
  if (git.error) {
    gitFailed = true;
    console.error(`\n${git.error}`);
  }
  if (review?.required) console.log("Human review required: check the commit before merging.");
}

const exitCode = result.exitCode || (gitFailed ? 4 : 0);
console.log(`\nExit code: ${exitCode}`);
process.exit(exitCode);
