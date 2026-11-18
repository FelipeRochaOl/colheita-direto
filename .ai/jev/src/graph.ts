import { resolve } from "node:path";
import { ROOT, type Policy } from "./policy.ts";

/**
 * Minimal context from the Graphify output (`graphify-out/graph.json`), read
 * offline: keyword hits on node labels/paths, plus one hop of neighbors, ranked
 * per file. No source files are opened — that's the point.
 */

interface GraphNode {
  id: string;
  label?: string;
  norm_label?: string;
  source_file?: string;
  community_name?: string;
  file_type?: string;
}

interface GraphLink {
  source: string;
  target: string;
}

export interface GraphContext {
  /** False when graphify-out/graph.json is missing (run /graphify). */
  available: boolean;
  files: { path: string; score: number; symbols: string[] }[];
}

const STOPWORDS = new Set(
  "the and for with from into that this when then fix add bug make update change " +
    "corrija corrigir adicione adicionar crie criar ajuste ajustar para com que uma dos das nos nas pelo pela quando " +
    "erro problema melhore melhorar implemente implementar mude mudar".split(" "),
);
const NEIGHBOR_WEIGHT = 0.3;
const MAX_SYMBOLS = 4;

/** Lowercase, strip accents, split camelCase and non-alphanumerics. */
function tokenize(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

function queryTerms(task: string, synonyms: Record<string, string>): string[] {
  const terms = new Set<string>();
  for (const token of tokenize(task)) {
    if (STOPWORDS.has(token)) continue;
    terms.add(token);
    const synonym = synonyms[token];
    if (synonym) terms.add(synonym);
  }
  return [...terms];
}

/** Shared-prefix match, so "diagnostic" hits "diagnostics" and "auth" hits "authentication". */
function matches(term: string, token: string): boolean {
  const len = Math.min(term.length, token.length);
  return len >= 4 ? term.slice(0, len) === token.slice(0, len) : term === token;
}

function scoreNode(node: GraphNode, terms: string[]): number {
  const tokens = new Set(
    tokenize(`${node.label ?? ""} ${node.source_file ?? ""} ${node.community_name ?? ""}`),
  );
  let score = 0;
  for (const term of terms) {
    for (const token of tokens) {
      if (matches(term, token)) {
        score += 1;
        break;
      }
    }
  }
  return score;
}

export async function graphContext(task: string, policy: Policy): Promise<GraphContext> {
  const file = Bun.file(resolve(ROOT, policy.graph.path));
  if (!(await file.exists())) return { available: false, files: [] };

  const graph = (await file.json()) as { nodes: GraphNode[]; links: GraphLink[] };
  const terms = queryTerms(task, policy.graph.synonyms ?? {});
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  const direct = new Map<string, number>();
  for (const node of graph.nodes) {
    if (!node.source_file) continue;
    const score = scoreNode(node, terms);
    if (score > 0) direct.set(node.id, score);
  }

  const fileScores = new Map<string, { score: number; symbols: Map<string, number> }>();
  const credit = (node: GraphNode | undefined, score: number) => {
    if (!node?.source_file) return;
    const entry = fileScores.get(node.source_file) ?? { score: 0, symbols: new Map() };
    entry.score += score;
    if (node.file_type === "code" && node.label) {
      entry.symbols.set(node.label, Math.max(entry.symbols.get(node.label) ?? 0, score));
    }
    fileScores.set(node.source_file, entry);
  };

  for (const [id, score] of direct) credit(byId.get(id), score);
  for (const link of graph.links) {
    const s = direct.get(link.source);
    const t = direct.get(link.target);
    if (s) credit(byId.get(link.target), s * NEIGHBOR_WEIGHT);
    if (t) credit(byId.get(link.source), t * NEIGHBOR_WEIGHT);
  }

  const files = [...fileScores]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, policy.graph.max_files)
    .map(([path, { score, symbols }]) => ({
      path,
      score: Math.round(score * 10) / 10,
      symbols: [...symbols]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_SYMBOLS)
        .map(([label]) => label),
    }));

  return { available: true, files };
}
