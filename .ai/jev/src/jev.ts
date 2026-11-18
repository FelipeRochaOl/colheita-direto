import {
  type ChoiceResponse,
  type NoulResponse,
  type Questions,
  type ScoreCriteria,
  type ScoreResponse,
  TypeSafeClient,
  choice,
  noul,
  score,
} from "@typesafe-ai/sdk";
import type { GraphContext } from "./graph.ts";
import type { Policy } from "./policy.ts";

/**
 * Jev as a structured decision-maker only: it routes, scores risk and decides
 * on tests/review. It never generates code. All judgments go in a single
 * `systemOne` request, built from `.ai/policy.yaml`.
 */

export type Judgment = "route" | "risk" | "tests" | "review";

export interface Assessment {
  route?: { selected: string; probabilities: Record<string, number> };
  risk?: { level: string; score: number; confidence: number };
  tests?: { level: string; probabilities: Record<string, number> };
  review?: { required: boolean; probability: number; forcedByRisk: boolean };
}

function buildQuestions(policy: Policy, judgments: Set<Judgment>): Questions {
  const questions: Questions = {};
  if (judgments.has("route")) {
    questions.route = choice(
      "Which coding agent should implement this task? Pick the profile that best fits its scope and ambiguity.",
      policy.agents,
    );
  }
  if (judgments.has("risk")) {
    questions.risk = score(
      "How risky is this change to the working application?",
      Object.entries(policy.risk).map(([k, v]) => `${k}: ${v}`) as unknown as ScoreCriteria,
    );
  }
  if (judgments.has("tests")) {
    questions.tests = choice("What level of tests does this change need?", policy.tests);
  }
  if (judgments.has("review")) {
    questions.review = noul("Does this change need human code review before merging?", {
      true: policy.review.true,
      false: policy.review.false,
    });
  }
  return questions;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundAll(probabilities: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(probabilities)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => [k, round(v)]),
  );
}

export async function assess(
  task: string,
  context: GraphContext,
  policy: Policy,
  requested: Judgment[],
): Promise<Assessment> {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) throw new Error("TYPESAFE_API_KEY is not set (add it to the repo-root .env).");

  // Review is forced by high risk, so asking for review also asks for risk.
  const judgments = new Set(requested);
  if (judgments.has("review")) judgments.add("risk");

  const client = new TypeSafeClient({ apiKey });
  const { answers } = await client.systemOne({
    state: {
      task,
      relevant_files: context.files.map(({ path, symbols }) => ({ path, symbols })),
    },
    questions: buildQuestions(policy, judgments),
  });

  const result: Assessment = {};
  const riskLevels = Object.keys(policy.risk);

  const route = answers.route as ChoiceResponse | undefined;
  if (route) result.route = { selected: route.choice, probabilities: roundAll(route.probabilities) };

  const risk = answers.risk as ScoreResponse | undefined;
  if (risk) {
    const index = Math.min(Math.max(Math.round(risk.score), 0), riskLevels.length - 1);
    result.risk = {
      level: riskLevels[index] ?? "unknown",
      score: round(risk.score),
      confidence: round(risk.confidence),
    };
  }

  const tests = answers.tests as ChoiceResponse | undefined;
  if (tests) result.tests = { level: tests.choice, probabilities: roundAll(tests.probabilities) };

  const review = answers.review as NoulResponse | undefined;
  if (review) {
    const threshold = riskLevels.indexOf(policy.review.force_at_risk ?? "");
    const forcedByRisk =
      threshold >= 0 && !!result.risk && riskLevels.indexOf(result.risk.level) >= threshold;
    result.review = {
      required: forcedByRisk || review.noul >= 0.5,
      probability: round(review.noul),
      forcedByRisk,
    };
  }

  return result;
}
