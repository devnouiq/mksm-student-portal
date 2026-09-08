#!/usr/bin/env bash
#
# MKSM Student Portal — standard startup & verification path (AGENTS.md).
# Run this at the start of a session and before starting new feature work.
#
# Monorepo layout (npm workspaces — root package.json):
#   frontend/            Next.js app — the M1 UI
#   backend/             Next.js API — Supabase Postgres + Auth, Drizzle
#   packages/contracts/  shared API contract (enums, DTOs, zod)
#
set -euo pipefail
cd "$(dirname "$0")"

echo "==> MKSM Student Portal :: init"

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is required (Node 20+). Install: https://nodejs.org" >&2
  exit 1
fi

# ---- install (workspace root) -------------------------------------------
echo "==> Installing workspace dependencies"
npm install

# ---- frontend ----------------------------------------------------------
echo "==> [frontend] Running unit tests"
npm --workspace frontend run test

echo "==> [frontend] Verifying build (types + lint + prerender all routes)"
npm --workspace frontend run build

# ---- backend ---------------------------------------------------------
echo "==> [backend] Running unit tests"
npm --workspace backend run test

echo "==> [backend] Verifying build (types + route handlers)"
npm --workspace backend run build

# Migrations + seed are NOT run here — they need backend/.env.local with a real
# Supabase connection string + keys. Once that is in place:
#   npm --workspace backend run migrate   # apply supabase/migrations/*.sql
#   npm --workspace backend run seed       # demo data mirroring the FE fixtures
#   npm --workspace backend run dev        # http://localhost:3001/api/health

echo ""
echo "==> OK. Baseline verified."
echo "    Frontend dev:  npm --workspace frontend run dev   (http://localhost:3000)"
echo "    Backend dev:   npm --workspace backend run dev     (http://localhost:3001)"
echo "    Entry point:   /login  ->  Student / Teacher / Admin overviews"
