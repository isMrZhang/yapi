import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const queueFile =
  process.env.QUEUE ||
  path.resolve(".trae/specs/sync-upstream-unmerged-prs/pr-queue.json");
const limit = Number(process.env.LIMIT || "0");
const onlyCategory = process.env.ONLY_CATEGORY || "";

const q = JSON.parse(fs.readFileSync(queueFile, "utf8"));
const items = q.items || [];

let processed = 0;
for (const item of items) {
  if (limit > 0 && processed >= limit) break;
  if (onlyCategory && item.category !== onlyCategory) continue;
  if ((item.status || "待评审") !== "待评审") continue;
  if (item.draft) continue;

  const r = spawnSync("node", ["scripts/import-upstream-pr.mjs", String(item.number)], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status || 1);
  processed += 1;
}

process.stdout.write(`${processed}\n`);
