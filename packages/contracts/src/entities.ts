/*
  Entity + view-model schemas. One-to-one with `frontend/src/data/types.ts`.
  Every screen's view model is represented so the frontend HTTP data layer can
  parse API responses with these schemas and get exactly the types the screens
  already expect.
*/

import { z } from "zod";
import {
  AnnouncementSourceSchema,
  AttendanceModeSchema,
  ClassLanguageSchema,
  CourseLevelSchema,
  HolidayKindSchema,
  HomeworkStatusSchema,
  MaterialKindSchema,
  MaterialOwnerSchema,
  MkMessageKindSchema,
  PitchVariantSchema,
  RoleSchema,
  SubscriptionProviderSchema,
  SubscriptionStatusSchema,
} from "./enums";

export const UserProfileSchema = z.object({
  id: z.string(),
  role: RoleSchema,
  mksmNo: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

export const BatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  day: z.string(),
  time: z.string(),
  pitch: PitchVariantSchema,
  level: CourseLevelSchema,
  language: ClassLanguageSchema,
  zoomLink: z.string(),
  teacherName: z.string(),
});
export type Batch = z.infer<typeof BatchSchema>;

export const EnrolledCourseSchema = z.object({
  courseId: z.string(),
  courseName: z.string(),
  batchName: z.string(),
  teacherName: z.string(),
  progress: z.number(),
  nextClassAt: z.string().nullable(),
  isClassDay: z.boolean(),
  ongoing: z.boolean().optional(),
});
export type EnrolledCourse = z.infer<typeof EnrolledCourseSchema>;

export const SubscriptionSummarySchema = z.object({
  provider: SubscriptionProviderSchema,
  status: SubscriptionStatusSchema,
  daysToRenew: z.number().nullable(),
  pendingDuesMinor: z.number(),
});
export type SubscriptionSummary = z.infer<typeof SubscriptionSummarySchema>;

export const SankalpSummarySchema = z.object({
  mksmNo: z.string(),
  personalHours: z.number(),
  weeklyHours: z.number(),
  nextMilestoneHours: z.number(),
  schoolAchievedHours: z.number(),
  schoolTargetHours: z.number(),
});
export type SankalpSummary = z.infer<typeof SankalpSummarySchema>;

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  postedAt: z.string(),
  read: z.boolean(),
  source: AnnouncementSourceSchema.optional(),
  important: z.boolean().optional(),
  audienceLabel: z.string().optional(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const MkMessageSchema = z.object({
  id: z.string(),
  kind: MkMessageKindSchema,
  title: z.string(),
  body: z.string(),
  mediaUrl: z.string().nullable(),
  postedAt: z.string(),
  audienceLabel: z.string(),
});
export type MkMessage = z.infer<typeof MkMessageSchema>;

export const VoicesOfMksmSchema = z.object({
  youtubeUrl: z.string(),
  title: z.string(),
  month: z.string(),
});
export type VoicesOfMksm = z.infer<typeof VoicesOfMksmSchema>;

export const StudentOverviewSchema = z.object({
  student: UserProfileSchema,
  subscription: SubscriptionSummarySchema,
  courses: z.array(EnrolledCourseSchema),
  sankalp: SankalpSummarySchema,
  voices: VoicesOfMksmSchema,
  announcements: z.array(AnnouncementSchema),
  mkMessage: MkMessageSchema.nullable(),
  alerts: z.array(z.string()),
});
export type StudentOverview = z.infer<typeof StudentOverviewSchema>;

export const CourseDetailSchema = EnrolledCourseSchema.extend({
  day: z.string(),
  time: z.string(),
  pitch: PitchVariantSchema,
  level: CourseLevelSchema,
  attendancePct: z.number(),
  zoomLink: z.string(),
  recordingRequestedOn: z.string().nullable(),
});
export type CourseDetail = z.infer<typeof CourseDetailSchema>;

export const StudentCoursesViewSchema = z.object({
  courses: z.array(CourseDetailSchema),
});
export type StudentCoursesView = z.infer<typeof StudentCoursesViewSchema>;

export const PracticeMaterialSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: MaterialKindSchema,
  pitch: PitchVariantSchema.nullable(),
  ownerRole: MaterialOwnerSchema,
  batchName: z.string().nullable(),
  notes: z.string().nullable(),
  addedAt: z.string(),
  meta: z.string(),
});
export type PracticeMaterial = z.infer<typeof PracticeMaterialSchema>;

export const PracticeMaterialViewSchema = z.object({
  adminShared: z.array(PracticeMaterialSchema),
  own: z.array(PracticeMaterialSchema),
});
export type PracticeMaterialView = z.infer<typeof PracticeMaterialViewSchema>;

