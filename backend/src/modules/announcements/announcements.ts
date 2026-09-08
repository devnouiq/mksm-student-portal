/*
  Announcements. Reads are audience-scoped and carry a per-viewer `read` flag.
  Body is markdown-lite (**bold** / *italic*) — stored raw and rendered safely
  by the client (same injection-safe approach as the frontend prototype); the
  server never interpolates it into HTML.
*/
import { and, eq, sql } from "drizzle-orm";
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import type { Actor } from "@/lib/supabase/auth";

const SOURCE_TO_API: Record<string, NonNullable<Announcement["source"]>> = {
  admin: "admin",
  mahesh_kale: "mahesh-kale",
  community: "community",
};
const SOURCE_TO_DB: Record<string, "admin" | "mahesh_kale" | "community"> = {
  admin: "admin",
  "mahesh-kale": "mahesh_kale",
  community: "community",
};
const AUDIENCE_TO_DB: Record<string, "all" | "custom_group" | "batch" | "student" | "teachers"> = {
  all: "all",
  custom: "custom_group",
  batch: "batch",
  student: "student",
};

const announcementsRepo = {
  async listForViewer(actor: Actor, includeMahesh: boolean) {
    return (await db.execute(sql`
      select a.id, a.title, a.body, a.source, a.is_important, a.published_at,
             g.label as group_label,
             (ar.profile_id is not null) as read
      from announcements a
      left join announcement_audience_groups g on g.id = a.audience_group_id
      left join announcement_reads ar on ar.announcement_id = a.id and ar.profile_id = ${actor.profileId}
      where a.deleted_at is null
        and (${includeMahesh} = true or a.source <> 'mahesh_kale')
        and (
          ${actor.role === "admin"} = true
          or a.author_id = ${actor.profileId}
          or a.audience = 'all'
          or (a.audience = 'teachers' and ${actor.role} = 'teacher')
          or (a.audience = 'custom_group')
          or (a.audience = 'student' and a.audience_student_id = ${actor.profileId})
          or (a.audience = 'batch' and a.audience_batch_id in (
                select b.id from batches b where b.teacher_id = ${actor.profileId}
                union
                select e.batch_id from enrollments e where e.student_id = ${actor.profileId} and e.status = 'active'
             ))
        )
      order by a.published_at desc
      limit 200
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async findLive(id: string) {
    const [row] = await db
      .select()
      .from(schema.announcements)
      .where(and(eq(schema.announcements.id, id), sql`${schema.announcements.deletedAt} is null`))
      .limit(1);
    return row ?? null;
  },
};

function toApi(r: Record<string, unknown>): Announcement {
  return {
    id: String(r["id"]),
    title: String(r["title"]),
    body: String(r["body"]),
    postedAt: new Date(r["published_at"] as string).toISOString(),
    read: Boolean(r["read"]),
    source: SOURCE_TO_API[String(r["source"])] ?? "admin",
    important: Boolean(r["is_important"]),
    ...(r["group_label"] ? { audienceLabel: String(r["group_label"]) } : {}),
  };
}

export const announcementsService = {
  async list(actor: Actor): Promise<Announcement[]> {
    const rows = await announcementsRepo.listForViewer(actor, false);
    return rows.map(toApi);
  },

  async listIncludingMahesh(actor: Actor): Promise<Announcement[]> {
    const rows = await announcementsRepo.listForViewer(actor, true);
    return rows.map(toApi);
  },

  async create(actor: Actor, input: CreateAnnouncementRequest) {
    let audienceBatchId: string | null = null;
    let audienceStudentId: string | null = null;
    let audienceGroupId: string | null = null;

    if (input.audience === "batch") audienceBatchId = input.batchId!;
    if (input.audience === "student") {
      const [s] = await db
        .select({ id: schema.profiles.id })
        .from(schema.profiles)
        .where(eq(schema.profiles.mksmNo, input.studentMksmNo!))
        .limit(1);
      if (!s) throw AppError.badRequest("Unknown student MKSM number");
      audienceStudentId = s.id;
    }
    if (input.audience === "custom") {
      const [g] = await db
        .select({ id: schema.announcementAudienceGroups.id })
        .from(schema.announcementAudienceGroups)
        .where(eq(schema.announcementAudienceGroups.label, input.audienceGroup!))
        .limit(1);
      audienceGroupId = g?.id ?? null;
    }

    const [row] = await db
      .insert(schema.announcements)
      .values({
        title: input.title,
        body: input.body,
        source: SOURCE_TO_DB[input.source] ?? "admin",
        authorId: actor.profileId,
        isImportant: input.important ?? false,
        attachmentFileId: input.attachmentFileId ?? null,
        audience: AUDIENCE_TO_DB[input.audience] ?? "all",
        audienceBatchId,
        audienceStudentId,
        audienceGroupId,
        mediaKind: input.mediaKind ?? null,
        mediaUrl: input.mediaUrl ?? null,
      })
      .returning({ id: schema.announcements.id });
    return row!;
  },

  async update(id: string, input: UpdateAnnouncementRequest) {
    const existing = await announcementsRepo.findLive(id);
    if (!existing) throw AppError.notFound("Announcement not found");
    const patch: Partial<typeof schema.announcements.$inferInsert> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.body !== undefined) patch.body = input.body;
    if (input.important !== undefined) patch.isImportant = input.important;
    const [row] = await db
      .update(schema.announcements)
      .set(patch)
      .where(eq(schema.announcements.id, id))
      .returning({ id: schema.announcements.id });
    return row!;
  },

  async remove(id: string) {
    const existing = await announcementsRepo.findLive(id);
    if (!existing) throw AppError.notFound("Announcement not found");
    await db.update(schema.announcements).set({ deletedAt: new Date() }).where(eq(schema.announcements.id, id));
    return { id, removed: true };
  },

  async markRead(actor: Actor, id: string) {
    await db
      .insert(schema.announcementReads)
      .values({ announcementId: id, profileId: actor.profileId })
      .onConflictDoNothing();
    return { id, read: true };
  },

  async markAllRead(actor: Actor) {
    const rows = await announcementsRepo.listForViewer(actor, true);
    if (rows.length === 0) return { marked: 0 };
    await db
      .insert(schema.announcementReads)
      .values(rows.map((r) => ({ announcementId: String(r["id"]), profileId: actor.profileId })))
      .onConflictDoNothing();
    return { marked: rows.length };
  },
};

export { announcementsRepo };
