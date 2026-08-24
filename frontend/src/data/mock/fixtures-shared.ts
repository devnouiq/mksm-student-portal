/*
  Mock fixtures — Sankalp Leaderboard, shared by the student & teacher views
  (PRD §5.1). Self-reported hours keyed to the 6-digit MKSM number.
*/

import type {
  LeaderboardBatchRow,
  LeaderboardStudentRow,
  LeaderboardView,
} from "../types";
import { inDays } from "./time";

const studentRanking: LeaderboardStudentRow[] = [
  {
    position: 1,
    mksmNo: "100604",
    studentName: "Arjun Menon",
    batchName: "Taan Batch",
    cumulativeHours: 642.5,
    lastSubmittedMins: 90,
    lastSubmittedDate: inDays(-1),
    submissionCount: 128,
  },
  {
    position: 2,
    mksmNo: "100428",
    studentName: "Melody Kulkarni",
    batchName: "Dhun Batch",
    cumulativeHours: 214.5,
    lastSubmittedMins: 60,
    lastSubmittedDate: inDays(-2),
    submissionCount: 74,
  },
  {
    position: 3,
    mksmNo: "100522",
    studentName: "Sneha Joshi",
    batchName: "Swatva Batch",
    cumulativeHours: 188.0,
    lastSubmittedMins: 45,
    lastSubmittedDate: inDays(-3),
    submissionCount: 66,
  },
];

const batchRanking: LeaderboardBatchRow[] = [
  { position: 1, batchName: "Taan Batch", studentCount: 9, cumulativeHours: 3120.5, avgHoursPerStudent: 346.7 },
  { position: 2, batchName: "Dhun Batch", studentCount: 14, cumulativeHours: 2984.0, avgHoursPerStudent: 213.1 },
  { position: 3, batchName: "Surel Batch", studentCount: 18, cumulativeHours: 2410.0, avgHoursPerStudent: 133.9 },
];

const club600: LeaderboardStudentRow[] = [
  {
    position: 1,
    mksmNo: "100604",
    studentName: "Arjun Menon",
    batchName: "Taan Batch",
    cumulativeHours: 642.5,
    lastSubmittedMins: 90,
    lastSubmittedDate: inDays(-1),
    submissionCount: 128,
  },
  {
    position: 2,
    mksmNo: "100701",
    studentName: "Deepa Nair",
    batchName: "Taan Batch",
    cumulativeHours: 618.0,
    lastSubmittedMins: 75,
    lastSubmittedDate: inDays(-2),
    submissionCount: 121,
  },
];

export const leaderboard: LeaderboardView = {
  month: "August 2026",
  months: ["August 2026", "July 2026", "June 2026", "All time"],
  studentRanking,
  batchRanking,
  club600,
};