export const ClassDateOptionSchema = z.object({
  value: z.string(),
  batchName: z.string(),
  courseName: z.string(),
});
export type ClassDateOption = z.infer<typeof ClassDateOptionSchema>;

export const HomeworkSubmissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  courseName: z.string(),
  batchName: z.string(),
  classDate: z.string(),
  submittedAt: z.string(),
  status: HomeworkStatusSchema,
  late: z.boolean(),
  feedbackText: z.string().nullable(),
  feedbackAudioUrl: z.string().nullable(),
});
export type HomeworkSubmission = z.infer<typeof HomeworkSubmissionSchema>;

export const StudentHomeworkViewSchema = z.object({
  classDates: z.array(ClassDateOptionSchema),
  cutoffDays: z.number(),
  submissions: z.array(HomeworkSubmissionSchema),
});
export type StudentHomeworkView = z.infer<typeof StudentHomeworkViewSchema>;

export const HomeworkForReviewSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  studentMksmNo: z.string(),
  batchName: z.string(),
  title: z.string(),
  description: z.string(),
  submittedAt: z.string(),
  classDate: z.string(),
  status: HomeworkStatusSchema,
  late: z.boolean(),
  audioUrl: z.string(),
});
export type HomeworkForReview = z.infer<typeof HomeworkForReviewSchema>;

export const TeacherHomeworkViewSchema = z.object({
  batches: z.array(z.string()),
  items: z.array(HomeworkForReviewSchema),
});
export type TeacherHomeworkView = z.infer<typeof TeacherHomeworkViewSchema>;

export const LeaderboardStudentRowSchema = z.object({
  position: z.number(),
  mksmNo: z.string(),
  studentName: z.string(),
  batchName: z.string(),
  cumulativeHours: z.number(),
  lastSubmittedMins: z.number(),
  lastSubmittedDate: z.string(),
  submissionCount: z.number(),
});
export type LeaderboardStudentRow = z.infer<typeof LeaderboardStudentRowSchema>;

export const LeaderboardBatchRowSchema = z.object({
  position: z.number(),
  batchName: z.string(),
  studentCount: z.number(),
  cumulativeHours: z.number(),
  avgHoursPerStudent: z.number(),
});
export type LeaderboardBatchRow = z.infer<typeof LeaderboardBatchRowSchema>;

export const LeaderboardViewSchema = z.object({
  month: z.string(),
  months: z.array(z.string()),
  studentRanking: z.array(LeaderboardStudentRowSchema),
  batchRanking: z.array(LeaderboardBatchRowSchema),
  club600: z.array(LeaderboardStudentRowSchema),
});
export type LeaderboardView = z.infer<typeof LeaderboardViewSchema>;

export const PaymentRowSchema = z.object({
  courseName: z.string(),
  provider: SubscriptionProviderSchema,
  status: SubscriptionStatusSchema,
  daysToRenew: z.number().nullable(),
  pendingDuesMinor: z.number(),
});
export type PaymentRow = z.infer<typeof PaymentRowSchema>;

export const PaymentsViewSchema = z.object({ rows: z.array(PaymentRowSchema) });
export type PaymentsView = z.infer<typeof PaymentsViewSchema>;

export const CatalogCourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: CourseLevelSchema,
  language: ClassLanguageSchema,
  priceLabel: z.string(),
  enrolled: z.boolean(),
});
export type CatalogCourse = z.infer<typeof CatalogCourseSchema>;

export const HolidaySchema = z.object({
  date: z.string(),
  name: z.string(),
  kind: HolidayKindSchema,
});
export type Holiday = z.infer<typeof HolidaySchema>;

export const HelpTutorialSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  durationLabel: z.string(),
});
export type HelpTutorial = z.infer<typeof HelpTutorialSchema>;

export const HelpFaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});
export type HelpFaq = z.infer<typeof HelpFaqSchema>;

export const HelpViewSchema = z.object({
  tutorials: z.array(HelpTutorialSchema),
  faqs: z.array(HelpFaqSchema),
});
export type HelpView = z.infer<typeof HelpViewSchema>;

export const HomeworkStatsSchema = z.object({
  submitted: z.number(),
  reviewed: z.number(),
  reviewPending: z.number(),
  homeworkPending: z.number(),
});
export type HomeworkStats = z.infer<typeof HomeworkStatsSchema>;

export const DeaAlertSchema = z.object({
  id: z.string(),
  code: z.string(),
  studentName: z.string(),
  batchName: z.string(),
});
export type DeaAlert = z.infer<typeof DeaAlertSchema>;

export const PendingClassLogSchema = z.object({
  batchName: z.string(),
  classDate: z.string(),
});
export type PendingClassLog = z.infer<typeof PendingClassLogSchema>;

