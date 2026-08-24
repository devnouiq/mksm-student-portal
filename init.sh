#!/usr/bin/env bash
#
# MKSM Student Portal — standard startup & verification path (AGENTS.md).
# Run this at the start of a session and before starting new feature work.
#
# Monorepo layout:
#   frontend/   Next.js app (this milestone)
#   backend/    API service (added by the backend workstream; see below)
#
set -euo pipefail
cd "$(dirname "$0")"

echo "==> MKSM Student Portal :: init"

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is required (Node 20+). Install: https://nodejs.org" >&2
  exit 1
fi

# ---- frontend --------------------------------------------------------------
echo "==> [frontend] Installing dependencies"
npm --prefix frontend install

echo "==> [frontend] Running unit tests"
npm --prefix frontend test

echo "==> [frontend] Verifying build (types + lint + prerender all routes)"
npm --prefix frontend run build

# ---- backend (placeholder) -------------------------------------------------
# When the backend workstream lands, add its install + verify here, e.g.:
#   if [ -d backend ]; then
#     echo "==> [backend] Installing dependencies"
#     ( cd backend && <install> && <build/test> )
#   fi

echo ""
echo "==> OK. Baseline verified."
echo "    Dev server:   npm --prefix frontend run dev   (http://localhost:3000)"
echo "    Entry point:  /login  ->  Student / Teacher / Admin overviews"
