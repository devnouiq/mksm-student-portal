import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "teacher", "admin"]);
export const profileStatus = pgEnum("profile_status", ["active", "inactive", "de_enrolled"]);
export const gender = pgEnum("gender", ["female", "male", "undisclosed"]);
export const teacherAccessLevel = pgEnum("teacher_access_level", ["standard", "senior", "read_only"]);
export const courseLevel = pgEnum("course_level", ["beginner", "intermediate", "advance"]);
export const classLanguage = pgEnum("class_language", ["marathi", "hindi", "english"]);
export const pitchVariant = pgEnum("pitch_variant", ["c_sharp", "g_sharp", "b_sharp"]);
export const dayOfWeek = pgEnum("day_of_week", ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export const batchStudentType = pgEnum("batch_student_type", ["kids", "youth", "adults"]);
export const batchGenderMix = pgEnum("batch_gender_mix", ["male", "female", "mix"]);
export const batchRegion = pgEnum("batch_region", ["india", "international"]);
export const enrollmentStatus = pgEnum("enrollment_status", ["active", "completed", "de_enrolled"]);
export const classSessionStatus = pgEnum("class_session_status", ["scheduled", "held", "cancelled"]);
export const attendanceMode = pgEnum("attendance_mode", ["online", "offline"]);
export const attendanceSource = pgEnum("attendance_source", ["system", "teacher", "admin"]);
export const homeworkStatus = pgEnum("homework_status", [
  "homework_pending",
  "submitted",
  "review_pending",
  "reviewed",
]);
export const materialKind = pgEnum("material_kind", ["audio", "video", "pdf"]);
export const materialOwnerRole = pgEnum("material_owner_role", ["admin", "teacher"]);
export const materialShareTarget = pgEnum("material_share_target", ["teacher", "batch", "all"]);
export const announcementSource = pgEnum("announcement_source", ["admin", "mahesh_kale", "community"]);
export const announcementAudience = pgEnum("announcement_audience", [
  "all",
  "custom_group",
  "batch",
  "student",
  "teachers",
]);
export const mkMediaKind = pgEnum("mk_media_kind", ["video", "audio", "text"]);
export const subscriptionProvider = pgEnum("subscription_provider", ["razorpay", "paypal", "one_time"]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "halted",
  "suspended",
  "one_time",
]);
export const sankalpLogSource = pgEnum("sankalp_log_source", ["google_form", "portal"]);
export const sankalpScope = pgEnum("sankalp_scope", ["school", "teacher"]);
export const holidayKind = pgEnum("holiday_kind", ["festival", "national", "break"]);
export const deaStatus = pgEnum("dea_status", ["open", "acknowledged", "resolved"]);
export const recordingRequestStatus = pgEnum("recording_request_status", [
  "requested",
  "in_progress",
  "fulfilled",
  "declined",
]);
export const whatsappTemplateStatus = pgEnum("whatsapp_template_status", ["approved", "pending", "rejected"]);
export const supportStatus = pgEnum("support_status", ["open", "closed"]);
export const notificationChannel = pgEnum("notification_channel", ["whatsapp", "email"]);
