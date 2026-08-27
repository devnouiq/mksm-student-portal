/*
  Domain model for the MKSM Student Portal.
  Derived from PRD §6 (Key Data Entities). These types are the contract
  shared by the mock data layer today and the real API layer later — screens
  depend only on these shapes, never on how they are fetched.
*/

export type Role = "student" | "teacher" | "admin";

export type SubscriptionProvider = "razorpay" | "paypal" | "one-time";

// Read-only status synced from Razorpay/PayPal (PRD §7 — no processing in-portal).
export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "halted"
  | "suspended"
  | "one-time";

export type PitchVariant = "C#" | "G#" | "B#";

export type MaterialKind = "audio" | "video" | "pdf";

export type HomeworkStatus =
  | "submitted"
  | "reviewed"
  | "review-pending"
  | "homework-pending";

/** Signed-in identity. `mksmNo` is the 6-digit key used across the portal. */
export interface UserProfile {
  id: string;
  role: Role;
  mksmNo: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Batch {
  id: string;
  name: string;
  day: string;
  time: string;
  pitch: PitchVariant;
  level: "Beginner" | "Intermediate" | "Advance";
  language: "Marathi" | "Hindi" | "English";
  zoomLink: string;
  teacherName: string;
}

/** A student's enrollment in a course, with progress and next-class info. */
export interface EnrolledCourse {
  courseId: string;
  courseName: string;
  batchName: string;
  teacherName: string;
  progress: number; // 0..1
  nextClassAt: string | null; // ISO; null when no upcoming class
  isClassDay: boolean; // gates "Join Now" (PRD §5.1 My Courses)
  ongoing?: boolean; // weekly class with no fixed end — always shown at 100%
}

export interface SubscriptionSummary {
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  daysToRenew: number | null;
  pendingDuesMinor: number; // display-only
}

/** School-wide + personal Sankalp figures for the overview (PRD §5.1). */
export interface SankalpSummary {
  mksmNo: string;
  personalHours: number;
  weeklyHours: number; // hours submitted this week
  nextMilestoneHours: number; // the goal the student is working toward
  schoolAchievedHours: number;
  schoolTargetHours: number;
}

/** Who an announcement is posted as — drives where it surfaces for students. */
export type AnnouncementSource = "admin" | "mahesh-kale" | "community";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedAt: string; // ISO
  read: boolean;
  source?: AnnouncementSource; // defaults to "admin"
  important?: boolean; // also scrolls in the student overview marquee
  audienceLabel?: string; // e.g. "All Intermediate Students" — display only
}

/** A message from Mahesh Kale Sir, targeted to students by level or geography. */
export type MkMessageKind = "video" | "audio" | "text";

export interface MkMessage {
  id: string;
  kind: MkMessageKind;
  title: string;
  body: string; // text content, or a caption for media
  mediaUrl: string | null; // YouTube embed (video) or audio source; null for text
  postedAt: string; // ISO
  audienceLabel: string; // e.g. "All Intermediate Students"
}

/** Admin-managed embedded YouTube link, swapped monthly (PRD §5.1, §8.5). */
export interface VoicesOfMksm {
  youtubeUrl: string;
  title: string;
  month: string; // e.g. "August 2026"
}

/** Everything the Student Overview screen needs, in one view model. */
export interface StudentOverview {
  student: UserProfile;
  subscription: SubscriptionSummary;
  courses: EnrolledCourse[];
  sankalp: SankalpSummary;
  voices: VoicesOfMksm;
  announcements: Announcement[];
  mkMessage: MkMessage | null;
  alerts: string[]; // important notices scrolling in the top marquee
}

/* ------------------------------------------------------------------ *
 * Student — My Courses (PRD §5.1)
 * ------------------------------------------------------------------ */

/** A course card on My Courses — richer than the Overview summary. */
export interface CourseDetail extends EnrolledCourse {
  day: string;
  time: string;
  pitch: PitchVariant;
  level: Batch["level"];
  attendancePct: number; // 0..1
  zoomLink: string; // static link (PRD §7)
  recordingRequestedOn: string | null; // ISO; manual fulfilment (PRD §8.4)
}

export interface StudentCoursesView {
  courses: CourseDetail[];
}

