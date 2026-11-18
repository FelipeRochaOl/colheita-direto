/** Git snapshots so "Changed files" reflects what the agent did, not pre-existing edits. */

export type Snapshot = Map<string, string>; // path → "XY:<content hash>"

/** A path the agent touched, plus its `git status --short`-style display line. */
export interface Change {
  path: string;
  line: string;
}

async function exec(args: string[], cwd: string): Promise<{ code: number; out: string; err: string }> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, out, err };
}

async function git(args: string[], cwd: string): Promise<string> {
  return (await exec(args, cwd)).out;
}

async function hash(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) return "deleted";
  return Bun.hash(await file.arrayBuffer()).toString(16);
}

export async function snapshot(cwd: string): Promise<Snapshot> {
  const out = await git(["status", "--porcelain=v1", "-uall"], cwd);
  const snap: Snapshot = new Map();
  for (const line of out.split("\n").filter(Boolean)) {
    const path = line.slice(3).split(" -> ").pop()!.replace(/^"|"$/g, "");
    snap.set(path, `${line.slice(0, 2)}:${await hash(`${cwd}/${path}`)}`);
  }
  return snap;
}

/** Paths whose status or content changed since `before`. */
export async function changesSince(before: Snapshot, cwd: string): Promise<Change[]> {
  const after = await snapshot(cwd);
  const changes: Change[] = [];
  for (const [path, state] of after) {
    if (before.get(path) !== state) changes.push({ path, line: `${state.slice(0, 2).trim() || "M"} ${path}` });
  }
  for (const [path, state] of before) {
    if (after.has(path)) continue;
    // Gone from `git status`: an untracked file was deleted, or a tracked one restored.
    const deleted = state.endsWith(":deleted") ? false : !(await Bun.file(`${cwd}/${path}`).exists());
    changes.push({ path, line: deleted ? `D ${path}` : `${path} (restored to HEAD)` });
  }
  return changes;
}

export async function diffStat(paths: string[], cwd: string): Promise<string> {
  if (!paths.length) return "";
  return (await git(["diff", "--stat", "--", ...paths], cwd)).trimEnd();
}

export interface CommitResult {
  ok: boolean;
  commits: Array<{ path: string; sha: string }>;
  pushed?: string;
  error?: string;
}

/**
 * Commits each path independently (other staged or dirty files stay out,
 * thanks to the pathspec) and optionally pushes after each commit.
 */
export async function commitAndPush(
  paths: string[],
  message: { subject: string; body: string },
  push: boolean,
  cwd: string,
): Promise<CommitResult> {
  const commits: Array<{ path: string; sha: string }> = [];
  const fail = (step: string, res: { err: string; out: string }) => ({
    ok: false,
    commits,
    error: `${step}: ${(res.err || res.out).trim()}`,
  });

  let pushed: string | undefined;
  for (const path of paths) {
    const add = await exec(["add", "-A", "--", path], cwd);
    if (add.code !== 0) return fail(`git add (${path})`, add);
    // E.g. the agent only restored a file to HEAD: nothing left to commit.
    if ((await exec(["diff", "--cached", "--quiet", "--", path], cwd)).code === 0) continue;

    const commit = await exec(
      ["commit", "-m", message.subject, "-m", `${message.body}\nFile: ${path}`, "--", path],
      cwd,
    );
    if (commit.code !== 0) return fail(`git commit (${path})`, commit);
    const sha = (await git(["rev-parse", "--short", "HEAD"], cwd)).trim();
    commits.push({ path, sha });
    if (!push) continue;

    const upstream = await exec(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], cwd);
    const pushArgs = upstream.code === 0 ? ["push"] : ["push", "-u", "origin", "HEAD"];
    const pushResult = await exec(pushArgs, cwd);
    if (pushResult.code !== 0) return fail(`git push (${path})`, pushResult);
    pushed = upstream.code === 0
      ? upstream.out.trim()
      : `origin/${(await git(["branch", "--show-current"], cwd)).trim()}`;
  }
  return { ok: true, commits, pushed };
}
