# MKSM Student Portal — Backend

API service for the MKSM Student Portal. Next.js 16 (route handlers only, no
pages), Supabase Postgres + Supabase Auth, Drizzle for typed queries. Part of the
npm-workspaces monorepo at the repo root.

> The frontend is a separate workspace and is **not** wired to this API yet.
> Wiring it up is a later job — see "Frontend integration" below.

## API docs

With the server running (`npm --workspace backend run dev`):

- **Swagger UI** — <http://localhost:3001/api/docs> (browse + "Try it out"; paste a
  bearer token from `POST /api/v1/auth/login` into **Authorize**)
- **OpenAPI spec** — <http://localhost:3001/api/openapi.json> (import into Postman /
  Insomnia / Bruno)
- Static copy on disk: `backend/openapi.json` — regenerate with
  `npm --workspace backend run openapi`
- The endpoint → frontend-repository-method map is the table further down this file.

The spec is generated from `src/lib/openapi.ts` (a hand-maintained catalog) plus
the zod schemas in `@mksm/contracts`. Keep the catalog in sync when adding routes.

## Layout

```
backend/
  src/
    app/api/                REST route handlers (thin: auth → validate → service → envelope)
      health/               GET /api/health           (DB ping + build info, no auth)
      v1/…                  GET/POST/PATCH/PUT/DELETE  (see the endpoint map below)
    lib/
      config.ts             zod-validated env, fails fast at startup
      logger.ts             pino JSON logs + per-request correlationId
      db/client.ts          lazy Drizzle client over the Supabase session pooler
      db/schema/            Drizzle tables mirroring supabase/migrations
      supabase/server.ts    service-role + anon clients (server only)
      supabase/auth.ts      verify bearer JWT → Actor (role, mksmNo, profileId)
      http/with-auth.ts     route() / publicRoute() wrappers
      http/{response,errors,validate}.ts
      audit.ts              append-only audit_log writes
    domain/                 pure, framework-free, unit-tested rules
    modules/<name>/         <name>.service.ts + <name>.repository.ts per domain
  supabase/
    migrations/00xx_*.sql   schema source of truth (forward-only)
    seed.sql                demo data mirroring the frontend fixtures
  scripts/
    migrate.ts              apply migrations (tracks public._migrations); --status
    seed.ts                 create demo Auth users + run seed.sql
```

## Setup

```bash
# from the repo root
npm install

cp backend/.env.example backend/.env.local
# then edit backend/.env.local:
#   DATABASE_URL               Supabase Session pooler string (Dashboard → Connect)
#   SUPABASE_URL               https://<ref>.supabase.co
#   SUPABASE_ANON_KEY          Dashboard → Project Settings → API
#   SUPABASE_SERVICE_ROLE_KEY  Dashboard → Project Settings → API  (SECRET)

npm --workspace backend run migrate      # apply supabase/migrations/*.sql
npm --workspace backend run seed          # demo data (needs the service role key,
                                          # or falls back to a dev-only direct insert)
npm --workspace backend run dev           # http://localhost:3001
npm --workspace backend run test          # vitest (unit + contract + http wrapper)
```

`curl http://localhost:3001/api/health` → `{"data":{"status":"ok","db":true,…}}`.

### Notes on the Supabase connection

The direct `db.<ref>.supabase.co` host is IPv6-only. Use the **Session pooler**
host (`aws-0-<region>.pooler.supabase.com:5432`, user `postgres.<ref>`). The
Drizzle client sets `prepare: false` (required for the pooler) and a statement
timeout.

## Response envelope

Success: `{ "data": <payload>, "correlationId": "<uuid>" }`
Failure: `{ "error": { "code", "message", "details?" }, "correlationId": "<uuid>" }`

`code` ∈ `bad_request | unauthorized | forbidden | not_found | conflict |
validation_failed | rate_limited | internal`. Every response carries
`x-correlation-id`; send one in and it is echoed back and threaded through the
logs + `audit_log`.

Auth: send `Authorization: Bearer <supabase access token>` (from `POST
/api/v1/auth/login`). Role is read from the user's `profiles` row.

## Endpoint map (→ frontend repository method it will back)

