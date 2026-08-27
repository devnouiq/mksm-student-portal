/*
  Repository contracts — the seam between UI and data source.

  Screens and server components depend ONLY on these interfaces. Today they are
  backed by the in-memory mock in `./mock`; in a later milestone the same
  interfaces get an HTTP-backed implementation that calls the real API. Because
  every method is async and returns domain types (see ./types), swapping the
  implementation requires no change to any screen.

  To swap: change the single factory in `./index.ts`.
*/

import type {
  AdminBatch,
  AdminFormOptions,
  AdminOverview,
  Announcement,
  AttendanceView,
  CatalogCourse,
  ClassLogEntry,
  HelpView,
  Holiday,
  LeaderboardView,
  PaymentsView,
  PracticeMaterialView,
  Role,
  ScheduleEntry,
  StudentCoursesView,
  StudentDirectoryRow,
  StudentHomeworkView,
  StudentOverview,
  SubscriptionRow,
  TeacherBatch,
  TeacherClassLogView,
  TeacherHomeworkView,
  TeacherOverview,
  UserProfile,
} from "./types";

export interface SessionRepository {
  /** The signed-in user for a given role (mock: fixed demo users per role). */
  getCurrentUser(role: Role): Promise<UserProfile>;
}

export interface StudentRepository {
  getOverview(mksmNo: string): Promise<StudentOverview>;
  getCourses(mksmNo: string): Promise<StudentCoursesView>;
  getPracticeMaterial(mksmNo: string): Promise<PracticeMaterialView>;
  getHomework(mksmNo: string): Promise<StudentHomeworkView>;
  getPayments(mksmNo: string): Promise<PaymentsView>;
  getCatalog(mksmNo: string): Promise<CatalogCourse[]>;
  getHolidays(): Promise<Holiday[]>;
  getHelp(): Promise<HelpView>;
  getAnnouncements(mksmNo: string): Promise<Announcement[]>;
}

export interface TeacherRepository {
  getOverview(mksmNo: string): Promise<TeacherOverview>;
  getBatches(mksmNo: string): Promise<TeacherBatch[]>;
  getHomeworkQueue(mksmNo: string): Promise<TeacherHomeworkView>;
  getPracticeMaterial(mksmNo: string): Promise<PracticeMaterialView>;
  getSchedule(mksmNo: string): Promise<ScheduleEntry[]>;
  getAttendance(mksmNo: string): Promise<AttendanceView>;
  getClassLog(mksmNo: string): Promise<TeacherClassLogView>;
  getAnnouncements(mksmNo: string): Promise<Announcement[]>;
}

export interface AdminRepository {
  getOverview(mksmNo: string): Promise<AdminOverview>;
  getBatches(): Promise<AdminBatch[]>;
  getStudents(): Promise<StudentDirectoryRow[]>;
  getPracticeLibrary(): Promise<PracticeMaterialView>;
  getClassLogs(): Promise<ClassLogEntry[]>;
  getSubscriptions(): Promise<SubscriptionRow[]>;
  getAnnouncements(): Promise<Announcement[]>;
  getFormOptions(): Promise<AdminFormOptions>;
}

/** Shared across student & teacher personas. */
export interface LeaderboardRepository {
  getLeaderboard(month?: string): Promise<LeaderboardView>;
}

/** Aggregate handed to the app. Extend as new screens land. */
export interface Repositories {
  session: SessionRepository;
  student: StudentRepository;
  teacher: TeacherRepository;
  admin: AdminRepository;
  leaderboard: LeaderboardRepository;
}
