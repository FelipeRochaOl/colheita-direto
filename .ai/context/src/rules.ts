import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

/**
 * Fontes de contexto, todas lidas por código (nada de IA decidindo o que carregar):
 * - regras do time: `.ai/rules/<área>.md` (versionadas);
 * - preferências pessoais: `~/.config/ai-kit/preferences.yaml` (nunca vão para o git).
 */

export interface Rule {
  area: string;
  title: string;
  /** Globs de arquivo: a regra vale quando a tarefa toca um desses arquivos. */
  paths: string[];
  /** Radicais de palavra: a regra vale quando o texto da tarefa cita um deles. */
  keywords: string[];
  /** Skills relacionadas; `claude:<nome>` = embutida no Claude Code. */
  skills: string[];
  /** Corpo sem comentários HTML; vazio quando o time ainda não escreveu regras. */
  body: string;
  file: string;
}

export interface Preferences {
  general: string[];
  areas: Record<string, string[]>;
  file: string;
}

/** Raiz do projeto: `AI_ROOT`, ou o ancestral mais próximo com `.ai/`. */
export function findRoot(start = process.cwd()): string | null {
  if (process.env.AI_ROOT) return resolve(process.env.AI_ROOT);
  let dir = resolve(start);
  while (true) {
    if (existsSync(join(dir, ".ai/rules")) || existsSync(join(dir, ".ai/policy.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" && v ? v.split(",").map((s) => s.trim()) : [];

function parseFrontmatter(text: string): { meta: Record<string, unknown>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { meta: {}, body: text };
  let meta: Record<string, unknown> = {};
  try {
    meta = (Bun.YAML.parse(m[1]!) as Record<string, unknown>) ?? {};
  } catch {
    meta = {};
  }
  return { meta, body: m[2]! };
}

export function loadRules(root: string): Rule[] {
  const dir = join(root, ".ai/rules");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => {
      const file = join(dir, f);
      const { meta, body } = parseFrontmatter(readFileSync(file, "utf8"));
      const area = String(meta.area ?? basename(f, ".md"));
      return {
        area,
        title: String(meta.title ?? area),
        paths: list(meta.paths),
        keywords: list(meta.keywords).map(normalize),
        skills: list(meta.skills),
        body: body.replace(/<!--[\s\S]*?-->/g, "").trim(),
        file: `.ai/rules/${f}`,
      };
    });
}

export function prefsPath(): string {
  if (process.env.AI_PREFS) return resolve(process.env.AI_PREFS);
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(base, "ai-kit/preferences.yaml");
}

export function loadPrefs(): Preferences {
  const file = prefsPath();
  const empty = { general: [], areas: {}, file };
  if (!existsSync(file)) return empty;
  try {
    const raw = (Bun.YAML.parse(readFileSync(file, "utf8")) as Record<string, unknown>) ?? {};
    const areas: Record<string, string[]> = {};
    for (const [k, v] of Object.entries((raw.areas as Record<string, unknown>) ?? {})) {
      const items = list(v);
      if (items.length) areas[k] = items;
    }
    return { general: list(raw.general), areas, file };
  } catch {
    return empty;
  }
}

/** Grava as preferências como YAML simples (strings entre aspas JSON, que são YAML válido). */
export function writePrefs(p: Preferences): void {
  const q = (s: string) => JSON.stringify(s);
  const lines = [
    "# Preferências pessoais de desenvolvimento — valem em TODO projeto e nunca vão para o git.",
    "# As gerais entram uma vez por sessão; as de área só quando a tarefa toca a área.",
    "# Regras do projeto (.ai/rules) têm precedência. Edite à vontade ou use `./ai prefs add`.",
    p.general.length ? "general:" : "general: []",
    ...p.general.map((g) => `  - ${q(g)}`),
    Object.keys(p.areas).length ? "areas:" : "areas: {}",
    ...Object.entries(p.areas).flatMap(([area, items]) => [`  ${q(area)}:`, ...items.map((i) => `    - ${q(i)}`)]),
  ];
  mkdirSync(dirname(p.file), { recursive: true });
  writeFileSync(p.file, `${lines.join("\n")}\n`);
}

/** Minúsculas e sem acento, para casar "autenticação" com "autenticacao". */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
