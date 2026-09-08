/*
  OpenAPI 3.1 spec, generated from the endpoint catalog below + the zod schemas
  in @mksm/contracts. Served at GET /api/openapi.json; rendered by GET /api/docs.

  The catalog is hand-maintained (routes are thin file-based handlers with no
  runtime metadata to introspect). Keep it in sync when adding a route.
*/
import { z } from "zod";
import * as C from "@mksm/contracts";
import { zodToJsonSchema } from "zod-to-json-schema";

type Method = "get" | "post" | "patch" | "put" | "delete";

interface Entry {
  method: Method;
  /** OpenAPI path, e.g. /students/{mksmNo} */
  path: string;
  tag: string;
  summary: string;
  /** "public" or a list of allowed roles ("any" = any signed-in user). */
  auth: "public" | "any" | Array<"student" | "teacher" | "admin">;
  /** Key of a request-body schema exported from @mksm/contracts. */
  reqSchema?: keyof typeof C;
  /** Query params: name -> description. */
  query?: Record<string, string>;
  /** Human note about the success payload (schema name or prose). */
  responds: string;
}

const CATALOG: Entry[] = [
  // ---- health / meta ----
  { method: "get", path: "/../health", tag: "meta", summary: "Liveness + DB ping", auth: "public", responds: "{ status, db, service, time }" },

  // ---- auth ----
  { method: "post", path: "/auth/login", tag: "auth", summary: "Sign in with MKSM number or email + password", auth: "public", reqSchema: "LoginRequestSchema", responds: "{ user: UserProfile, session: { accessToken, refreshToken, expiresAt, tokenType } }" },
  { method: "post", path: "/auth/logout", tag: "auth", summary: "Revoke the current session", auth: "any", responds: "{ ok: true }" },
  { method: "get", path: "/auth/session", tag: "auth", summary: "The signed-in user", auth: "any", responds: "UserProfile" },
  { method: "post", path: "/auth/forgot-password", tag: "auth", summary: "Send a reset email (always 200)", auth: "public", reqSchema: "ForgotPasswordRequestSchema", responds: "{ ok: true, message }" },

  // ---- overview (view models) ----
  { method: "get", path: "/overview/student", tag: "overview", summary: "Student Overview view model", auth: ["student"], responds: "StudentOverview" },
  { method: "get", path: "/overview/teacher", tag: "overview", summary: "Teacher Overview view model", auth: ["teacher"], responds: "TeacherOverview" },
  { method: "get", path: "/overview/admin", tag: "overview", summary: "Admin Overview view model", auth: ["admin"], responds: "AdminOverview" },

  // ---- student "me" ----
  { method: "get", path: "/me/courses", tag: "student", summary: "My Courses", auth: ["student"], responds: "StudentCoursesView" },
  { method: "get", path: "/me/payments", tag: "student", summary: "Payment & Fees", auth: ["student"], responds: "PaymentsView" },
  { method: "get", path: "/me/homework", tag: "student", summary: "Submit-homework view + history", auth: ["student"], responds: "StudentHomeworkView" },
  { method: "post", path: "/me/homework", tag: "student", summary: "Submit homework (alias of POST /homework)", auth: ["student"], reqSchema: "SubmitHomeworkRequestSchema", responds: "{ id, isLate }" },

  // ---- homework ----
  { method: "post", path: "/homework", tag: "homework", summary: "Submit homework for a class session", auth: ["student"], reqSchema: "SubmitHomeworkRequestSchema", responds: "{ id, isLate }" },
  { method: "get", path: "/homework/queue", tag: "homework", summary: "Teacher review queue", auth: ["teacher"], responds: "TeacherHomeworkView" },
  { method: "post", path: "/homework/{id}/feedback", tag: "homework", summary: "Give written / audio feedback (marks reviewed)", auth: ["teacher", "admin"], reqSchema: "GiveHomeworkFeedbackRequestSchema", responds: "{ id, status: 'reviewed' }" },

  // ---- batches / enrollments ----
  { method: "get", path: "/batches", tag: "batches", summary: "Batches (admin: AdminBatch[]; teacher: own TeacherBatch[])", auth: ["teacher", "admin"], responds: "AdminBatch[] | TeacherBatch[]" },
  { method: "post", path: "/batches", tag: "batches", summary: "Create a batch", auth: ["admin"], reqSchema: "CreateBatchRequestSchema", responds: "AdminBatch" },
  { method: "patch", path: "/batches/{id}", tag: "batches", summary: "Edit a batch (incl. Zoom link)", auth: ["admin"], reqSchema: "UpdateBatchRequestSchema", responds: "AdminBatch" },
  { method: "post", path: "/enrollments", tag: "batches", summary: "Enroll a student in a batch", auth: ["admin"], responds: "{ id }", query: {} },

  // ---- schedule / attendance ----
  { method: "get", path: "/class-sessions", tag: "attendance", summary: "Weekly class schedule (scope=me)", auth: ["teacher"], query: { scope: "me" }, responds: "ScheduleEntry[]" },
  { method: "get", path: "/attendance", tag: "attendance", summary: "Attendance for a batch/date", auth: ["teacher", "admin"], query: { batch: "batch name", date: "YYYY-MM-DD (optional)" }, responds: "AttendanceView" },
  { method: "patch", path: "/attendance/{classSessionId}", tag: "attendance", summary: "Adjust attendance records", auth: ["teacher", "admin"], reqSchema: "AdjustAttendanceRequestSchema", responds: "{ updated }" },

  // ---- class logs ----
  { method: "get", path: "/class-logs", tag: "class-logs", summary: "Teacher own view (scope=me) OR admin list (filters)", auth: ["teacher", "admin"], query: { scope: "me (teacher)", teacher: "name (admin)", batch: "name (admin)", date: "YYYY-MM-DD (admin)" }, responds: "TeacherClassLogView | ClassLogEntry[]" },
  { method: "post", path: "/class-logs", tag: "class-logs", summary: "Submit a class log", auth: ["teacher", "admin"], reqSchema: "CreateClassLogRequestSchema", responds: "{ id }" },
  { method: "patch", path: "/class-logs/{id}", tag: "class-logs", summary: "Edit a class log (teacher own / admin any)", auth: ["teacher", "admin"], reqSchema: "UpdateClassLogRequestSchema", responds: "{ id }" },

  // ---- practice materials ----
  { method: "get", path: "/practice-materials", tag: "practice", summary: "Practice material for the caller (scope=library for the admin master)", auth: "any", query: { scope: "library (admin only)" }, responds: "PracticeMaterialView" },
  { method: "post", path: "/practice-materials", tag: "practice", summary: "Upload a material (admin=master, teacher=own)", auth: ["admin", "teacher"], reqSchema: "CreatePracticeMaterialRequestSchema", responds: "{ id }" },
  { method: "post", path: "/practice-materials/{id}/shares", tag: "practice", summary: "Share to a teacher / batch / everyone", auth: ["admin", "teacher"], reqSchema: "SharePracticeMaterialRequestSchema", responds: "{ id }" },

  // ---- announcements ----
  { method: "get", path: "/announcements", tag: "announcements", summary: "Announcements for the caller (audience-scoped, read flag)", auth: "any", responds: "Announcement[]" },
  { method: "post", path: "/announcements", tag: "announcements", summary: "Publish an announcement / MK message", auth: ["admin"], reqSchema: "CreateAnnouncementRequestSchema", responds: "{ id }" },
  { method: "patch", path: "/announcements/{id}", tag: "announcements", summary: "Edit title / body / important", auth: ["admin"], reqSchema: "UpdateAnnouncementRequestSchema", responds: "{ id }" },
  { method: "delete", path: "/announcements/{id}", tag: "announcements", summary: "Remove (soft delete)", auth: ["admin"], responds: "{ id, removed: true }" },
  { method: "post", path: "/announcements/{id}/read", tag: "announcements", summary: "Mark one read", auth: "any", responds: "{ id, read: true }" },
  { method: "post", path: "/announcements/read-all", tag: "announcements", summary: "Mark all read", auth: "any", responds: "{ marked }" },

  // ---- sankalp ----
  { method: "get", path: "/sankalp/leaderboard", tag: "sankalp", summary: "Leaderboard (Top 3 students / batches / 600 Hours Club)", auth: "any", query: { month: "e.g. 'August 2026' or 'All time'" }, responds: "LeaderboardView" },
  { method: "get", path: "/sankalp/summary", tag: "sankalp", summary: "Personal + school Sankalp figures", auth: ["student"], responds: "SankalpSummary" },
  { method: "post", path: "/sankalp/logs", tag: "sankalp", summary: "Log practice minutes", auth: ["student"], reqSchema: "CreateSankalpLogRequestSchema", responds: "{ id }" },

  // ---- subscriptions (read-only mirror) ----
  { method: "get", path: "/subscriptions", tag: "subscriptions", summary: "Subscription directory", auth: ["admin"], responds: "SubscriptionRow[]" },
  { method: "post", path: "/subscriptions/sync", tag: "subscriptions", summary: "Upsert status + payments from a payload (no provider call)", auth: ["admin"], reqSchema: "SubscriptionSyncRequestSchema", responds: "{ subscriptionsUpserted, paymentsUpserted }" },

  // ---- students / teachers ----
  { method: "get", path: "/students", tag: "directory", summary: "Active Students directory (searchable)", auth: ["admin"], query: { q: "search", batch: "batch name", country: "country" }, responds: "StudentDirectoryRow[]" },
  { method: "post", path: "/students", tag: "directory", summary: "Onboard a student (creates the Auth user + enrollment)", auth: ["admin"], reqSchema: "CreateStudentRequestSchema", responds: "{ id, mksmNo }" },
  { method: "get", path: "/students/{mksmNo}", tag: "directory", summary: "One directory row", auth: ["admin"], responds: "StudentDirectoryRow" },
  { method: "patch", path: "/students/{mksmNo}", tag: "directory", summary: "Edit a student", auth: ["admin"], reqSchema: "UpdateStudentRequestSchema", responds: "{ id, mksmNo }" },
  { method: "get", path: "/teachers", tag: "directory", summary: "Teacher list", auth: ["admin"], responds: "{ id, mksmNo, name, email, phone, accessLevel }[]" },
  { method: "post", path: "/teachers", tag: "directory", summary: "Onboard a teacher", auth: ["admin"], reqSchema: "CreateTeacherRequestSchema", responds: "{ id, mksmNo }" },
  { method: "patch", path: "/teachers/{id}", tag: "directory", summary: "Edit a teacher", auth: ["admin"], reqSchema: "UpdateTeacherRequestSchema", responds: "{ id, mksmNo }" },

  // ---- reference / catalog ----
  { method: "get", path: "/courses", tag: "reference", summary: "Course catalog ('Explore Other Courses')", auth: "any", responds: "CatalogCourse[]" },
  { method: "get", path: "/holidays", tag: "reference", summary: "Holiday calendar", auth: "any", query: { year: "e.g. 2026" }, responds: "Holiday[]" },
  { method: "get", path: "/help", tag: "reference", summary: "Tutorials + FAQs", auth: "any", responds: "HelpView" },
  { method: "post", path: "/support-requests", tag: "reference", summary: "Raise a support request", auth: "any", reqSchema: "CreateSupportRequestSchema", responds: "{ id }" },
  { method: "get", path: "/form-options", tag: "reference", summary: "Dropdown options (batches, teachers, ragas)", auth: ["admin"], responds: "AdminFormOptions" },
  { method: "get", path: "/ragas", tag: "reference", summary: "Raga list ({ id, name })", auth: "any", responds: "{ id, name }[]" },

  // ---- DEA / recordings / whatsapp ----
  { method: "get", path: "/dea-alerts", tag: "engagement", summary: "De-Enrollment Alerts (teacher: own; admin: all)", auth: ["teacher", "admin"], responds: "DeaAlert[]" },
  { method: "post", path: "/dea-alerts", tag: "engagement", summary: "Raise a DEA alert (de-enrolls the student)", auth: ["admin"], reqSchema: "CreateDeaAlertRequestSchema", responds: "{ id }" },
  { method: "patch", path: "/dea-alerts/{id}", tag: "engagement", summary: "Update alert status", auth: ["teacher", "admin"], reqSchema: "UpdateDeaAlertRequestSchema", responds: "{ id }" },
  { method: "get", path: "/recording-requests", tag: "engagement", summary: "Recording requests visible to the caller", auth: "any", responds: "RecordingRequest[]" },
  { method: "post", path: "/recording-requests", tag: "engagement", summary: "Raise a recording request", auth: ["student"], reqSchema: "CreateRecordingRequestSchema", responds: "{ id, requestedOn }" },
  { method: "patch", path: "/recording-requests/{id}", tag: "engagement", summary: "Update request status (fulfil / decline)", auth: ["teacher", "admin"], reqSchema: "UpdateRecordingRequestSchema", responds: "{ id }" },
  { method: "get", path: "/whatsapp/templates", tag: "engagement", summary: "WhatsApp message templates", auth: ["admin"], responds: "WhatsappTemplate[]" },
  { method: "get", path: "/whatsapp/connection", tag: "engagement", summary: "WhatsApp connection settings", auth: ["admin"], responds: "{ status, provider, businessAccountId }" },
  { method: "put", path: "/whatsapp/connection", tag: "engagement", summary: "Update WhatsApp connection settings", auth: ["admin"], reqSchema: "UpdateWhatsappConnectionRequestSchema", responds: "echoes the payload" },

  // ---- files ----
  { method: "post", path: "/files/sign-upload", tag: "files", summary: "Get a signed Storage upload URL + fileId", auth: "any", reqSchema: "SignUploadRequestSchema", responds: "{ fileId, bucket, path, uploadUrl, token }" },
  { method: "get", path: "/files/{id}", tag: "files", summary: "Get a short-lived signed download URL", auth: "any", responds: "{ url, originalName, mimeType }" },
];

