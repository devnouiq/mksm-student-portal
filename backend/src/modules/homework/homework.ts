/*
  Homework: the student's submit view + history, and the teacher's review queue.
  Late flag is frozen at submit time using the pure rule in domain/homework-cutoff.
*/
import { asc, eq, sql } from "drizzle-orm";
import type {
  GiveHomeworkFeedbackRequest,
  HomeworkForReview,
  StudentHomeworkView,
  SubmitHomeworkRequest,
  TeacherHomeworkView,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { getConfig } from "@/lib/config";
import { AppError } from "@/lib/http/errors";
import { isLateSubmission } from "@/domain/homework-cutoff";
import { homeworkStatusToApi } from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";

const homeworkRepo = {
  async upcomingSessionsForStudent(studentId: string) {
    return (await db.execute(sql`
      select cs.id, cs.scheduled_date, cs.scheduled_start, b.name as batch_name, c.name as course_name
      from class_sessions cs
      join batches b on b.id = cs.batch_id
      join courses c on c.id = b.course_id
      join enrollments e on e.batch_id = b.id and e.student_id = ${studentId} and e.status = 'active'
      where cs.scheduled_start >= now() and cs.status <> 'cancelled'
      order by cs.scheduled_start
      limit 8
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async submissionsForStudent(studentId: string) {
    return (await db.execute(sql`
      select h.id, h.title, h.description, h.status, h.is_late, h.submitted_at,
             cs.scheduled_date as class_date, b.name as batch_name, c.name as course_name,
             f.feedback_text, f.feedback_audio_file_id
      from homework_submissions h
      join class_sessions cs on cs.id = h.class_session_id
      join batches b on b.id = h.batch_id
      join courses c on c.id = b.course_id
      left join homework_feedback f on f.submission_id = h.id
      where h.student_id = ${studentId}
      order by h.submitted_at desc
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async teacherBatches(teacherId: string) {
    return db
      .select({ id: schema.batches.id, name: schema.batches.name })
      .from(schema.batches)
      .where(eq(schema.batches.teacherId, teacherId))
      .orderBy(asc(schema.batches.name));
  },

  async queueForBatches(batchIds: string[]) {
    if (batchIds.length === 0) return [] as Array<Record<string, unknown>>;
    return (await db.execute(sql`
      select h.id, p.full_name as student_name, p.mksm_no as student_mksm_no,
             b.name as batch_name, h.title, h.description, h.submitted_at,
             cs.scheduled_date as class_date, h.status, h.is_late,
             (select fo.path from homework_attachments a join file_objects fo on fo.id = a.file_id
              where a.submission_id = h.id order by a.created_at limit 1) as audio_path
      from homework_submissions h
      join profiles p on p.id = h.student_id
      join batches b on b.id = h.batch_id
      join class_sessions cs on cs.id = h.class_session_id
      where h.batch_id = any(${batchIds})
      order by h.submitted_at desc
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async sessionForSubmit(classSessionId: string, studentId: string) {
    const rows = (await db.execute(sql`
      select cs.id, cs.batch_id, cs.scheduled_start,
             exists (select 1 from enrollments e where e.batch_id = cs.batch_id and e.student_id = ${studentId} and e.status = 'active') as enrolled
      from class_sessions cs where cs.id = ${classSessionId} limit 1
    `)) as unknown as Array<Record<string, unknown>>;
    return rows[0] ?? null;
  },

  async submissionWithBatch(id: string) {
    const [row] = await db
      .select({
        id: schema.homeworkSubmissions.id,
        batchId: schema.homeworkSubmissions.batchId,
        studentId: schema.homeworkSubmissions.studentId,
        teacherId: schema.batches.teacherId,
      })
      .from(schema.homeworkSubmissions)
      .innerJoin(schema.batches, eq(schema.batches.id, schema.homeworkSubmissions.batchId))
      .where(eq(schema.homeworkSubmissions.id, id))
      .limit(1);
    return row ?? null;
  },
};

export const homeworkService = {
  async studentView(studentId: string): Promise<StudentHomeworkView> {
    const cutoffDays = getConfig().HOMEWORK_CUTOFF_DAYS;
    const [sessions, submissions] = await Promise.all([
      homeworkRepo.upcomingSessionsForStudent(studentId),
      homeworkRepo.submissionsForStudent(studentId),
    ]);

    return {
      cutoffDays,
      classDates: sessions.map((s) => ({
        value: String(s["id"]),
        batchName: String(s["batch_name"]),
        courseName: String(s["course_name"]),
      })),
      submissions: submissions.map((r) => ({
        id: String(r["id"]),
        title: String(r["title"]),
        description: String(r["description"] ?? ""),
        courseName: String(r["course_name"]),
        batchName: String(r["batch_name"]),
        classDate: String(r["class_date"]),
        submittedAt: new Date(r["submitted_at"] as string).toISOString(),
        status: homeworkStatusToApi[String(r["status"])] ?? "submitted",
        late: Boolean(r["is_late"]),
        feedbackText: (r["feedback_text"] as string) ?? null,
        feedbackAudioUrl: r["feedback_audio_file_id"] ? `/api/v1/files/${r["feedback_audio_file_id"]}` : null,
      })),
    };
  },

  async teacherQueue(teacherId: string): Promise<TeacherHomeworkView> {
    const batches = await homeworkRepo.teacherBatches(teacherId);
    const items = await homeworkRepo.queueForBatches(batches.map((b) => b.id));
    return {
      batches: batches.map((b) => b.name),
      items: items.map<HomeworkForReview>((r) => ({
        id: String(r["id"]),
        studentName: String(r["student_name"]),
        studentMksmNo: String(r["student_mksm_no"]),
        batchName: String(r["batch_name"]),
        title: String(r["title"]),
        description: String(r["description"] ?? ""),
        submittedAt: new Date(r["submitted_at"] as string).toISOString(),
        classDate: String(r["class_date"]),
        status: homeworkStatusToApi[String(r["status"])] ?? "submitted",
        late: Boolean(r["is_late"]),
        audioUrl: r["audio_path"] ? String(r["audio_path"]) : "",
      })),
    };
  },

  async submit(actor: Actor, input: SubmitHomeworkRequest) {
    const session = await homeworkRepo.sessionForSubmit(input.classSessionId, actor.profileId);
    if (!session) throw AppError.notFound("Class session not found");
    if (!session["enrolled"]) throw AppError.forbidden("You are not enrolled in this batch");

    const isLate = isLateSubmission(new Date(session["scheduled_start"] as string).toISOString(), getConfig().HOMEWORK_CUTOFF_DAYS);

    const inserted = await db
      .insert(schema.homeworkSubmissions)
      .values({
        studentId: actor.profileId,
        batchId: session["batch_id"] as string,
        classSessionId: input.classSessionId,
        title: input.title,
        description: input.description ?? "",
        status: "submitted",
        isLate,
      })
      .onConflictDoNothing()
      .returning({ id: schema.homeworkSubmissions.id });

    if (!inserted[0]) throw AppError.conflict("Homework already submitted for this class");
    const submissionId = inserted[0].id;

    if (input.fileIds && input.fileIds.length > 0) {
      await db.insert(schema.homeworkAttachments).values(
        input.fileIds.map((fileId) => ({ submissionId, fileId, kind: "audio" as const })),
      );
    }
    return { id: submissionId, isLate };
  },

  async giveFeedback(actor: Actor, submissionId: string, input: GiveHomeworkFeedbackRequest) {
    const submission = await homeworkRepo.submissionWithBatch(submissionId);
    if (!submission) throw AppError.notFound("Submission not found");
    if (actor.role === "teacher" && submission.teacherId !== actor.profileId) {
      throw AppError.forbidden("Not your batch");
    }

    await db
      .insert(schema.homeworkFeedback)
      .values({
        submissionId,
        teacherId: actor.profileId,
        feedbackText: input.feedbackText,
        feedbackAudioFileId: input.feedbackAudioFileId ?? null,
      })
      .onConflictDoUpdate({
        target: schema.homeworkFeedback.submissionId,
        set: { feedbackText: input.feedbackText, feedbackAudioFileId: input.feedbackAudioFileId ?? null },
      });

    await db
      .update(schema.homeworkSubmissions)
      .set({ status: "reviewed" })
      .where(eq(schema.homeworkSubmissions.id, submissionId));

    return { id: submissionId, status: "reviewed" as const };
  },
};

export { homeworkRepo };
