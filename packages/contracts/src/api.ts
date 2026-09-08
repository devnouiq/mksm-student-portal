/*
  Request DTOs for every mutating endpoint. Field names and options are taken
  from the frontend forms so the frontend can bind directly:
    - admin/add-student/add-student-form.tsx
    - admin/add-teacher/add-teacher-form.tsx
    - admin/manage-batches/batch-form.tsx
    - admin/announcements/announcement-form.tsx  + manage-list.tsx (edit)
    - teacher/class-log/class-log-form.tsx
    - student/homework/homework-submit-form.tsx
    - teacher/homework/homework-queue.tsx  (Give Feedback)
    - teacher/attendance/attendance-table.tsx  (Mark present/absent)
*/

import { z } from "zod";
import {
  AnnouncementAudienceSchema,
  AnnouncementSourceSchema,
  BatchGenderMixSchema,
  BatchStudentTypeSchema,
  ClassLanguageSchema,
  CourseLevelSchema,
  DayOfWeekSchema,
  DeaStatusSchema,
  GenderSchema,
  MaterialKindSchema,
  PitchVariantSchema,
  RecordingRequestStatusSchema,
  SubscriptionProviderSchema,
  SubscriptionStatusSchema,
  TeacherAccessLevelSchema,
  WhatsappTemplateStatusSchema,
} from "./enums";

export const MKSM_NO_REGEX = /^[0-9]{6}$/;
const mksmNo = z.string().regex(MKSM_NO_REGEX, "MKSM number must be 6 digits");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "Must be an https:// URL");

/* ----------------------------- auth ----------------------------- */

export const LoginRequestSchema = z.object({
  /** MKSM number or email. */
  identifier: z.string().min(1),
  password: z.string().min(1),
  keepSignedIn: z.boolean().optional().default(false),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

/* --------------------------- students --------------------------- */

export const CreateStudentRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email(),
  dob: isoDate.optional(),
  age: z.number().int().min(3).max(100).optional(),
  gender: GenderSchema.optional(),
  experience: z.number().int().min(0).max(80).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("India"),
  pincode: z.string().optional(),
  batchId: z.string().uuid().optional(),
  additionalInfo: z.string().optional(),
  /** Optional explicit MKSM number; auto-generated when omitted. */
  mksmNo: mksmNo.optional(),
});
export type CreateStudentRequest = z.infer<typeof CreateStudentRequestSchema>;

export const UpdateStudentRequestSchema = CreateStudentRequestSchema.partial().omit({
  mksmNo: true,
});
export type UpdateStudentRequest = z.infer<typeof UpdateStudentRequestSchema>;

/* --------------------------- teachers --------------------------- */

export const CreateTeacherRequestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email(),
  address: z.string().optional(),
  accessLevel: TeacherAccessLevelSchema.default("Teacher — standard"),
  batchId: z.string().uuid().optional(),
  mksmNo: mksmNo.optional(),
});
export type CreateTeacherRequest = z.infer<typeof CreateTeacherRequestSchema>;

export const UpdateTeacherRequestSchema = CreateTeacherRequestSchema.partial().omit({
  mksmNo: true,
});
export type UpdateTeacherRequest = z.infer<typeof UpdateTeacherRequestSchema>;

/* ---------------------------- batches --------------------------- */

export const CreateBatchRequestSchema = z.object({
  name: z.string().min(1),
  courseId: z.string().uuid(),
  teacherId: z.string().uuid(),
  day: DayOfWeekSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM").optional(),
  pitch: PitchVariantSchema,
  studentType: BatchStudentTypeSchema,
  genderMix: BatchGenderMixSchema.default("Mix"),
  language: ClassLanguageSchema,
  level: CourseLevelSchema,
  region: z.enum(["india", "international"]).default("india"),
  zoomLink: httpsUrl.optional(),
  isOngoing: z.boolean().optional().default(false),
});
export type CreateBatchRequest = z.infer<typeof CreateBatchRequestSchema>;

