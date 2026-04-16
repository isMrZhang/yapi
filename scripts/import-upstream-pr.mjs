import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const prNumber = Number(process.argv[2]);
if (!Number.isFinite(prNumber) || prNumber <= 0) {
  process.stderr.write("Usage: node scripts/import-upstream-pr.mjs <pr-number>\n");
  process.exit(2);
}

const forkRepo = process.env.FORK_REPO || "isMrZhang/yapi";
const upstreamRemote = process.env.UPSTREAM_REMOTE || "upstream";
const queueFile =
  process.env.QUEUE ||
  path.resolve(".trae/specs/sync-upstream-unmerged-prs/pr-queue.json");
const targetBase = process.env.TARGET_BASE || "master";
const runVerify = process.env.RUN_VERIFY === "1";
const doPush = process.env.PUSH === "1";
const doCreatePr = process.env.CREATE_PR === "1";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
}

function trySh(cmd, args, opts = {}) {
  try {
    return { ok: true, out: sh(cmd, args, opts) };
  } catch (e) {
    return { ok: false, out: String(e?.stderr || e?.message || e) };
  }
}

function requestJson(url, method, body) {
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "yapi-fork-maintainer",
  };
  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
    return text ? JSON.parse(text) : {};
  });
}

function withTempOriginUrl(fn) {
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const current = sh("git", ["remote", "get-url", "origin"]);
  const temp = `https://x-access-token:${token}@github.com/${forkRepo}.git`;
  sh("git", ["remote", "set-url", "origin", temp]);
  sh("git", ["remote", "set-url", "--push", "origin", temp]);
  try {
    return fn();
  } finally {
    sh("git", ["remote", "set-url", "origin", current]);
    sh("git", ["remote", "set-url", "--push", "origin", current]);
  }
}

const q = JSON.parse(fs.readFileSync(queueFile, "utf8"));
const item = (q.items || []).find((i) => i.number === prNumber);
if (!item) {
  process.stderr.write(`PR #${prNumber} not found in queue\n`);
  process.exit(2);
}

const baseRef = item.baseRef || "master";
const prRemoteRef = `refs/remotes/${upstreamRemote}/pr/${prNumber}`;
const workBranch = `sync/pr-${prNumber}`;

sh("git", ["fetch", "--no-tags", upstreamRemote, baseRef]);
sh("git", ["fetch", "--no-tags", "--depth", "50", upstreamRemote, `pull/${prNumber}/head:${prRemoteRef}`]);

sh("git", ["checkout", targetBase]);
sh("git", ["pull", "--ff-only", "origin", targetBase]);
const branchRes = trySh("git", ["checkout", "-B", workBranch, targetBase]);
if (!branchRes.ok) throw new Error(branchRes.out);

const baseFullRef = `${upstreamRemote}/${baseRef}`;
const commits = sh("git", ["rev-list", "--reverse", `${baseFullRef}..${prRemoteRef}`])
  .split("\n")
  .filter(Boolean);

let cherryPickOk = true;
for (const sha of commits) {
  const r = trySh("git", ["cherry-pick", sha]);
  if (!r.ok) {
    cherryPickOk = false;
    trySh("git", ["cherry-pick", "--abort"]);
    break;
  }
}

if (!cherryPickOk) {
  item.status = "需要人工处理";
  item.import = { ok: false, reason: "cherry-pick-conflict", branch: workBranch };
  fs.writeFileSync(queueFile, JSON.stringify(q, null, 2));
  process.stdout.write("conflict\n");
  process.exit(0);
}

if (runVerify) {
  const verifyRes = trySh("bash", ["scripts/verify-pr-gate.sh"], { stdio: "inherit" });
  if (!verifyRes.ok) {
    item.status = "需要人工处理";
    item.import = { ok: false, reason: "verify-failed", branch: workBranch };
    fs.writeFileSync(queueFile, JSON.stringify(q, null, 2));
    process.stdout.write("verify-failed\n");
    process.exit(0);
  }
}

if (doPush) {
  withTempOriginUrl(() => {
    sh("git", ["push", "-u", "origin", workBranch]);
  });
}

let createdPr = null;
if (doCreatePr) {
  const title = `[Upstream #${prNumber}] ${item.title}`;
  const body = `Upstream: ${item.url}\n\nCategory: ${item.category || "unknown"}\n\nGenerated from upstream PR queue.`;
  createdPr = await requestJson(`https://api.github.com/repos/${forkRepo}/pulls`, "POST", {
    title,
    head: workBranch,
    base: targetBase,
    body,
  });
}

item.status = "迁入中";
item.import = { ok: true, branch: workBranch, commits: commits.length, forkPr: createdPr?.html_url || null };
fs.writeFileSync(queueFile, JSON.stringify(q, null, 2));
process.stdout.write("ok\n");