/* ------------------------------------------------------------------ *
 * Practice Material (student + teacher + admin) (PRD §5.1/§5.2/§5.3)
 * ------------------------------------------------------------------ */

export type MaterialOwner = "admin" | "teacher";

export interface PracticeMaterial {
  id: string;
  title: string;
  kind: MaterialKind;
  pitch: PitchVariant | null; // audio alankars carry a pitch
  ownerRole: MaterialOwner;
  batchName: string | null; // scoped share; null = all batches
  notes: string | null;
  addedAt: string; // ISO
  meta: string; // e.g. "4:12" or "1.2 MB" — display only
}

export interface PracticeMaterialView {
  /** Admin-owned master items shared to the viewer. */
  adminShared: PracticeMaterial[];
  /** Teacher's own uploads (empty for students). */
  own: PracticeMaterial[];
}

/* ------------------------------------------------------------------ *
 * Homework (student submit + feedback, teacher review) (PRD §5.1/§5.2)
 * ------------------------------------------------------------------ */

/** A selectable upcoming class the student can submit homework against. */
export interface ClassDateOption {
  value: string; // ISO date
  batchName: string;
  courseName: string;
}

export interface HomeworkSubmission {
  id: string;
  title: string;
  description: string;
  courseName: string;
  batchName: string;
  classDate: string; // ISO
  submittedAt: string; // ISO
  status: HomeworkStatus;
  late: boolean; // "Late Submission" tag (PRD §8.7)
  feedbackText: string | null;
  feedbackAudioUrl: string | null;
}

export interface StudentHomeworkView {
  classDates: ClassDateOption[];
  cutoffDays: number; // ≥2 days before next class (PRD §8.7)
  submissions: HomeworkSubmission[];
}

/** A homework item in the teacher's review queue. */
export interface HomeworkForReview {
  id: string;
  studentName: string;
  studentMksmNo: string;
  batchName: string;
  title: string;
  description: string;
  submittedAt: string; // ISO
  classDate: string; // ISO
  status: HomeworkStatus;
  late: boolean;
  audioUrl: string; // student's submitted audio
}

export interface TeacherHomeworkView {
  batches: string[];
  items: HomeworkForReview[];
}

/* ------------------------------------------------------------------ *
 * Sankalp Leaderboard (shared student/teacher) (PRD §5.1)
 * ------------------------------------------------------------------ */

export interface LeaderboardStudentRow {
  position: number;
  mksmNo: string;
  studentName: string;
  batchName: string;
  cumulativeHours: number;
  lastSubmittedMins: number;
  lastSubmittedDate: string; // ISO
  submissionCount: number;
}

export interface LeaderboardBatchRow {
  position: number;
  batchName: string;
  studentCount: number;
  cumulativeHours: number;
  avgHoursPerStudent: number;
}

export interface LeaderboardView {
  month: string; // e.g. "August 2026"
  months: string[]; // filter options
  studentRanking: LeaderboardStudentRow[];
  batchRanking: LeaderboardBatchRow[];
  club600: LeaderboardStudentRow[]; // 600 Hours Club
}

/* ------------------------------------------------------------------ *
 * Payment & Fees (student) (PRD §5.1)
 * ------------------------------------------------------------------ */

export interface PaymentRow {
  courseName: string;
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  daysToRenew: number | null;
  pendingDuesMinor: number;
}

export interface PaymentsView {
  rows: PaymentRow[];
}

/* ------------------------------------------------------------------ *
 * Explore Other Courses (student) (PRD §5.1)
 * ------------------------------------------------------------------ */

export interface CatalogCourse {
  id: string;
  name: string;
  description: string;
  level: Batch["level"];
  language: Batch["language"];
  priceLabel: string; // display only
  enrolled: boolean;
}

/* ------------------------------------------------------------------ *
 * Holiday Calendar (student) (PRD §5.1)
 * ------------------------------------------------------------------ */

export type HolidayKind = "festival" | "national" | "break";

export interface Holiday {
  date: string; // ISO
  name: string;
  kind: HolidayKind;
}

/* ------------------------------------------------------------------ *
 * Help Section (student) (PRD §5.1)
 * ------------------------------------------------------------------ */

