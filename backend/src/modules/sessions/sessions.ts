/*
  Class schedule (read-only, PRD 5.2) and attendance. Attendance is auto-marked
  Present (Online) when a student joins via Zoom on the class day; the teacher
  reviews and adjusts here.
*/
import { asc, eq, sql } from "drizzle-orm";
import type { AdjustAttendanceRequest, AttendanceView, ScheduleEntry } from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { dayToLabel, formatClassTime, levelToApi, pitchToApi } from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";

const sessionsRepo = {
  async teacherBatches(teacherId: string) {
    return db
      .select({
        id: schema.batches.id,
        name: schema.batches.name,
        dayOfWeek: schema.batches.dayOfWeek,
        startTime: schema.batches.startTime,
        timezone: schema.batches.timezone,
        level: schema.batches.level,
        pitch: schema.batches.pitch,
      })
      .from(schema.batches)
      .where(eq(schema.batches.teacherId, teacherId))
      .orderBy(asc(schema.batches.name));
  },

  async batchByNameForActor(name: string, actor: Actor) {
    const [row] = await db
      .select({ id: schema.batches.id, teacherId: schema.batches.teacherId, name: schema.batches.name })
      .from(schema.batches)
      .where(eq(schema.batches.name, name))
      .limit(1);
    if (!row) return null;
    if (actor.role === "teacher" && row.teacherId !== actor.profileId) throw AppError.forbidden("Not your batch");
    return row;
  },

  async latestSession(batchId: string, date?: string) {
    const rows = (await db.execute(sql`
      select id, scheduled_date from class_sessions
      where batch_id = ${batchId}
        and (${date ?? null}::date is null or scheduled_date = ${date ?? null}::date)
      order by scheduled_date desc limit 1
    `)) as unknown as Array<{ id: string; scheduled_date: string }>;
    return rows[0] ?? null;
  },

  async rosterWithAttendance(batchId: string, sessionId: string | null) {
    return (await db.execute(sql`
      select p.full_name as student_name, p.mksm_no,
             coalesce(ar.present, false) as present,
             ar.mode
      from enrollments e
      join profiles p on p.id = e.student_id
      left join attendance_records ar on ar.student_id = e.student_id and ar.class_session_id = ${sessionId}
      where e.batch_id = ${batchId} and e.status = 'active'
      order by p.full_name
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async sessionWithBatch(sessionId: string) {
    const [row] = await db
      .select({ id: schema.classSessions.id, batchId: schema.classSessions.batchId, teacherId: schema.batches.teacherId })
      .from(schema.classSessions)
      .innerJoin(schema.batches, eq(schema.batches.id, schema.classSessions.batchId))
      .where(eq(schema.classSessions.id, sessionId))
      .limit(1);
    return row ?? null;
  },
};

export const sessionsService = {
  async schedule(actor: Actor): Promise<ScheduleEntry[]> {
    const batches = await sessionsRepo.teacherBatches(actor.profileId);
    return batches.map<ScheduleEntry>((b) => ({
      id: b.id,
      day: dayToLabel(b.dayOfWeek),
      time: formatClassTime(b.startTime, b.timezone),
      batchName: b.name,
      level: levelToApi[b.level] ?? "Beginner",
      pitch: pitchToApi[b.pitch] ?? "C#",
    }));
  },

  async attendance(actor: Actor, batchName: string | null, date: string | null): Promise<AttendanceView> {
    const batchNames =
      actor.role === "admin"
        ? (await db.select({ name: schema.batches.name }).from(schema.batches).orderBy(asc(schema.batches.name))).map((b) => b.name)
        : (await sessionsRepo.teacherBatches(actor.profileId)).map((b) => b.name);

    const targetName = batchName ?? batchNames[0];
    if (!targetName) return { batches: batchNames, classDate: date ?? new Date().toISOString().slice(0, 10), records: [] };

    const batch = await sessionsRepo.batchByNameForActor(targetName, actor);
    if (!batch) throw AppError.notFound("Batch not found");

    const session = await sessionsRepo.latestSession(batch.id, date ?? undefined);
    const roster = await sessionsRepo.rosterWithAttendance(batch.id, session?.id ?? null);

    return {
      batches: batchNames,
      classDate: session?.scheduled_date ?? date ?? new Date().toISOString().slice(0, 10),
      records: roster.map((r) => ({
        studentName: String(r["student_name"]),
        mksmNo: String(r["mksm_no"]),
        present: Boolean(r["present"]),
        mode: (r["mode"] as "online" | "offline" | null) ?? null,
      })),
    };
  },

  async adjust(actor: Actor, classSessionId: string, input: AdjustAttendanceRequest) {
    const session = await sessionsRepo.sessionWithBatch(classSessionId);
    if (!session) throw AppError.notFound("Class session not found");
    if (actor.role === "teacher" && session.teacherId !== actor.profileId) throw AppError.forbidden("Not your batch");

    let updated = 0;
    for (const rec of input.records) {
      const [student] = await db
        .select({ id: schema.profiles.id })
        .from(schema.profiles)
        .where(eq(schema.profiles.mksmNo, rec.studentMksmNo))
        .limit(1);
      if (!student) continue;
      const mode = rec.present ? rec.mode ?? "offline" : null;
      await db
        .insert(schema.attendanceRecords)
        .values({
          classSessionId,
          studentId: student.id,
          present: rec.present,
          mode,
          source: actor.role === "admin" ? "admin" : "teacher",
          markedByProfileId: actor.profileId,
        })
        .onConflictDoUpdate({
          target: [schema.attendanceRecords.classSessionId, schema.attendanceRecords.studentId],
          set: { present: rec.present, mode, source: actor.role === "admin" ? "admin" : "teacher", markedByProfileId: actor.profileId },
        });
      updated += 1;
    }
    return { updated };
  },
};

export { sessionsRepo };
