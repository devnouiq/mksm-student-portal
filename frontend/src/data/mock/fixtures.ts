/*
  Mock fixtures — realistic sample data for the M1 clickable prototype.
  All values here are illustrative (labelled sample data, PRD §5.1 "honest
  content" rule). Nothing here is fetched from a real system.
*/

import type {
  Announcement,
  EnrolledCourse,
  MkMessage,
  SankalpSummary,
  SubscriptionSummary,
  UserProfile,
  VoicesOfMksm,
} from "../types";
import { inDays } from "./time";

export const demoUsers: Record<UserProfile["role"], UserProfile> = {
  student: {
    id: "u-stu-1",
    role: "student",
    mksmNo: "100428",
    name: "Melody Kulkarni",
    email: "melody@example.com",
  },
  teacher: {
    id: "u-tea-1",
    role: "teacher",
    mksmNo: "500112",
    name: "Guru Deshpande",
    email: "guru@example.com",
  },
  admin: {
    id: "u-adm-1",
    role: "admin",
    mksmNo: "900001",
    name: "Admin Office",
    email: "admin@example.com",
  },
};

// Class day is computed relative to "now" so "Join Now" demonstrates both states.
export const studentCourses: EnrolledCourse[] = [
  {
    courseId: "c-hindustani-vocal",
    courseName: "Hindustani Classical Vocal",
    batchName: "Dhun Batch",
    teacherName: "Guru Deshpande",
    progress: 0.62,
    nextClassAt: inDays(0), // today → class day
    isClassDay: true,
    ongoing: true, // weekly batch class, no fixed end — shown at 100%
  },
  {
    courseId: "c-light-music",
    courseName: "Light Music & Bhajan",
    batchName: "Swatva Batch",
    teacherName: "Anjali Rao",
    progress: 0.34,
    nextClassAt: inDays(3),
    isClassDay: false,
  },
  {
    courseId: "c-harmonium",
    courseName: "Harmonium Foundations",
    batchName: "Surel Batch",
    teacherName: "Kedar Joshi",
    progress: 0.12,
    nextClassAt: inDays(5),
    isClassDay: false,
  },
];

export const studentSubscription: SubscriptionSummary = {
  provider: "razorpay",
  status: "active",
  daysToRenew: 12,
  pendingDuesMinor: 0,
};

export const studentSankalp: SankalpSummary = {
  mksmNo: "100428",
  personalHours: 214.5,
  weeklyHours: 6.5,
  nextMilestoneHours: 300,
  schoolAchievedHours: 30000,
  schoolTargetHours: 50000,
};

export const voicesOfMksm: VoicesOfMksm = {
  // Admin-swapped monthly embed (PRD §8.5).
  youtubeUrl: "https://www.youtube.com/embed/OMUeE5F_jSs",
  title: "Voices of MKSM — Monthly Showcase",
  month: "August 2026",
};

export const studentMkMessage: MkMessage = {
  id: "mk-1",
  kind: "video",
  title: "A note on riyaz before the festival season",
  body: "Keep your morning alankars steady this month — consistency over intensity.",
  mediaUrl: "https://www.youtube.com/embed/OMUeE5F_jSs",
  postedAt: inDays(-2, 8),
  audienceLabel: "All Intermediate Students",
};

export const studentAnnouncements: Announcement[] = [
  {
    id: "a-1",
    title: "Guru Purnima special session",
    body: "A special masterclass is scheduled this Sunday. Details in Class Schedule.",
    postedAt: inDays(-1, 9),
    read: false,
    source: "admin",
    important: true,
    audienceLabel: "All Students",
  },
  {
    id: "a-2",
    title: "New practice material added",
    body: "Fresh alankar audio (C#, G#, B#) is now available under Practice Material.",
    postedAt: inDays(-3, 11),
    read: false,
    source: "community",
    audienceLabel: "All Students",
  },
  {
    id: "a-3",
    title: "Holiday notice",
    body: "The school will be closed on 15 August for Independence Day.",
    postedAt: inDays(-6, 10),
    read: true,
    source: "admin",
    important: true,
    audienceLabel: "All Students",
  },
];
