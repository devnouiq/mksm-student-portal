/*
  Class logs (PRD 8.12). Teachers submit a log after each class and see their own
  history; admins see all logs and can filter by teacher / batch / date and edit
  any of them.
*/
import { asc, eq, sql } from "drizzle-orm";
import type {
  ClassLogEntry,
  CreateClassLogRequest,
  TeacherClassLogView,
  UpdateClassLogRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import type { Actor } from "@/lib/supabase/auth";

const rowsSql = sql`
  select cl.id, cl.class_date, b.name as batch_name,
         coalesce(r.name, '') as raga_covered,
         cl.what_covered, cl.comments, t.full_name as teacher_name
  from class_logs cl
  join batches b on b.id = cl.batch_id
  join profiles t on t.id = cl.teacher_id
  left join ragas r on r.id = cl.raga_id
`;

function toEntry(r: Record<string, unknown>): ClassLogEntry {
  return {
    id: String(r["id"]),
    classDate: String(r["class_date"]),
    batchName: String(r["batch_name"]),
    ragaCovered: String(r["raga_covered"] ?? ""),
    whatCovered: String(r["what_covered"]),
    comments: (r["comments"] as string) ?? null,
    teacherName: String(r["teacher_name"]),
  };
}

const classLogsRepo = {
  async forTeacher(teacherId: string) {
    return (await db.execute(sql`${rowsSql} where cl.teacher_id = ${teacherId} order by cl.class_date desc limit 200`)) as unknown as Array<Record<string, unknown>>;
  },
  async all(filter: { teacher?: string; batch?: string; date?: string }) {
    return (await db.execute(sql`
      ${rowsSql}
      where (${filter.teacher ?? null}::text is null or t.full_name = ${filter.teacher ?? null})
        and (${filter.batch ?? null}::text is null or b.name = ${filter.batch ?? null})
        and (${filter.date ?? null}::date is null or cl.class_date = ${filter.date ?? null}::date)
      order by cl.class_date desc
      limit 500
    `)) as unknown as Array<Record<string, unknown>>;
  },
  async teacherBatchNames(teacherId: string) {
    return (
      await db.select({ name: schema.batches.name }).from(schema.batches).where(eq(schema.batches.teacherId, teacherId)).orderBy(asc(schema.batches.name))
    ).map((b) => b.name);
  },
  async ragaNames() {
    return (
      await db.select({ name: schema.ragas.name }).from(schema.ragas).where(eq(schema.ragas.isActive, true)).orderBy(asc(schema.ragas.sortOrder))
    ).map((r) => r.name);
  },
  async findById(id: string) {
    const [row] = await db.select().from(schema.classLogs).where(eq(schema.classLogs.id, id)).limit(1);
    return row ?? null;
  },
  async batchIfTeacher(batchId: string, teacherId: string) {
    const [row] = await db.select({ teacherId: schema.batches.teacherId }).from(schema.batches).where(eq(schema.batches.id, batchId)).limit(1);
    return !!row && row.teacherId === teacherId;
  },
};

export const classLogsService = {
  async teacherView(actor: Actor): Promise<TeacherClassLogView> {
    const [history, batches, ragas] = await Promise.all([
      classLogsRepo.forTeacher(actor.profileId),
      classLogsRepo.teacherBatchNames(actor.profileId),
      classLogsRepo.ragaNames(),
    ]);
    return { teacherName: actor.fullName, batches, ragas, history: history.map(toEntry) };
  },

  async adminList(filter: { teacher?: string; batch?: string; date?: string }): Promise<ClassLogEntry[]> {
    const rows = await classLogsRepo.all(filter);
    return rows.map(toEntry);
  },

  async create(actor: Actor, input: CreateClassLogRequest) {
    const owns = await classLogsRepo.batchIfTeacher(input.batchId, actor.profileId);
    if (!owns && actor.role !== "admin") throw AppError.forbidden("Not your batch");

    const [row] = await db
      .insert(schema.classLogs)
      .values({
        batchId: input.batchId,
        classDate: input.classDate,
        teacherId: actor.profileId,
        ragaId: input.ragaId,
        whatCovered: input.whatCovered,
        comments: input.comments ?? null,
      })
      .onConflictDoNothing()
      .returning({ id: schema.classLogs.id });
    if (!row) throw AppError.conflict("A log already exists for this batch and date");
    return row;
  },

  async update(actor: Actor, id: string, input: UpdateClassLogRequest) {
    const existing = await classLogsRepo.findById(id);
    if (!existing) throw AppError.notFound("Class log not found");
    if (actor.role === "teacher" && existing.teacherId !== actor.profileId) throw AppError.forbidden("Not your log");

    const patch: Partial<typeof schema.classLogs.$inferInsert> = { editedBy: actor.profileId, editedAt: new Date() };
    if (input.classDate !== undefined) patch.classDate = input.classDate;
    if (input.batchId !== undefined) patch.batchId = input.batchId;
    if (input.ragaId !== undefined) patch.ragaId = input.ragaId;
    if (input.whatCovered !== undefined) patch.whatCovered = input.whatCovered;
    if (input.comments !== undefined) patch.comments = input.comments;

    const [row] = await db.update(schema.classLogs).set(patch).where(eq(schema.classLogs.id, id)).returning({ id: schema.classLogs.id });
    return row!;
  },
};

export { classLogsRepo };