| Frontend `Repositories` method | Endpoint(s) |
|---|---|
| `session.getCurrentUser` | `GET /api/v1/auth/session` · `POST /api/v1/auth/login` · `POST /api/v1/auth/logout` · `POST /api/v1/auth/forgot-password` |
| `student.getOverview` | `GET /api/v1/overview/student` |
| `student.getCourses` | `GET /api/v1/me/courses` |
| `student.getPracticeMaterial` | `GET /api/v1/practice-materials` |
| `student.getHomework` | `GET /api/v1/me/homework` · submit: `POST /api/v1/homework` |
| `student.getPayments` | `GET /api/v1/me/payments` |
| `student.getCatalog` | `GET /api/v1/courses` |
| `student.getHolidays` | `GET /api/v1/holidays` |
| `student.getHelp` | `GET /api/v1/help` · `POST /api/v1/support-requests` |
| `*.getAnnouncements` | `GET /api/v1/announcements` · `POST /api/v1/announcements/:id/read` · `POST /api/v1/announcements/read-all` |
| `teacher.getOverview` | `GET /api/v1/overview/teacher` |
| `teacher.getBatches` / `admin.getBatches` | `GET /api/v1/batches` · `POST /api/v1/batches` · `PATCH /api/v1/batches/:id` |
| `teacher.getHomeworkQueue` | `GET /api/v1/homework/queue` · `POST /api/v1/homework/:id/feedback` |
| `teacher.getSchedule` | `GET /api/v1/class-sessions?scope=me` |
| `teacher.getAttendance` | `GET /api/v1/attendance?batch=&date=` · `PATCH /api/v1/attendance/:classSessionId` |
| `teacher.getClassLog` | `GET /api/v1/class-logs` (teacher: own view) · `POST /api/v1/class-logs` |
| `admin.getClassLogs` | `GET /api/v1/class-logs` (admin: filter `teacher`/`batch`/`date`) · `PATCH /api/v1/class-logs/:id` |
| `admin.getOverview` | `GET /api/v1/overview/admin` |
| `admin.getStudents` | `GET /api/v1/students?q=&batch=&country=` · `POST /api/v1/students` · `GET/PATCH /api/v1/students/:mksmNo` |
| add / manage teacher | `GET /api/v1/teachers` · `POST /api/v1/teachers` · `PATCH /api/v1/teachers/:id` |
| `admin.getPracticeLibrary` | `GET /api/v1/practice-materials?scope=library` · `POST /api/v1/practice-materials` · `POST /api/v1/practice-materials/:id/shares` |
| `admin.getSubscriptions` | `GET /api/v1/subscriptions` · `POST /api/v1/subscriptions/sync` |
| `admin.getFormOptions` | `GET /api/v1/form-options` · `GET /api/v1/ragas` |
| `leaderboard.getLeaderboard` | `GET /api/v1/sankalp/leaderboard?month=` · `GET /api/v1/sankalp/summary` · `POST /api/v1/sankalp/logs` |
| DEA alerts | `GET /api/v1/dea-alerts` · `POST /api/v1/dea-alerts` · `PATCH /api/v1/dea-alerts/:id` |
| recording requests | `GET/POST /api/v1/recording-requests` · `PATCH /api/v1/recording-requests/:id` |
| WhatsApp screen | `GET /api/v1/whatsapp/templates` · `GET/PUT /api/v1/whatsapp/connection` |
| file uploads | `POST /api/v1/files/sign-upload` · `GET /api/v1/files/:id` |

## Frontend integration (later, not done here)

1. Point the frontend at `@mksm/contracts` for its domain types (it currently has
   a local copy in `frontend/src/data/types.ts`).
2. Add an HTTP implementation of `Repositories`
   (`frontend/src/data/repositories.ts`) that calls these endpoints, parsing
   responses with the contract schemas.
3. Switch the factory in `frontend/src/data/index.ts` from the mock to the HTTP
   impl (gate on an env flag). No screen changes required — every screen already
   depends only on the repository interfaces.

## Scope guardrails (unchanged — PRD §7/§9)

Subscriptions are a **read-only** mirror — `POST /subscriptions/sync` upserts
from a supplied payload; there is no live Razorpay/PayPal call. Zoom links are
static text. No payment processing, no Zoom API, no WhatsApp provider API.
