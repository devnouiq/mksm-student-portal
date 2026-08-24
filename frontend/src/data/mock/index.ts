/*
  In-memory mock implementation of the repository contracts.
  Mirrors real API latency with a tiny configurable delay so the UI's loading
  states are exercised. Swappable for an HTTP implementation later (see
  ../index.ts) with zero changes to screens.
*/

import type {
  AdminRepository,
  LeaderboardRepository,
  Repositories,
  SessionRepository,
  StudentRepository,
  TeacherRepository,
} from "../repositories";
import type { Role, StudentOverview } from "../types";
import {
  demoUsers,
  studentAnnouncements,
  studentCourses,
  studentSankalp,
  studentSubscription,
  voicesOfMksm,
} from "./fixtures";
import {
  courseCatalog,
  helpContent,
  holidays2026,
  studentClassDates,
  studentCourseDetails,
  studentPayments,
  studentSubmissions,
} from "./fixtures-student";
import {
  ragaOptions,
  teacherAnnouncements,
  teacherAttendance,
  teacherBatches,
  teacherClassLogHistory,
  teacherDeaAlerts,
  teacherHomeworkQueue,
  teacherOwnMaterial,
  teacherSchedule,
} from "./fixtures-teacher";
import {
  adminAnnouncements,
  adminBatches,
  adminClassLogs,
  adminMasterLibrary,
  providerBreakdowns,
  studentDirectory,
  subscriptionRows,
} from "./fixtures-admin";
import { leaderboard } from "./fixtures-shared";

// Small artificial latency so skeleton/loading states are visible in the
// prototype. Set MKSM_MOCK_LATENCY_MS=0 to disable.
const LATENCY_MS = Number(process.env.MKSM_MOCK_LATENCY_MS ?? 250);

function settle<T>(value: T): Promise<T> {
  if (LATENCY_MS <= 0) return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

const sessionRepository: SessionRepository = {
  getCurrentUser(role: Role) {
    return settle(demoUsers[role]);
  },
};

const studentRepository: StudentRepository = {
  getOverview(mksmNo: string): Promise<StudentOverview> {
    const student = demoUsers.student;
    return settle<StudentOverview>({
      student: { ...student, mksmNo },
      subscription: studentSubscription,
      courses: studentCourses,
      sankalp: { ...studentSankalp, mksmNo },
      voices: voicesOfMksm,
      announcements: studentAnnouncements,
    });
  },
  getCourses() {
    return settle({ courses: studentCourseDetails });
  },
  getPracticeMaterial() {
    return settle({ adminShared: adminMasterLibrary, own: [] });
  },
  getHomework() {
    return settle({
      classDates: studentClassDates,
      cutoffDays: 2,
      submissions: studentSubmissions,
    });
  },
  getPayments() {
    return settle({ rows: studentPayments });
  },
  getCatalog() {
    return settle(courseCatalog);
  },
  getHolidays() {
    return settle(holidays2026);
  },
  getHelp() {
    return settle(helpContent);
  },
};

const teacherRepository: TeacherRepository = {
  getOverview(mksmNo: string) {
    const teacher = demoUsers.teacher;
    const homework = { submitted: 6, reviewed: 21, reviewPending: 4, homeworkPending: 3 };
    const studentCount = teacherBatches.reduce((n, b) => n + b.studentCount, 0);
    return settle({
      teacher: { ...teacher, mksmNo },
      announcements: teacherAnnouncements,
      homework,
      batchCount: teacherBatches.length,
      studentCount,
      // Dhun Batch ran yesterday and has no log yet (PRD §8.12).
      pendingClassLog: { batchName: "Dhun Batch", classDate: teacherAttendance.classDate },
      deaAlerts: teacherDeaAlerts,
      sankalpTargetHours: 6000,
      sankalpAchievedHours: 4185,
    });
  },
  getBatches() {
    return settle(teacherBatches);
  },
  getHomeworkQueue() {
    return settle({
      batches: teacherBatches.map((b) => b.name),
      items: teacherHomeworkQueue,
    });
  },
  getPracticeMaterial() {
    return settle({ adminShared: adminMasterLibrary, own: teacherOwnMaterial });
  },
  getSchedule() {
    return settle(teacherSchedule);
  },
  getAttendance() {
    return settle(teacherAttendance);
  },
  getClassLog() {
    return settle({
      teacherName: demoUsers.teacher.name,
      batches: teacherBatches.map((b) => b.name),
      ragas: ragaOptions,
      history: teacherClassLogHistory,
    });
  },
  getAnnouncements() {
    return settle(teacherAnnouncements);
  },
};

const adminRepository: AdminRepository = {
  getOverview(mksmNo: string) {
    const admin = demoUsers.admin;
    return settle({
      admin: { ...admin, mksmNo },
      announcements: adminAnnouncements,
      providers: providerBreakdowns,
      sankalpTargetHours: studentSankalp.schoolTargetHours,
      sankalpAchievedHours: studentSankalp.schoolAchievedHours,
      activeBatches: adminBatches.length,
      indiaBatches: 3,
      intlBatches: 1,
      beginnerBatches: 2,
      intermediateBatches: 1,
      pendingFeesCount: 18,
    });
  },
  getBatches() {
    return settle(adminBatches);
  },
  getStudents() {
    return settle(studentDirectory);
  },
  getPracticeLibrary() {
    return settle({ adminShared: adminMasterLibrary, own: [] });
  },
  getClassLogs() {
    return settle(adminClassLogs);
  },
  getSubscriptions() {
    return settle(subscriptionRows);
  },
  getAnnouncements() {
    return settle(adminAnnouncements);
  },
  getFormOptions() {
    return settle({
      batches: adminBatches.map((b) => b.name),
      teachers: ["Guru Deshpande", "Anjali Rao", "Kedar Joshi"],
      ragas: ragaOptions,
    });
  },
};

const leaderboardRepository: LeaderboardRepository = {
  getLeaderboard(month?: string) {
    return settle({ ...leaderboard, month: month ?? leaderboard.month });
  },
};

export const mockRepositories: Repositories = {
  session: sessionRepository,
  student: studentRepository,
  teacher: teacherRepository,
  admin: adminRepository,
  leaderboard: leaderboardRepository,
};
