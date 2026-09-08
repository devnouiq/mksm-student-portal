/*
  Sankalp — self-reported practice hours (PRD 8.1). Leaderboard rankings come
  from the SQL views; a month filter narrows the underlying logs.
*/
import { eq, sql } from "drizzle-orm";
import type {
  CreateSankalpLogRequest,
  LeaderboardBatchRow,
  LeaderboardStudentRow,
  LeaderboardView,
  SankalpSummary,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { CLUB_600_THRESHOLD_HOURS, nextMilestoneHours } from "@/domain/sankalp";
import type { Actor } from "@/lib/supabase/auth";

const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function monthBounds(label: string): { start: string; end: string } | null {
  if (!label || label.toLowerCase() === "all time") return null;
  const d = new Date(`${label} 1`);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

const sankalpRepo = {
  async studentRanking(bounds: { start: string; end: string } | null) {
    return (await db.execute(sql`
      select l.mksm_no, p.full_name as student_name,
             (select b.name from enrollments e join batches b on b.id = e.batch_id
              where e.student_id = l.student_id and e.status = 'active' order by e.enrolled_at desc limit 1) as batch_name,
             round(sum(l.hours), 2) as cumulative_hours,
             count(*) as submission_count,
             (array_agg(l.minutes order by l.submitted_at desc))[1] as last_submitted_mins,
             max(l.logged_for_date) as last_submitted_date
      from sankalp_logs l
      join profiles p on p.id = l.student_id
      where (${bounds === null} = true or (l.logged_for_date >= ${bounds?.start ?? "1970-01-01"} and l.logged_for_date < ${bounds?.end ?? "9999-01-01"}))
      group by l.student_id, l.mksm_no, p.full_name
      order by cumulative_hours desc
      limit 50
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async batchRanking(bounds: { start: string; end: string } | null) {
    return (await db.execute(sql`
      select b.name as batch_name,
             count(distinct e.student_id) as student_count,
             round(coalesce(sum(l.hours), 0), 2) as cumulative_hours,
             round(coalesce(sum(l.hours), 0) / nullif(count(distinct e.student_id), 0), 2) as avg_hours_per_student
      from batches b
      left join enrollments e on e.batch_id = b.id and e.status = 'active'
      left join sankalp_logs l on l.student_id = e.student_id
        and (${bounds === null} = true or (l.logged_for_date >= ${bounds?.start ?? "1970-01-01"} and l.logged_for_date < ${bounds?.end ?? "9999-01-01"}))
      group by b.id, b.name
      order by cumulative_hours desc
      limit 50
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async monthsWithData() {
    return (await db.execute(sql`
      select distinct date_trunc('month', logged_for_date) as m
      from sankalp_logs order by m desc limit 12
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async schoolTarget() {
    const [row] = await db
      .select({ target: schema.sankalpTargets.targetHours })
      .from(schema.sankalpTargets)
      .where(eq(schema.sankalpTargets.scope, "school"))
      .limit(1);
    return row ? Number(row.target) : 50000;
  },

  async schoolAchieved() {
    const rows = (await db.execute(sql`select coalesce(sum(hours), 0) as total from sankalp_logs`)) as unknown as Array<{ total: string }>;
    return Number(rows[0]?.total ?? 0);
  },

  async personal(studentId: string) {
    const rows = (await db.execute(sql`
      select
        coalesce(sum(hours), 0) as total,
        coalesce(sum(hours) filter (where logged_for_date >= (current_date - extract(dow from current_date)::int)), 0) as this_week
      from sankalp_logs where student_id = ${studentId}
    `)) as unknown as Array<{ total: string; this_week: string }>;
    return { total: Number(rows[0]?.total ?? 0), thisWeek: Number(rows[0]?.this_week ?? 0) };
  },
};

function toStudentRow(r: Record<string, unknown>, i: number): LeaderboardStudentRow {
  return {
    position: i + 1,
    mksmNo: String(r["mksm_no"]),
    studentName: String(r["student_name"]),
    batchName: String(r["batch_name"] ?? ""),
    cumulativeHours: Number(r["cumulative_hours"] ?? 0),
    lastSubmittedMins: Number(r["last_submitted_mins"] ?? 0),
    lastSubmittedDate: r["last_submitted_date"] ? String(r["last_submitted_date"]) : "",
    submissionCount: Number(r["submission_count"] ?? 0),
  };
}

export const sankalpService = {
  async leaderboard(month?: string): Promise<LeaderboardView> {
    const bounds = month ? monthBounds(month) : null;
    const [students, batches, months] = await Promise.all([
      sankalpRepo.studentRanking(bounds),
      sankalpRepo.batchRanking(bounds),
      sankalpRepo.monthsWithData(),
    ]);
    const studentRanking = students.map(toStudentRow);
    const batchRanking: LeaderboardBatchRow[] = batches.map((r, i) => ({
      position: i + 1,
      batchName: String(r["batch_name"]),
      studentCount: Number(r["student_count"] ?? 0),
      cumulativeHours: Number(r["cumulative_hours"] ?? 0),
      avgHoursPerStudent: Number(r["avg_hours_per_student"] ?? 0),
    }));

    const monthLabels = months
      .map((m) => (m["m"] ? MONTH_FMT.format(new Date(m["m"] as string)) : null))
      .filter((x): x is string => !!x);

    return {
      month: month ?? monthLabels[0] ?? "All time",
      months: [...monthLabels, "All time"],
      studentRanking: studentRanking.slice(0, 3),
      batchRanking: batchRanking.slice(0, 3),
      club600: studentRanking.filter((s) => s.cumulativeHours >= CLUB_600_THRESHOLD_HOURS),
    };
  },

  async summary(actor: Actor): Promise<SankalpSummary> {
    const [personal, target, achieved] = await Promise.all([
      sankalpRepo.personal(actor.profileId),
      sankalpRepo.schoolTarget(),
      sankalpRepo.schoolAchieved(),
    ]);
    return {
      mksmNo: actor.mksmNo,
      personalHours: Math.round(personal.total * 100) / 100,
      weeklyHours: Math.round(personal.thisWeek * 100) / 100,
      nextMilestoneHours: nextMilestoneHours(personal.total),
      schoolAchievedHours: Math.round(achieved),
      schoolTargetHours: target,
    };
  },

  async createLog(actor: Actor, input: CreateSankalpLogRequest) {
    const [row] = await db
      .insert(schema.sankalpLogs)
      .values({
        studentId: actor.profileId,
        mksmNo: actor.mksmNo,
        minutes: input.minutes,
        loggedForDate: input.loggedForDate,
        source: "portal",
      })
      .returning({ id: schema.sankalpLogs.id });
    return row!;
  },
};

export { sankalpRepo };
