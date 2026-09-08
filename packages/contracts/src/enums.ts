/*
  API-facing enums. These mirror the literal unions in
  `frontend/src/data/types.ts` verbatim so the frontend can adopt this package
  as its data contract with no shape changes. The database uses snake_case
  Postgres enums; the backend service layer maps between the two.
*/

import { z } from "zod";

export const RoleSchema = z.enum(["student", "teacher", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const SubscriptionProviderSchema = z.enum(["razorpay", "paypal", "one-time"]);
export type SubscriptionProvider = z.infer<typeof SubscriptionProviderSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "cancelled",
  "halted",
  "suspended",
  "one-time",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PitchVariantSchema = z.enum(["C#", "G#", "B#"]);
export type PitchVariant = z.infer<typeof PitchVariantSchema>;

export const MaterialKindSchema = z.enum(["audio", "video", "pdf"]);
export type MaterialKind = z.infer<typeof MaterialKindSchema>;

export const HomeworkStatusSchema = z.enum([
  "submitted",
  "reviewed",
  "review-pending",
  "homework-pending",
]);
export type HomeworkStatus = z.infer<typeof HomeworkStatusSchema>;

export const CourseLevelSchema = z.enum(["Beginner", "Intermediate", "Advance"]);
export type CourseLevel = z.infer<typeof CourseLevelSchema>;

export const ClassLanguageSchema = z.enum(["Marathi", "Hindi", "English"]);
export type ClassLanguage = z.infer<typeof ClassLanguageSchema>;

export const AnnouncementSourceSchema = z.enum(["admin", "mahesh-kale", "community"]);
export type AnnouncementSource = z.infer<typeof AnnouncementSourceSchema>;

export const MkMessageKindSchema = z.enum(["video", "audio", "text"]);
export type MkMessageKind = z.infer<typeof MkMessageKindSchema>;

export const MaterialOwnerSchema = z.enum(["admin", "teacher"]);
export type MaterialOwner = z.infer<typeof MaterialOwnerSchema>;

export const AttendanceModeSchema = z.enum(["online", "offline"]);
export type AttendanceMode = z.infer<typeof AttendanceModeSchema>;

export const HolidayKindSchema = z.enum(["festival", "national", "break"]);
export type HolidayKind = z.infer<typeof HolidayKindSchema>;

export const DayOfWeekSchema = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export const BatchStudentTypeSchema = z.enum(["Kids", "Youth", "Adults"]);
export type BatchStudentType = z.infer<typeof BatchStudentTypeSchema>;

export const BatchGenderMixSchema = z.enum(["Male", "Female", "Mix"]);
export type BatchGenderMix = z.infer<typeof BatchGenderMixSchema>;

export const GenderSchema = z.enum(["Female", "Male", "Prefer not to say"]);
export type Gender = z.infer<typeof GenderSchema>;

export const TeacherAccessLevelSchema = z.enum([
  "Teacher — standard",
  "Teacher — senior (multi-batch)",
  "Teacher — read-only",
]);
export type TeacherAccessLevel = z.infer<typeof TeacherAccessLevelSchema>;

export const AnnouncementAudienceSchema = z.enum([
  "all",
  "custom",
  "batch",
  "student",
]);
export type AnnouncementAudience = z.infer<typeof AnnouncementAudienceSchema>;

export const RecordingRequestStatusSchema = z.enum([
  "requested",
  "in_progress",
  "fulfilled",
  "declined",
]);
export type RecordingRequestStatus = z.infer<typeof RecordingRequestStatusSchema>;

export const DeaStatusSchema = z.enum(["open", "acknowledged", "resolved"]);
export type DeaStatus = z.infer<typeof DeaStatusSchema>;

export const WhatsappTemplateStatusSchema = z.enum(["approved", "pending", "rejected"]);
export type WhatsappTemplateStatus = z.infer<typeof WhatsappTemplateStatusSchema>;

export const SupportStatusSchema = z.enum(["open", "closed"]);
export type SupportStatus = z.infer<typeof SupportStatusSchema>;
