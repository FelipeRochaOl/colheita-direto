import type { Match } from "./match.ts";
import type { Preferences } from "./rules.ts";
import { availableSkills, type Agent } from "./skills.ts";

export interface RenderOptions {
  root: string;
  agent: Agent;
  /** Claude já carrega sozinho as regras com `paths` (.claude/rules); não repetir o texto. */
  nativePathRules?: boolean;
  /** Inclui as preferências gerais (uma vez por sessão no hook). */
  general?: boolean;
  perArea?: number;
  total?: number;
}

export const HEADER = "Contexto selecionado por código";

const clip = (s: string, max: number, file: string) =>
  s.length <= max ? s : `${s.slice(0, max).replace(/\n[^\n]*$/, "")}\n- … (continua em ${file})`;

/** Texto factual com só o que casou; vazio quando não há nada útil a dizer. */
export function render(matches: Match[], prefs: Preferences, opts: RenderOptions): string {
  const perArea = opts.perArea ?? 1500;
  const total = opts.total ?? 4000;
  const parts: string[] = [];

  if (opts.general && prefs.general.length) {
    parts.push(`## Preferências gerais do usuário\n${prefs.general.map((p) => `- ${p}`).join("\n")}`);
  }

  for (const { rule, byPath, byKeyword } of matches) {
    const lines: string[] = [];
    const why = [
      byPath.length ? `arquivos: ${byPath.slice(0, 3).join(", ")}` : "",
      byKeyword.length ? `termos: ${byKeyword.slice(0, 3).join(", ")}` : "",
    ].filter(Boolean).join("; ");
    const native = opts.nativePathRules && rule.paths.length > 0;
    if (rule.body) {
      lines.push(
        native
          ? `Regras do time: ${rule.file} (o Claude carrega sozinho ao abrir arquivos da área).`
          : `Regras do time (${rule.file}):\n${clip(rule.body, perArea, rule.file)}`,
      );
    }
    const mine = prefs.areas[rule.area] ?? [];
    if (mine.length) lines.push(`Preferências do usuário:\n${mine.map((p) => `- ${p}`).join("\n")}`);
    const skills = availableSkills(opts.root, rule.skills, opts.agent);
    if (skills.length) lines.push(`Skills disponíveis para esta área: ${skills.join(", ")}`);
    if (!lines.length) continue;
    parts.push(`## ${rule.title} [${rule.area}]${why ? ` — ${why}` : ""}\n${lines.join("\n")}`);
  }

  if (!parts.length) return "";
  const head = HEADER + " (.ai/rules + preferências do usuário). Regras do projeto têm precedência sobre preferências pessoais.";
  return clip(`${head}\n\n${parts.join("\n\n")}`, total, ".ai/rules/");
}
