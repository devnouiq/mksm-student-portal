/*
  De-Enrollment Alerts, Recording Requests, and the WhatsApp screen data.
  - DEA: manual admin action; the alert is routed to the student's batch teacher;
    teachers see only their own (PRD 8.2/8.3).
  - Recording requests: raised by the student; fulfilled manually (PRD 8.4).
  - WhatsApp: templates list + a single connection settings row. No provider API.
*/
import { and, asc, eq, sql } from "drizzle-orm";
import type {
  CreateDeaAlertRequest,
  CreateRecordingRequest,
  DeaAlert,
  UpdateDeaAlertRequest,
  UpdateRecordingRequest,
  UpdateWhatsappConnectionRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import type { Actor } from "@/lib/supabase/auth";

const WHATSAPP_KEY = "whatsapp_connection";

const engagementRepo = {
  async deaAlerts(actor: Actor) {
    return (await db.execute(sql`
      select d.id, d.code, p.full_name as student_name, b.name as batch_name, d.status
      from de_enrollment_alerts d
      join profiles p on p.id = d.student_id
      join batches b on b.id = d.batch_id
      where (${actor.role === "admin"} = true or d.teacher_id = ${actor.profileId})
      order by d.created_at desc
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async deaSequence(studentId: string) {
    const rows = (await db.execute(sql`select count(*)::int as n from de_enrollment_alerts where student_id = ${studentId}`)) as unknown as Array<{ n: number }>;
    return (rows[0]?.n ?? 0) + 1;
  },

  async recordingRequests(actor: Actor) {
    return (await db.execute(sql`
      select rr.id, rr.status, rr.note, rr.requested_at, rr.fulfilled_at,
             p.full_name as student_name, p.mksm_no, c.name as course_name, b.name as batch_name
      from recording_requests rr
      join profiles p on p.id = rr.student_id
      join enrollments e on e.id = rr.enrollment_id
      join batches b on b.id = e.batch_id
      join courses c on c.id = b.course_id
      where (
        ${actor.role === "admin"} = true
        or rr.student_id = ${actor.profileId}
        or b.teacher_id = ${actor.profileId}
      )
      order by rr.requested_at desc
    `)) as unknown as Array<Record<string, unknown>>;
  },
};

export const engagementService = {
  async listDea(actor: Actor): Promise<DeaAlert[]> {
    const rows = await engagementRepo.deaAlerts(actor);
    return rows.map((r) => ({
      id: String(r["id"]),
      code: String(r["code"]),
      studentName: String(r["student_name"]),
      batchName: String(r["batch_name"]),
    }));
  },

  async createDea(actor: Actor, input: CreateDeaAlertRequest) {
    const [student] = await db.select({ id: schema.profiles.id }).from(schema.profiles).where(eq(schema.profiles.mksmNo, input.studentMksmNo)).limit(1);
    if (!student) throw AppError.badRequest("Unknown student MKSM number");
    const [batch] = await db.select({ id: schema.batches.id, teacherId: schema.batches.teacherId }).from(schema.batches).where(eq(schema.batches.id, input.batchId)).limit(1);
    if (!batch) throw AppError.notFound("Batch not found");

    const sequence = await engagementRepo.deaSequence(student.id);
    const [row] = await db
      .insert(schema.deEnrollmentAlerts)
      .values({
        code: `DEA-${sequence}`,
        sequence,
        studentId: student.id,
        batchId: batch.id,
        teacherId: batch.teacherId,
        reason: input.reason ?? null,
        createdBy: actor.profileId,
      })
      .returning({ id: schema.deEnrollmentAlerts.id });
    // De-enrollment itself is a manual admin action; reflect it on the enrollment.
    await db
      .update(schema.enrollments)
      .set({ status: "de_enrolled", endedAt: new Date().toISOString().slice(0, 10) })
      .where(and(eq(schema.enrollments.studentId, student.id), eq(schema.enrollments.batchId, batch.id)));
    return row!;
  },

  async updateDea(actor: Actor, id: string, input: UpdateDeaAlertRequest) {
    const [existing] = await db.select().from(schema.deEnrollmentAlerts).where(eq(schema.deEnrollmentAlerts.id, id)).limit(1);
    if (!existing) throw AppError.notFound("Alert not found");
    if (actor.role === "teacher" && existing.teacherId !== actor.profileId) throw AppError.forbidden();
    const [row] = await db.update(schema.deEnrollmentAlerts).set({ status: input.status }).where(eq(schema.deEnrollmentAlerts.id, id)).returning({ id: schema.deEnrollmentAlerts.id });
    return row!;
  },

  async listRecordingRequests(actor: Actor) {
    const rows = await engagementRepo.recordingRequests(actor);
    return rows.map((r) => ({
      id: String(r["id"]),
      status: String(r["status"]),
      note: (r["note"] as string) ?? null,
      requestedAt: new Date(r["requested_at"] as string).toISOString(),
      fulfilledAt: r["fulfilled_at"] ? new Date(r["fulfilled_at"] as string).toISOString() : null,
      studentName: String(r["student_name"]),
      studentMksmNo: String(r["mksm_no"]),
      courseName: String(r["course_name"]),
      batchName: String(r["batch_name"]),
    }));
  },

  async createRecordingRequest(actor: Actor, input: CreateRecordingRequest) {
    const [enrollment] = await db
      .select({ id: schema.enrollments.id, studentId: schema.enrollments.studentId })
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, input.enrollmentId))
      .limit(1);
    if (!enrollment || enrollment.studentId !== actor.profileId) throw AppError.forbidden("Not your enrollment");

    const [row] = await db
      .insert(schema.recordingRequests)
      .values({
        studentId: actor.profileId,
        enrollmentId: input.enrollmentId,
        classSessionId: input.classSessionId ?? null,
        note: input.note ?? null,
      })
      .returning({ id: schema.recordingRequests.id, requestedAt: schema.recordingRequests.requestedAt });
    return { id: row!.id, requestedOn: row!.requestedAt?.toISOString() ?? new Date().toISOString() };
  },

  async updateRecordingRequest(actor: Actor, id: string, input: UpdateRecordingRequest) {
    const [existing] = await db
      .select({ id: schema.recordingRequests.id, enrollmentId: schema.recordingRequests.enrollmentId })
      .from(schema.recordingRequests)
      .where(eq(schema.recordingRequests.id, id))
      .limit(1);
    if (!existing) throw AppError.notFound("Request not found");

    if (actor.role === "teacher") {
      const [batch] = await db
        .select({ teacherId: schema.batches.teacherId })
        .from(schema.enrollments)
        .innerJoin(schema.batches, eq(schema.batches.id, schema.enrollments.batchId))
        .where(eq(schema.enrollments.id, existing.enrollmentId))
        .limit(1);
      if (!batch || batch.teacherId !== actor.profileId) throw AppError.forbidden("Not your batch");
    } else if (actor.role !== "admin") {
      throw AppError.forbidden();
    }

    const fulfilled = input.status === "fulfilled";
    const [row] = await db
      .update(schema.recordingRequests)
      .set({
        status: input.status,
        note: input.note ?? undefined,
        fulfilledAt: fulfilled ? new Date() : null,
        fulfilledByProfileId: fulfilled ? actor.profileId : null,
      })
      .where(eq(schema.recordingRequests.id, id))
      .returning({ id: schema.recordingRequests.id });
    return row!;
  },

  async whatsappTemplates() {
    return db.select().from(schema.whatsappTemplates).orderBy(asc(schema.whatsappTemplates.name));
  },

  async whatsappConnection() {
    const [row] = await db.select().from(schema.integrationSettings).where(eq(schema.integrationSettings.key, WHATSAPP_KEY)).limit(1);
    return row?.value ?? { status: "awaiting_verification", provider: null, businessAccountId: null };
  },

  async updateWhatsappConnection(actor: Actor, input: UpdateWhatsappConnectionRequest) {
    await db
      .insert(schema.integrationSettings)
      .values({ key: WHATSAPP_KEY, value: input as never, updatedBy: actor.profileId })
      .onConflictDoUpdate({ target: schema.integrationSettings.key, set: { value: input as never, updatedBy: actor.profileId } });
    return input;
  },
};

export { engagementRepo };
