/*
  Student "me" views: My Courses and Payment & Fees.
*/
import { sql } from "drizzle-orm";
import type { CourseDetail, PaymentRow, PaymentsView, StudentCoursesView } from "@mksm/contracts";
import { db } from "@/lib/db/client";
import {
  dayToLabel,
  formatClassTime,
  levelToApi,
  pitchToApi,
  providerToApi,
  subStatusToApi,
} from "@/domain/mappers";

function daysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export const meService = {
  async courses(studentId: string): Promise<StudentCoursesView> {
    const rows = (await db.execute(sql`
      select
        v.course_id, v.course_name, v.batch_name, v.teacher_name,
        v.display_progress, v.ongoing, v.next_class_at, v.is_class_day,
        v.day_of_week, v.start_time, v.timezone, v.pitch, v.level, v.zoom_link,
        v.attendance_pct,
        (
          select rr.requested_at from recording_requests rr
          where rr.enrollment_id = v.enrollment_id and rr.status in ('requested','in_progress')
          order by rr.requested_at desc limit 1
        ) as recording_requested_on
      from v_enrollment_progress v
      where v.student_id = ${studentId}
      order by v.course_name
    `)) as unknown as Array<Record<string, unknown>>;

    const courses: CourseDetail[] = rows.map((r) => ({
      courseId: String(r["course_id"]),
      courseName: String(r["course_name"]),
      batchName: String(r["batch_name"] ?? ""),
      teacherName: String(r["teacher_name"] ?? "Unassigned"),
      progress: Number(r["display_progress"] ?? 0),
      nextClassAt: (r["next_class_at"] as string) ?? null,
      isClassDay: Boolean(r["is_class_day"]),
      ongoing: Boolean(r["ongoing"]),
      day: dayToLabel(String(r["day_of_week"])),
      time: formatClassTime((r["start_time"] as string) ?? null, String(r["timezone"] ?? "Asia/Kolkata")),
      pitch: pitchToApi[String(r["pitch"])] ?? "C#",
      level: levelToApi[String(r["level"])] ?? "Beginner",
      attendancePct: Number(r["attendance_pct"] ?? 0),
      zoomLink: (r["zoom_link"] as string) ?? "",
      recordingRequestedOn: (r["recording_requested_on"] as string) ?? null,
    }));
    return { courses };
  },

  async payments(studentId: string): Promise<PaymentsView> {
    const rows = (await db.execute(sql`
      select s.provider, s.status, s.next_due_date, s.pending_dues_minor,
             coalesce(c.name, 'Subscription') as course_name
      from subscriptions s
      left join courses c on c.id = s.course_id
      where s.student_id = ${studentId}
      order by course_name
    `)) as unknown as Array<Record<string, unknown>>;

    const paymentRows: PaymentRow[] = rows.map((r) => ({
      courseName: String(r["course_name"]),
      provider: providerToApi[String(r["provider"])] ?? "razorpay",
      status: subStatusToApi[String(r["status"])] ?? "active",
      daysToRenew: daysUntil((r["next_due_date"] as string) ?? null),
      pendingDuesMinor: Number(r["pending_dues_minor"] ?? 0),
    }));
    return { rows: paymentRows };
  },
};