export const UpdateBatchRequestSchema = CreateBatchRequestSchema.partial();
export type UpdateBatchRequest = z.infer<typeof UpdateBatchRequestSchema>;

/* ------------------------- announcements ----------------------- */

export const CreateAnnouncementRequestSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().min(1),
    source: AnnouncementSourceSchema.default("admin"),
    important: z.boolean().optional().default(false),
    audience: AnnouncementAudienceSchema.default("all"),
    /** audience === "custom" */
    audienceGroup: z.string().optional(),
    /** audience === "batch" */
    batchId: z.string().uuid().optional(),
    /** audience === "student" */
    studentMksmNo: mksmNo.optional(),
    attachmentFileId: z.string().uuid().optional(),
    /** source === "mahesh-kale" media message */
    mediaKind: z.enum(["video", "audio", "text"]).optional(),
    mediaUrl: z.string().url().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.audience === "custom" && !v.audienceGroup)
      ctx.addIssue({ code: "custom", path: ["audienceGroup"], message: "Required for custom audience" });
    if (v.audience === "batch" && !v.batchId)
      ctx.addIssue({ code: "custom", path: ["batchId"], message: "Required for batch audience" });
    if (v.audience === "student" && !v.studentMksmNo)
      ctx.addIssue({ code: "custom", path: ["studentMksmNo"], message: "Required for student audience" });
  });
export type CreateAnnouncementRequest = z.infer<typeof CreateAnnouncementRequestSchema>;

export const UpdateAnnouncementRequestSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  important: z.boolean().optional(),
});
export type UpdateAnnouncementRequest = z.infer<typeof UpdateAnnouncementRequestSchema>;

/* --------------------------- class log ------------------------- */

export const CreateClassLogRequestSchema = z.object({
  classDate: isoDate,
  batchId: z.string().uuid(),
  ragaId: z.string().uuid(),
  whatCovered: z.string().min(1),
  comments: z.string().optional(),
});
export type CreateClassLogRequest = z.infer<typeof CreateClassLogRequestSchema>;

export const UpdateClassLogRequestSchema = CreateClassLogRequestSchema.partial();
export type UpdateClassLogRequest = z.infer<typeof UpdateClassLogRequestSchema>;

/* --------------------------- homework -------------------------- */

export const SubmitHomeworkRequestSchema = z.object({
  classSessionId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  fileIds: z.array(z.string().uuid()).max(5).optional().default([]),
});
export type SubmitHomeworkRequest = z.infer<typeof SubmitHomeworkRequestSchema>;

export const GiveHomeworkFeedbackRequestSchema = z.object({
  feedbackText: z.string().min(1),
  feedbackAudioFileId: z.string().uuid().optional(),
});
export type GiveHomeworkFeedbackRequest = z.infer<typeof GiveHomeworkFeedbackRequestSchema>;

/* -------------------------- attendance ------------------------- */

export const AdjustAttendanceRequestSchema = z.object({
  records: z
    .array(
      z.object({
        studentMksmNo: mksmNo,
        present: z.boolean(),
        mode: z.enum(["online", "offline"]).nullable().optional(),
      }),
    )
    .min(1),
});
export type AdjustAttendanceRequest = z.infer<typeof AdjustAttendanceRequestSchema>;

/* ---------------------------- sankalp -------------------------- */

export const CreateSankalpLogRequestSchema = z.object({
  minutes: z.number().int().positive(),
  loggedForDate: isoDate,
});
export type CreateSankalpLogRequest = z.infer<typeof CreateSankalpLogRequestSchema>;

/* --------------------------- support -------------------------- */

export const CreateSupportRequestSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
});
export type CreateSupportRequest = z.infer<typeof CreateSupportRequestSchema>;

/* ----------------------- recording requests ------------------- */

export const CreateRecordingRequestSchema = z.object({
  enrollmentId: z.string().uuid(),
  classSessionId: z.string().uuid().optional(),
  note: z.string().optional(),
});
export type CreateRecordingRequest = z.infer<typeof CreateRecordingRequestSchema>;

