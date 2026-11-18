#!/usr/bin/env bun
/**
 * Hook de contexto para Claude Code e Codex (`--agent claude|codex`).
 *
 * - UserPromptSubmit: casa o prompt com `.ai/rules` (caminhos citados + palavras-chave) e
 *   injeta só as áreas novas desta sessão, mais as preferências gerais no primeiro prompt.
 * - SessionStart (clear/compact) e PostCompact: zera o estado para as regras voltarem.
 *
 * Nunca bloqueia: qualquer erro termina em exit 0 sem saída.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { matchRules } from "./match.ts";
import { HEADER, render } from "./render.ts";
import { findRoot, loadPrefs, loadRules } from "./rules.ts";
import { logUsage } from "./usage.ts";

interface Payload {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  prompt?: string;
  source?: string;
}
interface State {
  areas: string[];
  general: boolean;
}

const agent = process.argv.includes("--agent") ? process.argv[process.argv.indexOf("--agent") + 1] : "claude";

function stateFile(root: string, session: string) {
  const dir = join(root, ".ai/context/.state");
  mkdirSync(dir, { recursive: true });
  // Limpa estados com mais de 7 dias.
  for (const f of readdirSync(dir)) {
    try {
      if (Date.now() - statSync(join(dir, f)).mtimeMs > 7 * 864e5) rmSync(join(dir, f));
    } catch {
      /* ignore */
    }
  }
  return join(dir, `${session.replace(/[^\w-]/g, "_")}.json`);
}

async function main() {
  const payload = JSON.parse((await Bun.stdin.text()) || "{}") as Payload;
  const root = findRoot(payload.cwd || process.cwd());
  if (!root || !existsSync(join(root, ".ai/rules"))) return;
  const session = payload.session_id || "default";
  const file = stateFile(root, session);
  const event = payload.hook_event_name ?? "";

  if (event === "SessionStart" || event === "PostCompact") {
    if (event === "PostCompact" || payload.source !== "resume") rmSync(file, { force: true });
    return;
  }
  if (event && event !== "UserPromptSubmit") return;

  const state: State = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { areas: [], general: false };
  // Sessão aberta pelo `./ai`: o prompt já traz o contexto renderizado. Registra essas
  // áreas como entregues e casa só o texto da TASK, para não injetar tudo de novo.
  let prompt = payload.prompt ?? "";
  // Pedido do `./ai insights --ask`: o relatório cita todas as áreas; não injetar nada.
  if (prompt.startsWith("[ai-kit:insights]")) return;
  if (prompt.includes(HEADER)) {
    for (const m of prompt.matchAll(/^## .*\[([\w-]+)\]/gm)) if (!state.areas.includes(m[1]!)) state.areas.push(m[1]!);
    state.general = true;
    prompt = /TASK:\n([\s\S]*?)\n\nPROJECT:/.exec(prompt)?.[1] ?? "";
  }
  const prefs = loadPrefs();
  const fresh = matchRules(loadRules(root), { text: prompt }).filter((m) => !state.areas.includes(m.rule.area));
  const text = render(fresh, prefs, {
    root,
    agent: agent === "codex" ? "codex" : "claude",
    nativePathRules: agent === "claude",
    general: !state.general,
  });

  state.general = true;
  state.areas.push(...fresh.map((m) => m.rule.area));
  writeFileSync(file, JSON.stringify(state));
  if (!text) return;
  logUsage(root, { kind: "hook", agent, areas: fresh.map((m) => m.rule.area), chars: text.length });
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: text } }),
  );
}

try {
  await main();
} catch {
  /* hook nunca quebra a sessão */
}
process.exit(0);
