#!/usr/bin/env bash
set -euo pipefail

corepack enable >/dev/null 2>&1 || true

pnpm install --frozen-lockfile
pnpm test
pnpm run build-client

timeout 15s pnpm run dev-client || test $? -eq 124

