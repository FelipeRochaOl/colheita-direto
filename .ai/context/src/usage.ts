import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Registro local de uso (fora do git, em .ai/context/.state/usage.jsonl) que alimenta
 * `./ai insights`: quais áreas entraram no contexto, por onde e quais scripts rodaram.
 */
export interface UsageEvent {
  ts: number;
  kind: "hook" | "rules" | "run";
  agent?: string;
  areas?: string[];
  chars?: number;
  script?: string;
}

const MAX_LINES = 5000;
const file = (root: string) => join(root, ".ai/context/.state/usage.jsonl");

export function logUsage(root: string, ev: Omit<UsageEvent, "ts">): void {
  try {
    mkdirSync(join(root, ".ai/context/.state"), { recursive: true });
    appendFileSync(file(root), `${JSON.stringify({ ts: Date.now(), ...ev })}\n`);
  } catch {
    /* uso é opcional; nunca falha o comando */
  }
}

export function readUsage(root: string, days: number): UsageEvent[] {
  const f = file(root);
  if (!existsSync(f)) return [];
  const lines = readFileSync(f, "utf8").split("\n").filter(Boolean);
  if (lines.length > MAX_LINES) writeFileSync(f, `${lines.slice(-MAX_LINES).join("\n")}\n`);
  const since = Date.now() - days * 864e5;
  return lines
    .map((l) => {
      try {
        return JSON.parse(l) as UsageEvent;
      } catch {
        return null;
      }
    })
    .filter((e): e is UsageEvent => !!e && e.ts >= since);
}
