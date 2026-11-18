import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./policy.ts";

/**
 * Regras por área de `.ai/context` (instalado pelo setup), casadas por código com os
 * arquivos que o Graphify achou e com os termos da task. Vazio se o módulo não existe.
 */
export async function areaRules(task: string, files: string[]): Promise<string> {
  const dir = resolve(ROOT, ".ai/context/src");
  if (!existsSync(resolve(dir, "match.ts"))) return "";
  try {
    const { loadRules, loadPrefs } = await import(resolve(dir, "rules.ts"));
    const { matchRules } = await import(resolve(dir, "match.ts"));
    const { render } = await import(resolve(dir, "render.ts"));
    const matches = matchRules(loadRules(ROOT), { files, text: task });
    return render(matches, loadPrefs(), { root: ROOT, agent: "any", general: true }) as string;
  } catch {
    return "";
  }
}
