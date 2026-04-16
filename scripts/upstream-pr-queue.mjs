import fs from "node:fs";
import path from "node:path";

const repo = process.env.UPSTREAM_REPO || "YMFE/yapi";
const outFile =
  process.env.OUTPUT ||
  path.resolve(".trae/specs/sync-upstream-unmerged-prs/pr-queue.json");

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function requestJson(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "yapi-fork-maintainer",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  return { data, headers: res.headers };
}

async function listPulls(state) {
  const pulls = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const url = `https://api.github.com/repos/${repo}/pulls?state=${state}&per_page=${perPage}&page=${page}`;
    const { data } = await requestJson(url);
    if (!Array.isArray(data) || data.length === 0) break;
    pulls.push(...data);
    if (data.length < perPage) break;
    page += 1;
  }
  return pulls;
}

function normalize(pr) {
  const title = pr.title || "";
  const category =
    /client|frontend|ui|css|less|sass|webpack|build|vite|babel|react|vue/i.test(title)
      ? "client/build/ui"
      : /doc|readme|changelog|markdown/i.test(title)
        ? "docs"
        : /depend|deps|npm|pnpm|yarn|lock/i.test(title)
          ? "deps"
          : "unknown";
  return {
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    state: pr.state,
    draft: !!pr.draft,
    mergedAt: pr.merged_at,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    author: pr.user?.login || null,
    baseRef: pr.base?.ref || null,
    headRef: pr.head?.ref || null,
    category,
    status: "待评审",
  };
}

const open = await listPulls("open");
const closed = await listPulls("closed");

const unmergedClosed = closed.filter((pr) => !pr.merged_at);
const queue = [...open, ...unmergedClosed]
  .map(normalize)
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ repo, generatedAt: new Date().toISOString(), items: queue }, null, 2));
process.stdout.write(`${queue.length}\n`);
