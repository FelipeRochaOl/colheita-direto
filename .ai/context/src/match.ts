import { normalize, type Rule } from "./rules.ts";

export interface Match {
  rule: Rule;
  /** Por que a área entrou: arquivo que casou com `paths` ou palavra que casou com `keywords`. */
  byPath: string[];
  byKeyword: string[];
}

/** Caminhos citados no texto (ex.: "ajustar apps/web/src/Login.tsx"). */
export function filesInText(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/[\w@.~-]*(?:\/[\w@.-]+)+|[\w@-]+\.[a-z][a-z0-9]{0,5}\b/gi)) {
    const p = m[0].replace(/^\.\//, "");
    if (p.length > 2 && !/^https?:/.test(p)) out.add(p);
  }
  return [...out];
}

const globCache = new Map<string, InstanceType<typeof Bun.Glob>>();
function glob(pattern: string) {
  let g = globCache.get(pattern);
  if (!g) globCache.set(pattern, (g = new Bun.Glob(pattern)));
  return g;
}

export function pathMatches(rule: Rule, file: string): boolean {
  const f = file.replace(/\\/g, "/").replace(/^\.\//, "");
  return rule.paths.some((p) => glob(p).match(f) || glob(p).match(`x/${f}`));
}

/**
 * Radical de 4+ letras casa com o começo da palavra ("autentic" → "autenticação");
 * radicais curtos ("ui", "api") só casam com a palavra inteira; termos com espaço casam como frase.
 */
export function keywordHits(rule: Rule, text: string): string[] {
  const norm = normalize(text);
  const words = norm.split(/[^a-z0-9]+/).filter(Boolean);
  return rule.keywords.filter((k) =>
    k.includes(" ")
      ? norm.includes(k)
      : words.some((w) => (k.length >= 4 ? w.startsWith(k) : w === k)),
  );
}

/** Pastas geradas por ferramentas de IA/dependências: nunca contam como "arquivo da tarefa". */
const TOOL_DIRS = /^(\.agents|\.claude|\.codex|\.github\/(agents|instructions|skills)|_bmad|_bmad-output|\.ai|node_modules|graphify-out|vendor|target|dist|build)\//;
export const isProjectFile = (f: string) => !TOOL_DIRS.test(f.replace(/\\/g, "/").replace(/^\.\//, ""));

export function matchRules(rules: Rule[], input: { files?: string[]; text?: string; areas?: string[] }): Match[] {
  const files = [...(input.files ?? []), ...(input.text ? filesInText(input.text) : [])].filter(isProjectFile);
  const forced = new Set(input.areas ?? []);
  const out: Match[] = [];
  for (const rule of rules) {
    const byPath = files.filter((f) => pathMatches(rule, f));
    const byKeyword = input.text ? keywordHits(rule, input.text) : [];
    if (forced.has(rule.area) || byPath.length || byKeyword.length) out.push({ rule, byPath, byKeyword });
  }
  return out;
}