export const TeacherOverviewSchema = z.object({
  teacher: UserProfileSchema,
  announcements: z.array(AnnouncementSchema),
  homework: HomeworkStatsSchema,
  batchCount: z.number(),
  studentCount: z.number(),
  pendingClassLog: PendingClassLogSchema.nullable(),
  deaAlerts: z.array(DeaAlertSchema),
  sankalpTargetHours: z.number(),
  sankalpAchievedHours: z.number(),
});
export type TeacherOverview = z.infer<typeof TeacherOverviewSchema>;

export const TeacherBatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  day: z.string(),
  time: z.string(),
  level: CourseLevelSchema,
  language: ClassLanguageSchema,
  pitch: PitchVariantSchema,
  studentCount: z.number(),
  zoomLink: z.string(),
  isClassDay: z.boolean(),
});
export type TeacherBatch = z.infer<typeof TeacherBatchSchema>;

export const ScheduleEntrySchema = z.object({
  id: z.string(),
  day: z.string(),
  time: z.string(),
  batchName: z.string(),
  level: CourseLevelSchema,
  pitch: PitchVariantSchema,
});
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;

export const AttendanceRecordSchema = z.object({
  studentName: z.string(),
  mksmNo: z.string(),
  present: z.boolean(),
  mode: AttendanceModeSchema.nullable(),
});
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

export const AttendanceViewSchema = z.object({
  batches: z.array(z.string()),
  classDate: z.string(),
  records: z.array(AttendanceRecordSchema),
});
export type AttendanceView = z.infer<typeof AttendanceViewSchema>;

export const ClassLogEntrySchema = z.object({
  id: z.string(),
  classDate: z.string(),
  batchName: z.string(),
  ragaCovered: z.string(),
  whatCovered: z.string(),
  comments: z.string().nullable(),
  teacherName: z.string(),
});
export type ClassLogEntry = z.infer<typeof ClassLogEntrySchema>;

export const TeacherClassLogViewSchema = z.object({
  teacherName: z.string(),
  batches: z.array(z.string()),
  ragas: z.array(z.string()),
  history: z.array(ClassLogEntrySchema),
});
export type TeacherClassLogView = z.infer<typeof TeacherClassLogViewSchema>;

export const ProviderBreakdownSchema = z.object({
  provider: SubscriptionProviderSchema,
  total: z.number(),
  active: z.number(),
  cancelled: z.number(),
  inactiveLabel: z.string(),
  inactive: z.number(),
});
export type ProviderBreakdown = z.infer<typeof ProviderBreakdownSchema>;

export const AdminOverviewSchema = z.object({
  admin: UserProfileSchema,
  announcements: z.array(AnnouncementSchema),
  providers: z.array(ProviderBreakdownSchema),
  sankalpTargetHours: z.number(),
  sankalpAchievedHours: z.number(),
  activeBatches: z.number(),
  indiaBatches: z.number(),
  intlBatches: z.number(),
  beginnerBatches: z.number(),
  intermediateBatches: z.number(),
  pendingFeesCount: z.number(),
});
export type AdminOverview = z.infer<typeof AdminOverviewSchema>;

export const AdminBatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  studentCount: z.number(),
  teacherName: z.string(),
  level: CourseLevelSchema,
  language: ClassLanguageSchema,
  day: z.string(),
  time: z.string(),
  zoomLink: z.string(),
});
export type AdminBatch = z.infer<typeof AdminBatchSchema>;

export const StudentDirectoryRowSchema = z.object({
  mksmNo: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  country: z.string(),
  batchName: z.string(),
  classes30d: z.number(),
  classes90d: z.number(),
  lastAttended: z.string().nullable(),
});
export type StudentDirectoryRow = z.infer<typeof StudentDirectoryRowSchema>;

export const SubscriptionRowSchema = z.object({
  mksmNo: z.string(),
  studentName: z.string(),
  batchName: z.string(),
  age: z.number(),
  email: z.string(),
  phone: z.string(),
  country: z.string(),
  provider: SubscriptionProviderSchema,
  subId: z.string(),
  status: SubscriptionStatusSchema,
  activeCycle: z.number(),
  paidCycle: z.number(),
  startDate: z.string(),
  nextDue: z.string().nullable(),
  paymentsThisYear: z.number(),
  paymentsLast3Months: z.number(),
});
export type SubscriptionRow = z.infer<typeof SubscriptionRowSchema>;

export const AdminFormOptionsSchema = z.object({
  batches: z.array(z.string()),
  teachers: z.array(z.string()),
  ragas: z.array(z.string()),
});
export type AdminFormOptions = z.infer<typeof AdminFormOptionsSchema>;
