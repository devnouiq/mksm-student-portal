/*
  Drizzle table definitions. These MIRROR the SQL in supabase/migrations/ — the
  SQL is the source of truth. Used for typed queries in the repositories.
  (Views like v_sankalp_student_totals are queried with raw `sql` where needed.)
*/
import {
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import * as e from "./enums";

const ts = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const id = () => uuid().primaryKey().defaultRandom();

export const profiles = pgTable("profiles", {
  id: uuid().primaryKey(),
  role: e.userRole().notNull(),
  mksmNo: text("mksm_no").notNull().unique(),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  fullName: text("full_name").notNull().default(""),
  email: text().notNull().unique(),
  phone: text(),
  country: text(),
  city: text(),
  postalAddress: text("postal_address"),
  pincode: text(),
  dateOfBirth: date("date_of_birth"),
  gender: e.gender(),
  avatarFileId: uuid("avatar_file_id"),
  status: e.profileStatus().notNull().default("active"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const studentDetails = pgTable("student_details", {
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  yearsExperience: integer("years_experience"),
  additionalInfo: text("additional_info"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const teacherDetails = pgTable("teacher_details", {
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  accessLevel: e.teacherAccessLevel("access_level").notNull().default("standard"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const courses = pgTable("courses", {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull().default(""),
  level: e.courseLevel().notNull(),
  language: e.classLanguage().notNull(),
  priceLabel: text("price_label").notNull().default(""),
  isCatalogVisible: boolean("is_catalog_visible").notNull().default(true),
  createdAt: ts(),
  updatedAt: ts(),
});

export const batches = pgTable("batches", {
  id: id(),
  name: text().notNull().unique(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  teacherId: uuid("teacher_id").references(() => profiles.id),
  dayOfWeek: e.dayOfWeek("day_of_week").notNull(),
  startTime: time("start_time"),
  timezone: text().notNull().default("Asia/Kolkata"),
  pitch: e.pitchVariant().notNull(),
  level: e.courseLevel().notNull(),
  language: e.classLanguage().notNull(),
  studentType: e.batchStudentType("student_type").notNull().default("adults"),
  genderMix: e.batchGenderMix("gender_mix").notNull().default("mix"),
  region: e.batchRegion().notNull().default("india"),
  zoomLink: text("zoom_link"),
  isOngoing: boolean("is_ongoing").notNull().default(false),
  status: text().notNull().default("active"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const enrollments = pgTable("enrollments", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id),
  status: e.enrollmentStatus().notNull().default("active"),
  progress: numeric({ precision: 4, scale: 3 }).notNull().default("0"),
  enrolledAt: date("enrolled_at").notNull().defaultNow(),
  endedAt: date("ended_at"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const classSessions = pgTable("class_sessions", {
  id: id(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }).notNull(),
  status: e.classSessionStatus().notNull().default("scheduled"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: id(),
  classSessionId: uuid("class_session_id").notNull().references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  present: boolean().notNull().default(false),
  mode: e.attendanceMode(),
  source: e.attendanceSource().notNull().default("teacher"),
  joinedViaZoomAt: timestamp("joined_via_zoom_at", { withTimezone: true }),
  markedByProfileId: uuid("marked_by_profile_id").references(() => profiles.id),
  createdAt: ts(),
  updatedAt: ts(),
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id),
  classSessionId: uuid("class_session_id").notNull().references(() => classSessions.id),
  title: text().notNull(),
  description: text().notNull().default(""),
  status: e.homeworkStatus().notNull().default("submitted"),
  isLate: boolean("is_late").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: ts(),
  updatedAt: ts(),
});

export const homeworkAttachments = pgTable("homework_attachments", {
  id: id(),
  submissionId: uuid("submission_id").notNull().references(() => homeworkSubmissions.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").notNull(),
  kind: e.materialKind().notNull(),
  createdAt: ts(),
});

export const homeworkFeedback = pgTable("homework_feedback", {
  id: id(),
  submissionId: uuid("submission_id").notNull().unique().references(() => homeworkSubmissions.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => profiles.id),
  feedbackText: text("feedback_text").notNull().default(""),
  feedbackAudioFileId: uuid("feedback_audio_file_id"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const practiceMaterials = pgTable("practice_materials", {
  id: id(),
  title: text().notNull(),
  kind: e.materialKind().notNull(),
  pitch: e.pitchVariant(),
  ownerRole: e.materialOwnerRole("owner_role").notNull(),
  ownerProfileId: uuid("owner_profile_id").notNull().references(() => profiles.id),
  notes: text(),
  fileId: uuid("file_id"),
  externalUrl: text("external_url"),
  meta: text().notNull().default(""),
  createdAt: ts(),
  updatedAt: ts(),
});

export const practiceMaterialShares = pgTable("practice_material_shares", {
  id: id(),
  materialId: uuid("material_id").notNull().references(() => practiceMaterials.id, { onDelete: "cascade" }),
  target: e.materialShareTarget().notNull(),
  targetTeacherId: uuid("target_teacher_id").references(() => profiles.id, { onDelete: "cascade" }),
  targetBatchId: uuid("target_batch_id").references(() => batches.id, { onDelete: "cascade" }),
  sharedByProfileId: uuid("shared_by_profile_id").notNull().references(() => profiles.id),
  createdAt: ts(),
});

export const announcementAudienceGroups = pgTable("announcement_audience_groups", {
  id: id(),
  label: text().notNull().unique(),
  filter: jsonb().notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts(),
  updatedAt: ts(),
});

export const announcements = pgTable("announcements", {
  id: id(),
  title: text().notNull(),
  body: text().notNull(),
  source: e.announcementSource().notNull().default("admin"),
  authorId: uuid("author_id").references(() => profiles.id),
  isImportant: boolean("is_important").notNull().default(false),
  attachmentFileId: uuid("attachment_file_id"),
  audience: e.announcementAudience().notNull().default("all"),
  audienceGroupId: uuid("audience_group_id").references(() => announcementAudienceGroups.id),
  audienceBatchId: uuid("audience_batch_id").references(() => batches.id, { onDelete: "cascade" }),
  audienceStudentId: uuid("audience_student_id").references(() => profiles.id, { onDelete: "cascade" }),
  mediaKind: e.mkMediaKind("media_kind"),
  mediaUrl: text("media_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: ts(),
  updatedAt: ts(),
});

export const announcementReads = pgTable("announcement_reads", {
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sankalpLogs = pgTable("sankalp_logs", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  mksmNo: text("mksm_no").notNull(),
  minutes: integer().notNull(),
  hours: numeric({ precision: 8, scale: 2 }),
  loggedForDate: date("logged_for_date").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  source: e.sankalpLogSource().notNull().default("portal"),
  externalRef: text("external_ref"),
  createdAt: ts(),
});

export const sankalpTargets = pgTable("sankalp_targets", {
  id: id(),
  scope: e.sankalpScope().notNull(),
  scopeTeacherId: uuid("scope_teacher_id").references(() => profiles.id, { onDelete: "cascade" }),
  period: text().notNull().default("all-time"),
  targetHours: numeric("target_hours", { precision: 12, scale: 2 }).notNull(),
  createdAt: ts(),
  updatedAt: ts(),
});

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => courses.id),
  provider: e.subscriptionProvider().notNull(),
  externalSubscriptionId: text("external_subscription_id").notNull(),
  status: e.subscriptionStatus().notNull(),
  activeCycle: integer("active_cycle").notNull().default(0),
  paidCycle: integer("paid_cycle").notNull().default(0),
  startDate: date("start_date"),
  nextDueDate: date("next_due_date"),
  pendingDuesMinor: bigint("pending_dues_minor", { mode: "number" }).notNull().default(0),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
  raw: jsonb(),
  createdAt: ts(),
  updatedAt: ts(),
});

export const subscriptionPayments = pgTable("subscription_payments", {
  id: id(),
  subscriptionId: uuid("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  externalPaymentId: text("external_payment_id").notNull().unique(),
  amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
  currency: text().notNull().default("INR"),
  status: text().notNull().default("captured"),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull(),
  raw: jsonb(),
  createdAt: ts(),
});

export const ragas = pgTable("ragas", {
  id: id(),
  name: text().notNull().unique(),
  season: text(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts(),
  updatedAt: ts(),
});

export const holidays = pgTable("holidays", {
  id: id(),
  holidayDate: date("holiday_date").notNull(),
  name: text().notNull(),
  kind: e.holidayKind().notNull(),
  year: integer(),
  createdAt: ts(),
  updatedAt: ts(),
});

export const helpTutorials = pgTable("help_tutorials", {
  id: id(),
  title: text().notNull(),
  description: text().notNull().default(""),
  durationLabel: text("duration_label").notNull().default(""),
  videoUrl: text("video_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts(),
  updatedAt: ts(),
});

export const helpFaqs = pgTable("help_faqs", {
  id: id(),
  question: text().notNull(),
  answer: text().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts(),
  updatedAt: ts(),
});

export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: id(),
  name: text().notNull().unique(),
  description: text().notNull().default(""),
  status: e.whatsappTemplateStatus().notNull().default("pending"),
  body: text(),
  triggerEvent: text("trigger_event"),
  providerTemplateId: text("provider_template_id"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const integrationSettings = pgTable("integration_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull().default({}),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  createdAt: ts(),
  updatedAt: ts(),
});

export const classLogs = pgTable("class_logs", {
  id: id(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  classSessionId: uuid("class_session_id").references(() => classSessions.id),
  classDate: date("class_date").notNull(),
  teacherId: uuid("teacher_id").notNull().references(() => profiles.id),
  ragaId: uuid("raga_id").references(() => ragas.id),
  whatCovered: text("what_covered").notNull(),
  comments: text(),
  editedBy: uuid("edited_by").references(() => profiles.id),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  createdAt: ts(),
  updatedAt: ts(),
});

export const deEnrollmentAlerts = pgTable("de_enrollment_alerts", {
  id: id(),
  code: text().notNull(),
  sequence: integer().notNull().default(1),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").references(() => profiles.id),
  reason: text(),
  status: e.deaStatus().notNull().default("open"),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: ts(),
  updatedAt: ts(),
});

export const recordingRequests = pgTable("recording_requests", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  classSessionId: uuid("class_session_id").references(() => classSessions.id),
  status: e.recordingRequestStatus().notNull().default("requested"),
  note: text(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  fulfilledByProfileId: uuid("fulfilled_by_profile_id").references(() => profiles.id),
  createdAt: ts(),
  updatedAt: ts(),
});

export const fileObjects = pgTable("file_objects", {
  id: id(),
  bucket: text().notNull(),
  path: text().notNull(),
  originalName: text("original_name").notNull().default(""),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
  uploadedByProfileId: uuid("uploaded_by_profile_id").references(() => profiles.id),
  createdAt: ts(),
});

export const supportRequests = pgTable("support_requests", {
  id: id(),
  requesterId: uuid("requester_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  subject: text().notNull(),
  message: text().notNull(),
  status: e.supportStatus().notNull().default("open"),
  createdAt: ts(),
  updatedAt: ts(),
});

export const auditLog = pgTable("audit_log", {
  id: id(),
  actorProfileId: uuid("actor_profile_id").references(() => profiles.id),
  action: text().notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  before: jsonb(),
  after: jsonb(),
  correlationId: text("correlation_id"),
  createdAt: ts(),
});

export const notificationLog = pgTable("notification_log", {
  id: id(),
  channel: e.notificationChannel().notNull(),
  template: text().notNull(),
  recipientProfileId: uuid("recipient_profile_id").references(() => profiles.id),
  payload: jsonb(),
  status: text().notNull().default("queued"),
  error: text(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: ts(),
});
