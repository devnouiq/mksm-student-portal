/*
  Translation between database enum values (snake_case Postgres enums) and the
  API contract values (the literal unions the frontend already uses). Also the
  display formatters that replace the frontend's free-text fields
  ("6:00 PM IST", "Monday").
*/
import type {
  AttendanceMode,
  ClassLanguage,
  CourseLevel,
  DayOfWeek,
  HomeworkStatus,
  MaterialKind,
  MaterialOwner,
  PitchVariant,
  Role,
  SubscriptionProvider,
  SubscriptionStatus,
} from "@mksm/contracts";

export type PitchDb = "c_sharp" | "g_sharp" | "b_sharp";
export type LevelDb = "beginner" | "intermediate" | "advance";
export type LanguageDb = "marathi" | "hindi" | "english";
export type DayDb = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type HomeworkStatusDb = "homework_pending" | "submitted" | "review_pending" | "reviewed";
export type ProviderDb = "razorpay" | "paypal" | "one_time";
export type SubStatusDb = "active" | "cancelled" | "halted" | "suspended" | "one_time";

export const pitchToApi: Record<string, PitchVariant> = { c_sharp: "C#", g_sharp: "G#", b_sharp: "B#" };
export const pitchToDb: Record<PitchVariant, PitchDb> = { "C#": "c_sharp", "G#": "g_sharp", "B#": "b_sharp" };

export const levelToApi: Record<string, CourseLevel> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advance: "Advance",
};
export const levelToDb: Record<CourseLevel, LevelDb> = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advance: "advance",
};

export const languageToApi: Record<string, ClassLanguage> = {
  marathi: "Marathi",
  hindi: "Hindi",
  english: "English",
};
export const languageToDb: Record<ClassLanguage, LanguageDb> = {
  Marathi: "marathi",
  Hindi: "hindi",
  English: "english",
};

export const homeworkStatusToApi: Record<string, HomeworkStatus> = {
  homework_pending: "homework-pending",
  submitted: "submitted",
  review_pending: "review-pending",
  reviewed: "reviewed",
};
export const homeworkStatusToDb: Record<HomeworkStatus, HomeworkStatusDb> = {
  "homework-pending": "homework_pending",
  submitted: "submitted",
  "review-pending": "review_pending",
  reviewed: "reviewed",
};

export const providerToApi: Record<string, SubscriptionProvider> = {
  razorpay: "razorpay",
  paypal: "paypal",
  one_time: "one-time",
};
export const providerToDb: Record<SubscriptionProvider, ProviderDb> = {
  razorpay: "razorpay",
  paypal: "paypal",
  "one-time": "one_time",
};

export const subStatusToApi: Record<string, SubscriptionStatus> = {
  active: "active",
  cancelled: "cancelled",
  halted: "halted",
  suspended: "suspended",
  one_time: "one-time",
};
export const subStatusToDb: Record<SubscriptionStatus, SubStatusDb> = {
  active: "active",
  cancelled: "cancelled",
  halted: "halted",
  suspended: "suspended",
  "one-time": "one_time",
};

export const materialKindToApi: Record<string, MaterialKind> = {
  audio: "audio",
  video: "video",
  pdf: "pdf",
};

export const materialOwnerToApi: Record<string, MaterialOwner> = {
  admin: "admin",
  teacher: "teacher",
};

export const attendanceModeToApi: Record<string, AttendanceMode> = {
  online: "online",
  offline: "offline",
};

export const roleToApi: Record<string, Role> = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
};

const DAY_LABEL: Record<string, DayOfWeek> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
export const dayToLabel = (d: string): DayOfWeek => DAY_LABEL[d] ?? "Monday";
export const dayToDb: Record<DayOfWeek, DayDb> = {
  Monday: "mon",
  Tuesday: "tue",
  Wednesday: "wed",
  Thursday: "thu",
  Friday: "fri",
  Saturday: "sat",
  Sunday: "sun",
};

const TZ_ABBR: Record<string, string> = {
  "Asia/Kolkata": "IST",
  "America/New_York": "ET",
  "America/Los_Angeles": "PT",
  "Europe/London": "UK",
};

/** "18:00" + "Asia/Kolkata" -> "6:00 PM IST" (matches the frontend fixtures). */
export function formatClassTime(startTime: string | null, timezone: string): string {
  if (!startTime) return "";
  const [hRaw, mRaw] = startTime.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const abbr = TZ_ABBR[timezone] ?? timezone;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix} ${abbr}`.trim();
}

export function fullNameToFirstLast(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function genderToDb(g?: string): "female" | "male" | "undisclosed" | null {
  if (!g) return null;
  if (g === "Female") return "female";
  if (g === "Male") return "male";
  return "undisclosed";
}

export function teacherAccessLevelToDb(a?: string): "standard" | "senior" | "read_only" {
  if (a === "Teacher — senior (multi-batch)") return "senior";
  if (a === "Teacher — read-only") return "read_only";
  return "standard";
}
