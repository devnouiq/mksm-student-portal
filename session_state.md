# Session State — MKSM Student Portal

_Last updated: 2026-09-01_

## MKSM music identity — Classic theme (2026-09-01)

Reworked the Classic theme to match the school's own identity (from
mksm.maheshkale.com), answering the "make it feel like music / take inspiration
from their actual work" feedback. All motifs use authentic Hindustani notation,
not generic Western note symbols.

- **Palette** retuned from the invented red to **kesar gold on warm ivory** —
  brand ramp kept dark at 600/700 so white-on-brand fills stay legible (~5:1).
- **Tanpura mark** replaces the flat "M" tile in `layout/brand.tsx` (inline SVG:
  gourd, neck, drone strings, pegs) — the instrument built into MKSM's own logo.
- **Taal mark** (`layout/taal-mark.tsx`) under every page title — one āvartan:
  sam (× gold diamond) on the laya line, beats, a hollow khali (○) at the vibhag.
- **Sargam watermark** (`layout/sargam-watermark.tsx`) — the ascending scale
  सा रे ग म प ध नि सां, ambient top-right on content pages and on the login stage.
- **Login stage** — dark charcoal + gold spotlight, tanpura drone strings, a
  meend glide curve, and the school's own voice line ("Spreading love through
  music, one note at a time").
- **Stat cards** each wear a faint swara (stable per label); **empty states** get
  a warm gold icon tile + sargam backdrop.

Intensities were raised after review — the first pass was too faint to see.
Gates: tsc clean, **44 tests** green, build compiled (36 routes), console clean,
verified live on login / Practice Material / overview. Studio shell left minimal;
Raga inherits the warm ivory but keeps its indigo + marigold.

## Client feedback — round 2 (2026-09-01)

Four review items, implemented exactly (nothing added beyond scope):

1. **Progress consistency (student).** The ongoing weekly batch class read 100%
   on Overview but 62% under My Classes. Rule extracted to a pure single source
   `frontend/src/domain/course.ts` (`displayProgress`), used by both pages so
   they can't drift again. My Classes now shows 100% (verified in-browser).
2. **Announcement Edit (admin).** Manage list gained an **Edit** button beside
   Remove — an in-place edit dialog updates title/body without delete-recreate
   (prototype: local state).
3. **Rich text + read popup (admin).** Announcement text supports `**bold**` /
   `*italic*` via an injection-safe parser (`frontend/src/domain/rich-text.ts`)
   rendered as React children — no `dangerouslySetInnerHTML`. Manage list shows
   title + plain preview only; clicking the title opens the full formatted body
   in a dialog (`frontend/src/components/ui/modal.tsx`). Student panel renders
   the same formatting; create + edit forms carry a format hint.
4. **MKSM personality (theme feedback, favored shells Classic + Raga).** A
   **sur rekha** signature — a sam-marked accent rule under every page title,
   token-tinted per theme (Classic red→saffron, Raga saffron→indigo), hidden on
   Studio to keep it minimal — plus optical sizing + size-specific tracking on
   the editorial serifs. A first creative pass, offered for review.

Gates: **44 unit tests** green (+10: course 3, rich-text 7 incl. an XSS
stays-literal case), tsc clean, build green (36 routes), secure-code-review of
the diff found no injection surface, in-browser proof for all four items.

## Layout variants (2026-08-28)

Added **three switchable layout shells** so the design direction can be chosen
from real UX, not a mock: the layout switcher now swaps the whole shell +
palette + type, not just tokens.

- **Classic** — persistent left sidebar, MKSM red, serif (the reference layout).
- **Raga** — horizontal top-nav (no sidebar), a सा-रे-ग-म sargam ribbon, a
  centred editorial reading column; night-raga **indigo + marigold** on ivory
  (grounded in North-Indian classical, deliberately not the terracotta-cream
  AI default). Fraunces / Mukta.
- **Studio** — floating translucent **icon rail** (labels on hover), a toolbar
  content scrolls beneath, and a **⌘K command palette** to jump between screens;
  Apple-blue, Inter, larger radii. Built with the apple-design skill.

Architecture: `components/layout/portal-chrome.tsx` is now a dispatcher that
reads the active variant on `<html data-theme>` and renders
`shells/{classic,raga,studio}-shell.tsx`. Variant model + no-FOUC pre-paint
script + `isThemeId` guard live in `config/theme.ts` (unit-tested,
`config/theme.test.ts`, incl. a sandboxed run of the pre-paint script).

Gates: build + **34 tests** green; secure-code-review of the diff found nothing
(UI-only; static hrefs; validated variant; guarded localStorage; the sole
`dangerouslySetInnerHTML` is the constant pre-paint script); role isolation
preserved. **Accepted tradeoff:** the dispatcher renders Classic on SSR/first
paint then swaps to the stored shell after mount — colors are correct instantly
via the pre-paint script, only the nav structure reflows once for non-classic
viewers; an SSR-inlined variant (cookie) removes it in M2.

## Repository layout (monorepo)

```
mksm-student-portal/
  frontend/   Next.js app — the M1 UI (src/, public/, package.json, node_modules)
  backend/    API service — NOT YET CREATED; the backend workstream adds it here
  docs/       PRD and shared docs
  init.sh     installs + verifies each workspace (frontend today, backend later)
```

Frontend and backend are **separate workspaces**. All `frontend/*` npm commands
run from `frontend/` (e.g. `npm --prefix frontend run dev`). When the backend
lands, it gets its own `backend/package.json` (or `pyproject.toml`, etc.) and its
init step is wired into `init.sh`. The API swap point stays
`frontend/src/data/index.ts`.

