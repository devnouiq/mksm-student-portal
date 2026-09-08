/*
  Batches (admin CRUD + teacher's own list) and enrollments (admin).
  Output shape depends on the caller's role: admins get `AdminBatch`, teachers
  get `TeacherBatch` (with pitch + isClassDay) for the batches they teach.
*/
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type {
  AdminBatch,
  CreateBatchRequest,
  TeacherBatch,
  UpdateBatchRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import {
  dayToDb,
  dayToLabel,
  formatClassTime,
  languageToApi,
  languageToDb,
  levelToApi,
  levelToDb,
  pitchToApi,
  pitchToDb,
} from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";

const batchesRepo = {
  async list(opts: { teacherId?: string } = {}) {
    const rows = await db
      .select({
        id: schema.batches.id,
        name: schema.batches.name,
        courseId: schema.batches.courseId,
        teacherId: schema.batches.teacherId,
        teacherName: schema.profiles.fullName,
        dayOfWeek: schema.batches.dayOfWeek,
        startTime: schema.batches.startTime,
        timezone: schema.batches.timezone,
        pitch: schema.batches.pitch,
        level: schema.batches.level,
        language: schema.batches.language,
        region: schema.batches.region,
        zoomLink: schema.batches.zoomLink,
        isOngoing: schema.batches.isOngoing,
        status: schema.batches.status,
      })
      .from(schema.batches)
      .leftJoin(schema.profiles, eq(schema.profiles.id, schema.batches.teacherId))
      .where(opts.teacherId ? eq(schema.batches.teacherId, opts.teacherId) : undefined)
      .orderBy(asc(schema.batches.name));
    return rows;
  },

  async studentCounts(batchIds: string[]) {
    if (batchIds.length === 0) return new Map<string, number>();
    const rows = await db
      .select({ batchId: schema.enrollments.batchId, n: sql<number>`count(*)::int` })
      .from(schema.enrollments)
      .where(and(inArray(schema.enrollments.batchId, batchIds), eq(schema.enrollments.status, "active")))
      .groupBy(schema.enrollments.batchId);
    return new Map(rows.map((r) => [r.batchId, r.n]));
  },

  async batchesWithClassToday(batchIds: string[]) {
    if (batchIds.length === 0) return new Set<string>();
    const rows = await db.execute<{ batch_id: string }>(sql`
      select distinct cs.batch_id
      from class_sessions cs
      join batches b on b.id = cs.batch_id
      where cs.batch_id = any(${batchIds})
        and cs.scheduled_date = (now() at time zone b.timezone)::date
        and cs.status <> 'cancelled'
    `);
    return new Set((rows as unknown as { batch_id: string }[]).map((r) => r.batch_id));
  },

  async findById(id: string) {
    const [row] = await db.select().from(schema.batches).where(eq(schema.batches.id, id)).limit(1);
    return row ?? null;
  },

  async insert(values: typeof schema.batches.$inferInsert) {
    const [row] = await db.insert(schema.batches).values(values).returning();
    return row!;
  },

  async update(id: string, values: Partial<typeof schema.batches.$inferInsert>) {
    const [row] = await db.update(schema.batches).set(values).where(eq(schema.batches.id, id)).returning();
    return row ?? null;
  },
};

function toAdminBatch(r: Awaited<ReturnType<typeof batchesRepo.list>>[number], count: number): AdminBatch {
  return {
    id: r.id,
    name: r.name,
    studentCount: count,
    teacherName: r.teacherName ?? "Unassigned",
    level: levelToApi[r.level] ?? "Beginner",
    language: languageToApi[r.language] ?? "Hindi",
    day: dayToLabel(r.dayOfWeek),
    time: formatClassTime(r.startTime, r.timezone),
    zoomLink: r.zoomLink ?? "",
  };
}

export const batchesService = {
  async listForActor(actor: Actor): Promise<AdminBatch[] | TeacherBatch[]> {
    if (actor.role === "student") throw AppError.forbidden();
    const rows = await batchesRepo.list(actor.role === "teacher" ? { teacherId: actor.profileId } : {});
    const ids = rows.map((r) => r.id);
    const counts = await batchesRepo.studentCounts(ids);

    if (actor.role === "admin") {
      return rows.map((r) => toAdminBatch(r, counts.get(r.id) ?? 0));
    }

    const classToday = await batchesRepo.batchesWithClassToday(ids);
    return rows.map<TeacherBatch>((r) => ({
      id: r.id,
      name: r.name,
      day: dayToLabel(r.dayOfWeek),
      time: formatClassTime(r.startTime, r.timezone),
      level: levelToApi[r.level] ?? "Beginner",
      language: languageToApi[r.language] ?? "Hindi",
      pitch: pitchToApi[r.pitch] ?? "C#",
      studentCount: counts.get(r.id) ?? 0,
      zoomLink: r.zoomLink ?? "",
      isClassDay: classToday.has(r.id),
    }));
  },

  async create(actor: Actor, input: CreateBatchRequest): Promise<AdminBatch> {
    const teacher = await db
      .select({ id: schema.profiles.id, role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, input.teacherId))
      .limit(1);
    if (!teacher[0] || teacher[0].role !== "teacher") throw AppError.badRequest("teacherId is not a teacher");

    const inserted = await batchesRepo.insert({
      name: input.name,
      courseId: input.courseId,
      teacherId: input.teacherId,
      dayOfWeek: dayToDb[input.day],
      startTime: input.time ?? null,
      pitch: pitchToDb[input.pitch],
      level: levelToDb[input.level],
      language: languageToDb[input.language],
      studentType: input.studentType.toLowerCase() as "kids" | "youth" | "adults",
      genderMix: input.genderMix.toLowerCase() as "male" | "female" | "mix",
      region: input.region,
      zoomLink: input.zoomLink ?? null,
      isOngoing: input.isOngoing ?? false,
    });
    const withTeacher = (await batchesRepo.list()).find((b) => b.id === inserted.id)!;
    return toAdminBatch(withTeacher, 0);
  },

  async update(actor: Actor, id: string, input: UpdateBatchRequest): Promise<AdminBatch> {
    const existing = await batchesRepo.findById(id);
    if (!existing) throw AppError.notFound("Batch not found");

    const patch: Partial<typeof schema.batches.$inferInsert> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.courseId !== undefined) patch.courseId = input.courseId;
    if (input.teacherId !== undefined) patch.teacherId = input.teacherId;
    if (input.day !== undefined) patch.dayOfWeek = dayToDb[input.day];
    if (input.time !== undefined) patch.startTime = input.time;
    if (input.pitch !== undefined) patch.pitch = pitchToDb[input.pitch];
    if (input.level !== undefined) patch.level = levelToDb[input.level];
    if (input.language !== undefined) patch.language = languageToDb[input.language];
    if (input.studentType !== undefined) patch.studentType = input.studentType.toLowerCase() as "kids" | "youth" | "adults";
    if (input.genderMix !== undefined) patch.genderMix = input.genderMix.toLowerCase() as "male" | "female" | "mix";
    if (input.region !== undefined) patch.region = input.region;
    if (input.zoomLink !== undefined) patch.zoomLink = input.zoomLink;
    if (input.isOngoing !== undefined) patch.isOngoing = input.isOngoing;

    const row = await batchesRepo.update(id, patch);
    if (!row) throw AppError.notFound("Batch not found");
    const counts = await batchesRepo.studentCounts([id]);
    const withTeacher = (await batchesRepo.list()).find((b) => b.id === id)!;
    return toAdminBatch(withTeacher, counts.get(id) ?? 0);
  },

  async enroll(studentMksmNo: string, batchId: string) {
    const student = await db
      .select({ id: schema.profiles.id, role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.mksmNo, studentMksmNo))
      .limit(1);
    if (!student[0] || student[0].role !== "student") throw AppError.badRequest("Unknown student MKSM number");
    const batch = await batchesRepo.findById(batchId);
    if (!batch) throw AppError.notFound("Batch not found");

    const [row] = await db
      .insert(schema.enrollments)
      .values({ studentId: student[0].id, batchId })
      .onConflictDoNothing()
      .returning({ id: schema.enrollments.id });
    if (!row) throw AppError.conflict("Student is already enrolled in this batch");
    return row;
  },
};

export { batchesRepo };
