import type { AgentExecutionResult, AgentName, Availability } from "./types.ts";

/** Output that means "this agent can't run right now", not "the task failed". */
const UNAVAILABLE =
  /credit balance|out of credits|insufficient (credits|quota)|quota exceeded|usage limit|rate limit|billing|payment required|not logged in|please log ?in|unauthori[sz]ed|authentication (failed|required)|invalid api key|no copilot (access|subscription)/i;

/** The agent never needs the Jev key; keep it out of its environment. */
function agentEnv(): Record<string, string | undefined> {
  const { TYPESAFE_API_KEY: _omit, ...env } = process.env;
  return env;
}

/** Runs a command quietly; returns null when the binary is missing. */
export async function probe(cmd: string[]): Promise<{ code: number; out: string } | null> {
  if (!Bun.which(cmd[0]!)) return null;
  const proc = Bun.spawn(cmd, { stdin: "ignore", stdout: "pipe", stderr: "pipe", env: agentEnv() });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, out: `${out}${err}`.trim() };
}

export async function versionOf(bin: string): Promise<Availability> {
  const res = await probe([bin, "--version"]);
  if (!res) return { ok: false, reason: `${bin} CLI not installed` };
  if (res.code !== 0) return { ok: false, reason: `${bin} --version failed` };
  return { ok: true, version: res.out.match(/\d+\.\d+\.\d+/)?.[0] ?? res.out.split("\n")[0] };
}

async function pump(stream: ReadableStream<Uint8Array>, sink: NodeJS.WriteStream, chunks: string[]) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  for (let next = await reader.read(); !next.done; next = await reader.read()) {
    sink.write(next.value);
    chunks.push(decoder.decode(next.value, { stream: true }));
  }
}

/**
 * Hands the terminal to the agent's own TUI: the user can answer questions,
 * switch models, enter plan mode, etc. Output isn't captured, so availability
 * errors after launch can't trigger a fallback.
 */
export async function runInteractive(agent: AgentName, cmd: string[], cwd: string): Promise<AgentExecutionResult> {
  const proc = Bun.spawn(cmd, { cwd, stdin: "inherit", stdout: "inherit", stderr: "inherit", env: agentEnv() });
  return { agent, exitCode: await proc.exited, output: "", unavailable: false };
}

/** Runs the agent CLI with live stdout/stderr, capturing both to classify failures. */
export async function run(agent: AgentName, cmd: string[], cwd: string): Promise<AgentExecutionResult> {
  const proc = Bun.spawn(cmd, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe", env: agentEnv() });
  const chunks: string[] = [];
  await Promise.all([pump(proc.stdout, process.stdout, chunks), pump(proc.stderr, process.stderr, chunks)]);
  const exitCode = await proc.exited;
  const output = chunks.join("");
  return { agent, exitCode, output, unavailable: exitCode !== 0 && UNAVAILABLE.test(output) };
}