export const UpdateRecordingRequestSchema = z.object({
  status: RecordingRequestStatusSchema,
  note: z.string().optional(),
});
export type UpdateRecordingRequest = z.infer<typeof UpdateRecordingRequestSchema>;

/* --------------------------- DEA alerts ----------------------- */

export const CreateDeaAlertRequestSchema = z.object({
  studentMksmNo: mksmNo,
  batchId: z.string().uuid(),
  reason: z.string().optional(),
});
export type CreateDeaAlertRequest = z.infer<typeof CreateDeaAlertRequestSchema>;

export const UpdateDeaAlertRequestSchema = z.object({
  status: DeaStatusSchema,
});
export type UpdateDeaAlertRequest = z.infer<typeof UpdateDeaAlertRequestSchema>;

/* ---------------------- practice materials -------------------- */

export const CreatePracticeMaterialRequestSchema = z.object({
  title: z.string().min(1),
  kind: MaterialKindSchema,
  pitch: PitchVariantSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  fileId: z.string().uuid().optional(),
  externalUrl: z.string().url().optional(),
  meta: z.string().optional().default(""),
});
export type CreatePracticeMaterialRequest = z.infer<typeof CreatePracticeMaterialRequestSchema>;

export const SharePracticeMaterialRequestSchema = z
  .object({
    target: z.enum(["teacher", "batch", "all"]),
    teacherId: z.string().uuid().optional(),
    batchId: z.string().uuid().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.target === "teacher" && !v.teacherId)
      ctx.addIssue({ code: "custom", path: ["teacherId"], message: "Required" });
    if (v.target === "batch" && !v.batchId)
      ctx.addIssue({ code: "custom", path: ["batchId"], message: "Required" });
  });
export type SharePracticeMaterialRequest = z.infer<typeof SharePracticeMaterialRequestSchema>;

/* -------------------- subscriptions (read-only sync) ---------- */

export const SubscriptionSyncItemSchema = z.object({
  studentMksmNo: mksmNo,
  provider: SubscriptionProviderSchema,
  externalSubscriptionId: z.string().min(1),
  status: SubscriptionStatusSchema,
  activeCycle: z.number().int().min(0).default(0),
  paidCycle: z.number().int().min(0).default(0),
  startDate: isoDate.optional(),
  nextDueDate: isoDate.nullable().optional(),
  pendingDuesMinor: z.number().int().min(0).default(0),
  courseId: z.string().uuid().optional(),
  payments: z
    .array(
      z.object({
        externalPaymentId: z.string().min(1),
        amountMinor: z.number().int().min(0),
        currency: z.string().default("INR"),
        status: z.string().default("captured"),
        paidAt: z.string(),
      }),
    )
    .optional()
    .default([]),
});
export type SubscriptionSyncItem = z.infer<typeof SubscriptionSyncItemSchema>;

export const SubscriptionSyncRequestSchema = z.object({
  items: z.array(SubscriptionSyncItemSchema).min(1),
});
export type SubscriptionSyncRequest = z.infer<typeof SubscriptionSyncRequestSchema>;

/* --------------------------- whatsapp ------------------------- */

export const UpdateWhatsappConnectionRequestSchema = z.object({
  businessAccountId: z.string().optional(),
  provider: z.string().optional(),
  status: z.enum(["connected", "awaiting_verification", "disconnected"]),
});
export type UpdateWhatsappConnectionRequest = z.infer<
  typeof UpdateWhatsappConnectionRequestSchema
>;

export const UpdateWhatsappTemplateRequestSchema = z.object({
  status: WhatsappTemplateStatusSchema,
  body: z.string().optional(),
  providerTemplateId: z.string().optional(),
});
export type UpdateWhatsappTemplateRequest = z.infer<
  typeof UpdateWhatsappTemplateRequestSchema
>;

/* ----------------------- files / uploads --------------------- */

export const SignUploadRequestSchema = z.object({
  bucket: z.enum(["homework", "feedback-audio", "practice-material", "announcements", "avatars"]),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
});
export type SignUploadRequest = z.infer<typeof SignUploadRequestSchema>;
