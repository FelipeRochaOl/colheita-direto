#!/usr/bin/env bun
/**
 * ./ai rules | areas | sync | doctor | prefs — contexto por área decidido por código.
 */
import { existsSync } from "node:fs";
import { doctor } from "./doctor.ts";
import { matchRules } from "./match.ts";
import { render } from "./render.ts";
import { findRoot, loadPrefs, loadRules, writePrefs } from "./rules.ts";
import type { Agent } from "./skills.ts";
import { listScripts, personalScriptsDir, runScript } from "./scripts.ts";
import { sync } from "./sync.ts";
import { logUsage } from "./usage.ts";
import { askAgent, collect, promptFor, saveInsight } from "./insights.ts";

const HELP = `Uso:
  ./ai rules [--files a.ts b.ts] [--text "tarefa"] [--area ui]... [--agent claude|codex|copilot]
              Imprime as regras do time + suas preferências das áreas que casam.
              Sem --files/--text/--area, usa os arquivos alterados no git.
  ./ai areas  Lista as áreas, seus caminhos e termos.
  ./ai sync   Gera .claude/rules, .github/instructions, índice do AGENTS.md e passos do BMAD
              a partir de .ai/rules (rode depois de editar uma regra).
  ./ai doctor Mede o custo fixo de contexto por sessão e aponta problemas.
  ./ai scripts               Lista os scripts reutilizáveis (.ai/scripts + pessoais).
  ./ai run <script> [args]   Executa um deles (sh→bash, py→python3, ts/js→bun).
  ./ai insights [--ask claude|codex|copilot]
              Coleta sinais de uso por código e (com --ask) pede à LLM propostas de melhoria.
  ./ai prefs  Mostra onde ficam suas preferências pessoais e o conteúdo.
  ./ai prefs add [--general "texto"]... [--area <área> "texto"]...
              Adiciona preferências pessoais (valem em todo projeto, fora do git).`;

const [cmd, ...args] = process.argv.slice(2);
const root = findRoot();
if (!root) {
  console.error("Não achei .ai/ neste diretório nem acima. Rode o setup/install.sh no projeto.");
  process.exit(1);
}

function changedFiles(): string[] {
  const run = (a: string[]) => {
    const r = Bun.spawnSync(["git", ...a], { cwd: root! });
    return r.exitCode === 0 ? r.stdout.toString().split("\n").filter(Boolean) : [];
  };
  return [...new Set([...run(["diff", "--name-only", "HEAD"]), ...run(["ls-files", "--others", "--exclude-standard"])])];
}

switch (cmd) {
  case "rules": {
    const files: string[] = [];
    const areas: string[] = [];
    let text = "";
    let agent: Agent = "any";
    for (let i = 0; i < args.length; i++) {
      const a = args[i]!;
      if (a === "--text") text = args[++i] ?? "";
      else if (a === "--area") areas.push(args[++i] ?? "");
      else if (a === "--agent") agent = (args[++i] ?? "any") as Agent;
      else if (a === "--files") while (args[i + 1] && !args[i + 1]!.startsWith("--")) files.push(args[++i]!);
      else files.push(a);
    }
    if (!files.length && !text && !areas.length) files.push(...changedFiles());
    const matches = matchRules(loadRules(root), { files, text, areas });
    const out = render(matches, loadPrefs(), { root, agent, general: true, total: 12000, perArea: 4000 });
    if (out) logUsage(root, { kind: "rules", areas: matches.map((m) => m.rule.area), chars: out.length });
    console.log(out || "Nenhuma área casou (ou as regras casadas estão vazias). Veja `./ai areas`.");
    break;
  }
  case "areas": {
    for (const r of loadRules(root)) {
      console.log(`${r.area} — ${r.title}${r.body ? "" : " (vazia)"}`);
      if (r.paths.length) console.log(`  paths:    ${r.paths.join(", ")}`);
      if (r.keywords.length) console.log(`  termos:   ${r.keywords.join(", ")}`);
      if (r.skills.length) console.log(`  skills:   ${r.skills.join(", ")}`);
    }
    break;
  }
  case "sync": {
    const { changed, skipped } = sync(root);
    console.log(changed.length ? `Atualizados:\n${changed.map((f) => `  ${f}`).join("\n")}` : "Nada mudou.");
    if (skipped.length) console.log(`Mantidos (não gerados por mim):\n${skipped.map((f) => `  ${f}`).join("\n")}`);
    break;
  }
  case "doctor":
    process.exit(doctor(root));
  case "scripts": {
    const all = listScripts(root);
    if (!all.length) {
      console.log(`Nenhum script. Salve scripts reutilizáveis em .ai/scripts/ (time) ou ${personalScriptsDir()} (pessoal),\ncom "# desc: ..." e "# uso: ..." nas primeiras linhas.`);
      break;
    }
    for (const s of all) console.log(`${s.name} [${s.scope}] — ${s.desc || "(sem # desc)"}${s.usage ? `\n    uso: ${s.usage}` : ""}`);
    break;
  }
  case "insights": {
    // ./ai insights [--ask claude|codex|copilot]
    const report = collect(root);
    const reportFile = saveInsight(root, "relatorio", report);
    const askIdx = args.indexOf("--ask");
    if (askIdx < 0) {
      console.log(`${report}\n\nRelatório salvo em ${reportFile}.\nPara a LLM propor melhorias: ./ai insights --ask claude|codex|copilot`);
      break;
    }
    const agent = args[askIdx + 1] ?? "claude";
    console.log(`Pedindo propostas ao ${agent} (só leitura; nada é alterado)...`);
    try {
      const file = saveInsight(root, `propostas-${agent}`, askAgent(root, agent, promptFor(report)));
      console.log(`Propostas salvas em ${file}.\nRevise e peça ao agente: "aplique as propostas 1 e 3 de ${file}".`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
    break;
  }
  case "run":
    if (!args[0]) {
      console.error("Uso: ./ai run <script> [args]");
      process.exit(1);
    }
    logUsage(root, { kind: "run", script: args[0] });
    process.exit(runScript(root, args[0], args.slice(1)));
  case "prefs": {
    if (args[0] === "add") {
      // ./ai prefs add --general "texto" --area back "texto" ...
      const p = loadPrefs();
      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--general" && args[i + 1]) {
          const v = args[++i]!;
          if (!p.general.includes(v)) p.general.push(v);
        } else if (args[i] === "--area" && args[i + 1] && args[i + 2]) {
          const area = args[++i]!;
          const v = args[++i]!;
          const list = (p.areas[area] ??= []);
          if (!list.includes(v)) list.push(v);
        }
      }
      writePrefs(p);
      console.log(`Preferências gravadas em ${p.file}`);
      break;
    }
    const p = loadPrefs();
    console.log(`Arquivo: ${p.file}${existsSync(p.file) ? "" : " (não existe — rode o setup ou crie à mão)"}`);
    if (p.general.length) console.log(`\nGerais:\n${p.general.map((x) => `  - ${x}`).join("\n")}`);
    for (const [area, items] of Object.entries(p.areas)) console.log(`\n${area}:\n${items.map((x) => `  - ${x}`).join("\n")}`);
    break;
  }
  default:
    console.log(HELP);
    process.exit(cmd && cmd !== "help" && cmd !== "--help" ? 1 : 0);
}