const V1 = "/api/v1";

function buildComponents(): Record<string, unknown> {
  const schemas: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(C)) {
    if (!name.endsWith("Schema")) continue;
    if (!(value instanceof z.ZodType)) continue;
    try {
      schemas[name] = zodToJsonSchema(value as z.ZodTypeAny, { target: "openApi3", $refStrategy: "none" });
    } catch {
      /* skip schemas that can't be represented */
    }
  }
  return schemas;
}

function envelope(dataDescription: string) {
  return {
    description: dataDescription,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { description: dataDescription },
            correlationId: { type: "string" },
          },
          required: ["data", "correlationId"],
        },
      },
    },
  };
}

const errorResponse = {
  description: "Error envelope",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
            required: ["code", "message"],
          },
          correlationId: { type: "string" },
        },
        required: ["error", "correlationId"],
      },
    },
  },
};

export function buildOpenApi(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const e of CATALOG) {
    const fullPath = e.path.startsWith("/../") ? e.path.replace("/../", "/api/") : `${V1}${e.path}`;
    paths[fullPath] ??= {};

    const parameters: unknown[] = [];
    for (const m of fullPath.matchAll(/\{(\w+)\}/g)) {
      parameters.push({ name: m[1], in: "path", required: true, schema: { type: "string" } });
    }
    for (const [name, desc] of Object.entries(e.query ?? {})) {
      parameters.push({ name, in: "query", required: false, description: desc, schema: { type: "string" } });
    }

    const security = e.auth === "public" ? [] : [{ bearerAuth: [] }];
    const rolesNote =
      e.auth === "public" ? "No auth." : e.auth === "any" ? "Any signed-in user." : `Roles: ${e.auth.join(", ")}.`;

    const op: Record<string, unknown> = {
      tags: [e.tag],
      summary: e.summary,
      description: rolesNote,
      security,
      parameters,
      responses: {
        "200": envelope(e.responds),
        "401": { $ref: "#/components/responses/Error" },
        "403": { $ref: "#/components/responses/Error" },
        "422": { $ref: "#/components/responses/Error" },
        "500": { $ref: "#/components/responses/Error" },
      },
    };

    if (e.reqSchema) {
      op.requestBody = {
        required: true,
        content: { "application/json": { schema: { $ref: `#/components/schemas/${String(e.reqSchema)}` } } },
      };
    }

    paths[fullPath][e.method] = op;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "MKSM Student Portal — Backend API",
      version: "0.1.0",
      description:
        "REST API for the MKSM Student Portal. Every response is a `{ data, correlationId }` (or `{ error, correlationId }`) envelope. Authenticate with `Authorization: Bearer <supabase access token>` from `POST /api/v1/auth/login`.",
    },
    servers: [{ url: "http://localhost:3001", description: "local dev" }],
    tags: [...new Set(CATALOG.map((e) => e.tag))].map((name) => ({ name })),
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      responses: { Error: errorResponse },
      schemas: buildComponents(),
    },
    paths,
  };
}

export const CATALOG_COUNT = CATALOG.length;