export interface HelpTutorial {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
}

export interface HelpFaq {
  id: string;
  question: string;
  answer: string;
}

export interface HelpView {
  tutorials: HelpTutorial[];
  faqs: HelpFaq[];
}

/* ------------------------------------------------------------------ *
 * Teacher — Overview (PRD §5.2)
 * ------------------------------------------------------------------ */

export interface HomeworkStats {
  submitted: number;
  reviewed: number;
  reviewPending: number;
  homeworkPending: number;
}

export interface DeaAlert {
  id: string;
  code: string; // e.g. "DEA-3"
  studentName: string;
  batchName: string;
}

export interface PendingClassLog {
  batchName: string;
  classDate: string; // the previous-day class that has no log (PRD §8.12)
}

export interface TeacherOverview {
  teacher: UserProfile;
  announcements: Announcement[];
  homework: HomeworkStats;
  batchCount: number;
  studentCount: number;
  pendingClassLog: PendingClassLog | null;
  deaAlerts: DeaAlert[];
  sankalpTargetHours: number;
  sankalpAchievedHours: number;
}

/* ------------------------------------------------------------------ *
 * Teacher — Batches / Schedule / Attendance / Class Log (PRD §5.2)
 * ------------------------------------------------------------------ */

export interface TeacherBatch {
  id: string;
  name: string;
  day: string;
  time: string;
  level: Batch["level"];
  language: Batch["language"];
  pitch: PitchVariant;
  studentCount: number;
  zoomLink: string;
  isClassDay: boolean;
}

export interface ScheduleEntry {
  id: string;
  day: string;
  time: string;
  batchName: string;
  level: Batch["level"];
  pitch: PitchVariant;
}

export type AttendanceMode = "online" | "offline";

export interface AttendanceRecord {
  studentName: string;
  mksmNo: string;
  present: boolean;
  mode: AttendanceMode | null;
}

export interface AttendanceView {
  batches: string[];
  classDate: string; // ISO — the class being marked
  records: AttendanceRecord[];
}

export interface ClassLogEntry {
  id: string;
  classDate: string; // ISO
  batchName: string;
  ragaCovered: string;
  whatCovered: string;
  comments: string | null;
  teacherName: string;
}

export interface TeacherClassLogView {
  teacherName: string; // auto-filled, read-only
  batches: string[];
  ragas: string[]; // dropdown options
  history: ClassLogEntry[];
}

/* ------------------------------------------------------------------ *
 * Admin — Overview / directory / subscriptions / class log (PRD §5.3)
 * ------------------------------------------------------------------ */

export interface ProviderBreakdown {
  provider: SubscriptionProvider;
  total: number;
  active: number;
  cancelled: number;
  /** halted (Razorpay) or suspended (PayPal). */
  inactiveLabel: string;
  inactive: number;
}

export interface AdminOverview {
  admin: UserProfile;
  announcements: Announcement[];
  providers: ProviderBreakdown[];
  sankalpTargetHours: number;
  sankalpAchievedHours: number;
  activeBatches: number;
  indiaBatches: number;
  intlBatches: number;
  beginnerBatches: number;
  intermediateBatches: number;
  pendingFeesCount: number;
}

export interface AdminBatch {
  id: string;
  name: string;
  studentCount: number;
  teacherName: string;
  level: Batch["level"];
  language: Batch["language"];
  day: string;
  time: string;
  zoomLink: string;
}

export interface StudentDirectoryRow {
  mksmNo: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  batchName: string;
  classes30d: number;
  classes90d: number;
  lastAttended: string | null; // ISO
}

export interface SubscriptionRow {
  mksmNo: string;
  studentName: string;
  batchName: string;
  age: number;
  email: string;
  phone: string;
  country: string;
  provider: SubscriptionProvider;
  subId: string;
  status: SubscriptionStatus;
  activeCycle: number;
  paidCycle: number;
  startDate: string; // ISO
  nextDue: string | null; // ISO
  paymentsThisYear: number;
  paymentsLast3Months: number;
}

/** Options used to populate Add-Student / Add-Teacher / Batch form dropdowns. */
export interface AdminFormOptions {
  batches: string[];
  teachers: string[];
  ragas: string[];
}
