import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const queueFile =
  process.env.QUEUE ||
  path.resolve(".trae/specs/sync-upstream-unmerged-prs/pr-queue.json");
const remote = process.env.UPSTREAM_REMOTE || "upstream";
const defaultBaseRef = process.env.DEFAULT_BASE_REF || "master";

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function trySh(cmd, args) {
  try {
    return { ok: true, out: sh(cmd, args) };
  } catch (e) {
    return { ok: false, out: String(e?.stderr || e?.message || e) };
  }
}

const q = JSON.parse(fs.readFileSync(queueFile, "utf8"));
const items = q.items || [];

sh("git", ["fetch", "--no-tags", remote, defaultBaseRef]);

for (const item of items) {
  const prNum = item.number;
  const baseRef = item.baseRef || defaultBaseRef;
  const prRef = `refs/remotes/${remote}/pr/${prNum}`;

  const fetchRes = trySh("git", [
    "fetch",
    "--no-tags",
    "--depth",
    "1",
    remote,
    `pull/${prNum}/head:${prRef}`,
  ]);

  if (!fetchRes.ok) {
    item.fetch = { ok: false, error: fetchRes.out };
    item.status = item.status || "待评审";
    continue;
  }

  const baseFullRef = `${remote}/${baseRef}`;
  const filesRes = trySh("git", ["diff", "--name-only", `${baseFullRef}...${prRef}`]);
  const files = filesRes.ok && filesRes.out ? filesRes.out.split("\n").filter(Boolean) : [];

  const categorySet = new Set();
  for (const f of files) {
    if (f.startsWith("client/") || f.startsWith("static/")) categorySet.add("client/build/ui");
    else if (f.startsWith("build/") || f.startsWith("webpack") || f.includes("webpack")) categorySet.add("client/build/ui");
    else if (f.startsWith("server/") || f.startsWith("exts/") || f.startsWith("common/")) categorySet.add("server");
    else if (f.startsWith("docs/") || f.toLowerCase().includes("readme")) categorySet.add("docs");
    else if (f === "package.json" || f.endsWith("lock.yaml") || f.includes("pnpm-lock")) categorySet.add("deps");
    else categorySet.add("mixed");
  }

  const primaryCategory =
    categorySet.has("client/build/ui")
      ? "client/build/ui"
      : categorySet.has("server")
        ? "server"
        : categorySet.has("deps")
          ? "deps"
          : categorySet.has("docs")
            ? "docs"
            : categorySet.has("mixed")
              ? "mixed"
              : "unknown";

  item.fetch = { ok: true };
  item.filesChanged = files.length;
  item.filesSample = files.slice(0, 80);
  item.category = primaryCategory;
  item.categorySet = [...categorySet];
  item.status = item.status || "待评审";
}

fs.writeFileSync(queueFile, JSON.stringify({ ...q, items }, null, 2));
process.stdout.write(`${items.length}\n`);