## Current verified status

**Milestone:** M1 — Full UI / Clickable Prototype (all 3 personas).
**Baseline:** `./init.sh` passes — `npm install` + `next build` compile clean
(**35 routes** prerendered, no type/lint errors). Verified live in-browser:
Teacher Overview, Admin Subscriptions, Student My Courses, Sankalp Leaderboard
(incl. tab switching) all render correctly.

**M1 is functionally complete** — every screen in the PRD is built as real,
responsive, MKSM-branded UI with realistic mock data, and the whole app is
clickable across all three personas.

## What exists

- **Stack:** Next.js 16 (App Router / RSC), TypeScript, Tailwind v4,
  `@phosphor-icons/react`. Package manager: **npm**.
- **Design system** (`frontend/src/app/globals.css`): MKSM brand tokens (red `#a02020`,
  warm neutrals, saffron reserved for Sankalp), Playfair Display + Manrope,
  radius scale, focus rings, skeleton shimmer.
- **Data layer** (`frontend/src/data/`): domain types + **view models for every screen**
  → repository **interfaces** (`repositories.ts`: session / student / teacher /
  admin / leaderboard) → in-memory mock (`mock/`, split fixtures per persona +
  shared `time.ts`) → single swap point (`index.ts`). Screens fetch only via
  `getRepositories()`; swapping mock→API later needs **zero screen changes**.
  Configurable latency (`MKSM_MOCK_LATENCY_MS`) exercises loading states.
- **App shell** (`frontend/src/components/layout/`): server `AppShell`, client
  `PortalChrome` (role sidebar, topbar, mobile drawer), `HelpWidget`.
- **UI primitives** (`frontend/src/components/ui/`): Button, Card, Badge, Progress,
  Skeleton, Avatar, EmptyState, Input, Field, **Select, Textarea, Table set,
  Tabs, Stat, SubmittedNotice**.
- **Domain components** (`frontend/src/components/domain/`): SubscriptionBadge,
  HomeworkStatusBadge, MaterialIcon, PracticeMaterialList, SankalpLeaderboard
  (+ leaderboard-tables), AnnouncementsPanel, RequestRecordingButton.
- **Screens (30 + login):** all Student (10), Teacher (9) and Admin (11)
  screens built. See `feature_list.json` — every feature is `done`.
- Interactive prototype behaviours (form submit → success banner, mark-all-read,
  give-feedback, attendance toggle, search/filter, announcement remove) hold
  state **locally only**; they get wired to endpoints in M2–M4.

## Scope guardrails (do not violate — PRD §7/§9)

- Subscriptions (Razorpay/PayPal) are **read-only** display; no payment processing.
- Zoom = **static links**; "Join Now" is a link that (in M3) marks attendance.
- Voices of MKSM = embedded YouTube only.
- Out of scope: Reports, Q&A / Manage Questions, Reschedule/Substitute,
  Request Homework, student Voices submission.

## Engineering gates (engineering-workflow, run 2026-08-24)

- **TDD** ✅ — Vitest suite, **22 tests green** (`npm --prefix frontend test`).
  The homework ≥2-day cutoff rule (PRD §8.7) was extracted from the React
  component into a pure, `now`-injected domain fn (`frontend/src/domain/homework.ts`)
  and covered incl. boundary/past/invalid; plus `navForRole` RBAC isolation
  (PRD §7) and `toPercent`/`initials`. Tests wired into `init.sh`.
- **SOLID** ✅ — business rule is now framework-free and dependency-injected;
  screens still depend only on repository interfaces.
- **Security** ✅ — scanned diff + app: no XSS sinks, no committed secrets/`.env`,
  no unsafe links, iframe has `referrerPolicy` + scoped `allow`. Two risks
  recorded for M2 (see below).
- **Production-readiness** ⚠️ waived-for-M1 — runtime gates (logging/metrics/
  timeouts/health/migrations/rollback) are N/A for a no-backend mock; applicable
  now but deferred to M2: per-route `error.tsx`/`loading.tsx`, startup validation
  of `MKSM_MOCK_LATENCY_MS`.
- **Code review** ✅ — diff self-reviewed; behaviour preserved, build + tests green.

## Next step

M1 UI is complete and ready for internal review / demo. Suggested next actions:
1. **Commit** the M1 prototype (foundation + login + all screens).
2. Deploy to a **staging URL** for the M1 design-freeze review (PRD §10).
3. On sign-off, begin **M2** (auth + admin core against real data), reusing the
   repository seam: add an HTTP `Repositories` implementation and switch it in
   `frontend/src/data/index.ts`.

## Open decisions / risks

- **Prototype auth:** login accepts any password for demo identities and holds
  no session — real auth/RBAC is M2. This is intentional for M1.
- **Definition of Done for M1:** engineering-workflow gates were run (see
  "Engineering gates" above). Backend-only runtime gates are waived with reason
  for a mock prototype; TDD/SOLID/security/review were satisfied for real.
- **M2 security must-dos (recorded):** (1) replace the prototype any-password /
  client-side-route auth with real password auth + **server-side** session &
  RBAC; (2) allow-list the admin-editable Voices YouTube URL (youtube.com /
  youtube-nocookie only) before rendering it in the iframe.
- Branding assets (real logo, exact fonts, Voices YouTube link), MKSM Policy
  text, FAQs, holiday list and Raga dropdown are **client dependencies**
  (PRD §12.10/§12.11) — current content is tasteful placeholder aligned to the
  brief and labelled as such.
