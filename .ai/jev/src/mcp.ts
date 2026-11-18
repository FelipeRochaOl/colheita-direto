#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { graphContext } from "./graph.ts";
import { type Judgment, assess } from "./jev.ts";
import { loadPolicy } from "./policy.ts";

/**
 * Jev MCP server (stdio) shared by Claude Code, Codex and Copilot.
 * Each tool returns a compact JSON decision — never code.
 */

const server = new McpServer({ name: "jev", version: "0.1.0" });

const input = z.object({
  task: z.string().min(1).describe("Short description of the task or change"),
});

function register(name: string, description: string, judgments: Judgment[], withContext: boolean) {
  server.registerTool(name, { description, inputSchema: input }, async ({ task }) => {
    try {
      const policy = await loadPolicy();
      const context = await graphContext(task, policy);
      const assessment = await assess(task, context, policy, judgments);
      // BMAD workflow proportional to the risk, same as `./ai`.
      const level = assessment.risk?.level;
      const workflow = withContext && level ? { level, instruction: policy.workflow?.[level] ?? null } : undefined;
      const payload = withContext ? { context: context.files, ...assessment, workflow } : assessment;
      return { content: [{ type: "text", text: JSON.stringify(payload) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Jev unavailable: ${message}` }], isError: true };
    }
  });
}

register(
  "jev_route_task",
  "Pick the coding agent (codex | claude | copilot) for a task and return the minimal Graphify file context plus risk, tests, review and the workflow to follow (BMAD level by risk). Call before non-trivial work.",
  ["route", "risk", "tests", "review"],
  true,
);
register("jev_risk_score", "Score a change's risk: low | moderate | high | critical.", ["risk"], false);
register("jev_needs_tests", "Decide the test level a change needs: none | unit | integration | e2e.", ["tests"], false);
register("jev_review_required", "Decide whether a change needs human review before merging.", ["review"], false);

await server.connect(new StdioServerTransport());
