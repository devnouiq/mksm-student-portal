/*
  Read-only aggregators that assemble the StudentOverview / TeacherOverview /
  AdminOverview view models the frontend screens expect. Each pulls from the
  other services + a few direct view queries.
*/
import { eq, sql } from "drizzle-orm";
import type {
  AdminOverview,
  ProviderBreakdown,
  StudentOverview,
  TeacherOverview,
  VoicesOfMksm,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { providerToApi } from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";
import { toUserProfile } from "@/modules/_shared/user-profile";
import { announcementsService } from "@/modules/announcements/announcements";
import { meService } from "@/modules/me/me";
import { sankalpService } from "@/modules/sankalp/sankalp";

async function voicesOfMksm(): Promise<VoicesOfMksm> {
  const [row] = await db
    .select({ value: schema.integrationSettings.value })
    .from(schema.integrationSettings)
    .where(eq(schema.integrationSettings.key, "voices_of_mksm"))
    .limit(1);
  const v = (row?.value ?? {}) as Partial<VoicesOfMksm>;
  return {
    youtubeUrl: v.youtubeUrl ?? "",
    title: v.title ?? "Voices of MKSM",
    month: v.month ?? "",
  };
}

export const overviewService = {
  async student(actor: Actor): Promise<StudentOverview> {
    const [coursesView, sankalp, announcements, voices, paymentsView] = await Promise.all([
      meService.courses(actor.profileId),
      sankalpService.summary(actor),
      announcementsService.list(actor),
      voicesOfMksm(),
      meService.payments(actor.profileId),
    ]);

    const mk = (await db.execute(sql`
      select a.id, a.title, a.body, a.media_kind, a.media_url, a.published_at,
             coalesce(g.label, 'All Students') as audience_label
      from announcements a
      left join announcement_audience_groups g on g.id = a.audience_group_id
      where a.deleted_at is null and a.source = 'mahesh_kale'
      order by a.published_at desc limit 1
    `)) as unknown as Array<Record<string, unknown>>;

    const mkRow = mk[0];
    const firstPayment = paymentsView.rows[0];
    return {
      student: toUserProfile({
        id: actor.profileId,
        role: actor.role,
        mksmNo: actor.mksmNo,
        fullName: actor.fullName,
        email: actor.email,
      }),
      subscription: firstPayment
        ? {
            provider: firstPayment.provider,
            status: firstPayment.status,
            daysToRenew: firstPayment.daysToRenew,
            pendingDuesMinor: firstPayment.pendingDuesMinor,
          }
        : { provider: "razorpay", status: "active", daysToRenew: null, pendingDuesMinor: 0 },
      courses: coursesView.courses.map((c) => ({
        courseId: c.courseId,
        courseName: c.courseName,
        batchName: c.batchName,
        teacherName: c.teacherName,
        progress: c.progress,
        nextClassAt: c.nextClassAt,
        isClassDay: c.isClassDay,
        ongoing: c.ongoing,
      })),
      sankalp,
      voices,
      announcements,
      mkMessage: mkRow
        ? {
            id: String(mkRow["id"]),
            kind: (mkRow["media_kind"] as "video" | "audio" | "text") ?? "text",
            title: String(mkRow["title"]),
            body: String(mkRow["body"]),
            mediaUrl: (mkRow["media_url"] as string) ?? null,
            postedAt: new Date(mkRow["published_at"] as string).toISOString(),
            audienceLabel: String(mkRow["audience_label"] ?? "All Students"),
          }
        : null,
      alerts: announcements.filter((a) => a.important).map((a) => a.title),
    };
  },

  async teacher(actor: Actor): Promise<TeacherOverview> {
    const announcements = await announcementsService.listIncludingMahesh(actor);

    const stats = (await db.execute(sql`
      select
        coalesce(s.submitted, 0) as submitted,
        coalesce(s.reviewed, 0) as reviewed,
        coalesce(s.review_pending, 0) as review_pending,
        coalesce(s.homework_pending, 0) as homework_pending
      from (select 1) x
      left join v_teacher_homework_stats s on s.teacher_id = ${actor.profileId}
    `)) as unknown as Array<Record<string, unknown>>;

    const counts = (await db.execute(sql`
      select count(distinct b.id)::int as batch_count,
             coalesce(count(distinct e.student_id), 0)::int as student_count
      from batches b
      left join enrollments e on e.batch_id = b.id and e.status = 'active'
      where b.teacher_id = ${actor.profileId}
    `)) as unknown as Array<Record<string, unknown>>;

    const pending = (await db.execute(sql`
      select batch_name, class_date from v_pending_class_logs
      where teacher_id = ${actor.profileId}
      order by class_date desc limit 1
    `)) as unknown as Array<Record<string, unknown>>;

    const dea = (await db.execute(sql`
      select d.id, d.code, p.full_name as student_name, b.name as batch_name
      from de_enrollment_alerts d
      join profiles p on p.id = d.student_id
      join batches b on b.id = d.batch_id
      where d.teacher_id = ${actor.profileId} and d.status <> 'resolved'
      order by d.created_at desc
    `)) as unknown as Array<Record<string, unknown>>;

    const target = (await db.execute(sql`
      select coalesce((select target_hours from sankalp_targets where scope = 'teacher' and scope_teacher_id = ${actor.profileId} limit 1), 6000) as target,
             coalesce((
               select sum(l.hours) from sankalp_logs l
               join enrollments e on e.student_id = l.student_id and e.status = 'active'
               join batches b on b.id = e.batch_id and b.teacher_id = ${actor.profileId}
             ), 0) as achieved
    `)) as unknown as Array<Record<string, unknown>>;

    const s = stats[0] ?? {};
    const c = counts[0] ?? {};
    const p = pending[0];
    const t = target[0] ?? {};

    return {
      teacher: toUserProfile({
        id: actor.profileId,
        role: actor.role,
        mksmNo: actor.mksmNo,
        fullName: actor.fullName,
        email: actor.email,
      }),
      announcements,
      homework: {
        submitted: Number(s["submitted"] ?? 0),
        reviewed: Number(s["reviewed"] ?? 0),
        reviewPending: Number(s["review_pending"] ?? 0),
        homeworkPending: Number(s["homework_pending"] ?? 0),
      },
      batchCount: Number(c["batch_count"] ?? 0),
      studentCount: Number(c["student_count"] ?? 0),
      pendingClassLog: p ? { batchName: String(p["batch_name"]), classDate: String(p["class_date"]) } : null,
      deaAlerts: dea.map((r) => ({
        id: String(r["id"]),
        code: String(r["code"]),
        studentName: String(r["student_name"]),
        batchName: String(r["batch_name"]),
      })),
      sankalpTargetHours: Number(t["target"] ?? 6000),
      sankalpAchievedHours: Math.round(Number(t["achieved"] ?? 0)),
    };
  },

  async admin(actor: Actor): Promise<AdminOverview> {
    const announcements = await announcementsService.listIncludingMahesh(actor);

    const providerRows = (await db.execute(sql`
      select provider,
             count(*)::int as total,
             count(*) filter (where status = 'active')::int as active,
             count(*) filter (where status = 'cancelled')::int as cancelled,
             count(*) filter (where status in ('halted','suspended'))::int as inactive
      from subscriptions
      where provider <> 'one_time'
      group by provider
    `)) as unknown as Array<Record<string, unknown>>;

    const providers: ProviderBreakdown[] = providerRows.map((r) => {
      const provider = providerToApi[String(r["provider"])] ?? "razorpay";
      return {
        provider,
        total: Number(r["total"] ?? 0),
        active: Number(r["active"] ?? 0),
        cancelled: Number(r["cancelled"] ?? 0),
        inactiveLabel: provider === "razorpay" ? "Halted" : "Suspended",
        inactive: Number(r["inactive"] ?? 0),
      };
    });

    const batchAgg = (await db.execute(sql`
      select
        count(*) filter (where status = 'active')::int as active_batches,
        count(*) filter (where region = 'india' and status = 'active')::int as india_batches,
        count(*) filter (where region = 'international' and status = 'active')::int as intl_batches,
        count(*) filter (where level = 'beginner' and status = 'active')::int as beginner_batches,
        count(*) filter (where level = 'intermediate' and status = 'active')::int as intermediate_batches
      from batches
    `)) as unknown as Array<Record<string, unknown>>;

    const fees = (await db.execute(sql`
      select count(*)::int as n from subscriptions where pending_dues_minor > 0 or next_due_date < current_date
    `)) as unknown as Array<{ n: number }>;

    const sankalp = (await db.execute(sql`
      select coalesce((select target_hours from sankalp_targets where scope = 'school' limit 1), 50000) as target,
             coalesce((select sum(hours) from sankalp_logs), 0) as achieved
    `)) as unknown as Array<Record<string, unknown>>;

    const b = batchAgg[0] ?? {};
    const sk = sankalp[0] ?? {};

    return {
      admin: toUserProfile({
        id: actor.profileId,
        role: actor.role,
        mksmNo: actor.mksmNo,
        fullName: actor.fullName,
        email: actor.email,
      }),
      announcements,
      providers,
      sankalpTargetHours: Number(sk["target"] ?? 50000),
      sankalpAchievedHours: Math.round(Number(sk["achieved"] ?? 0)),
      activeBatches: Number(b["active_batches"] ?? 0),
      indiaBatches: Number(b["india_batches"] ?? 0),
      intlBatches: Number(b["intl_batches"] ?? 0),
      beginnerBatches: Number(b["beginner_batches"] ?? 0),
      intermediateBatches: Number(b["intermediate_batches"] ?? 0),
      pendingFeesCount: Number(fees[0]?.n ?? 0),
    };
  },
};

