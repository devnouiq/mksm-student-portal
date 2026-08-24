/*
  Mock fixtures — Teacher screens. Illustrative sample data only.
  DEA alerts and class-log reminder are scoped to the teacher's own batches
  (PRD §7, §8.3, §8.12).
*/

import type {
  Announcement,
  AttendanceView,
  ClassLogEntry,
  DeaAlert,
  HomeworkForReview,
  PracticeMaterial,
  ScheduleEntry,
  TeacherBatch,
} from "../types";
import { inDays } from "./time";

export const teacherBatches: TeacherBatch[] = [
  {
    id: "b-dhun",
    name: "Dhun Batch",
    day: "Monday",
    time: "6:00 PM IST",
    level: "Intermediate",
    language: "Marathi",
    pitch: "C#",
    studentCount: 14,
    zoomLink: "https://zoom.us/j/000-dhun-batch",
    isClassDay: true,
  },
  {
    id: "b-surel",
    name: "Surel Batch",
    day: "Saturday",
    time: "10:00 AM IST",
    level: "Beginner",
    language: "Hindi",
    pitch: "B#",
    studentCount: 18,
    zoomLink: "https://zoom.us/j/000-surel-batch",
    isClassDay: false,
  },
  {
    id: "b-taan",
    name: "Taan Batch",
    day: "Wednesday",
    time: "8:00 PM IST",
    level: "Advance",
    language: "Hindi",
    pitch: "G#",
    studentCount: 9,
    zoomLink: "https://zoom.us/j/000-taan-batch",
    isClassDay: false,
  },
];

export const teacherAnnouncements: Announcement[] = [
  {
    id: "ta-1",
    title: "Faculty sync — Sunday 5 PM",
    body: "Monthly faculty alignment on the new practice-material library.",
    postedAt: inDays(-1, 9),
    read: false,
  },
  {
    id: "ta-2",
    title: "Class Log reminder policy",
    body: "Please submit class logs within 24 hours of each class.",
    postedAt: inDays(-4, 10),
    read: false,
  },
  {
    id: "ta-3",
    title: "New raga list published",
    body: "The Class Log raga dropdown now includes seasonal ragas.",
    postedAt: inDays(-8, 11),
    read: true,
  },
];

export const teacherDeaAlerts: DeaAlert[] = [
  { id: "dea-1", code: "DEA-3", studentName: "Akash Patil", batchName: "Dhun Batch" },
  { id: "dea-2", code: "DEA-1", studentName: "Meera Kulkarni", batchName: "Surel Batch" },
];

export const teacherHomeworkQueue: HomeworkForReview[] = [
  {
    id: "thw-1",
    studentName: "Rohan Shinde",
    studentMksmNo: "100511",
    batchName: "Dhun Batch",
    title: "Raag Yaman — aaroh/avaroh",
    description: "Three cycles at slow tempo.",
    submittedAt: inDays(-1, 20),
    classDate: inDays(0),
    status: "review-pending",
    late: false,
    audioUrl: "#audio-thw-1",
  },
  {
    id: "thw-2",
    studentName: "Sneha Joshi",
    studentMksmNo: "100522",
    batchName: "Dhun Batch",
    title: "Bandish — sthayi",
    description: "Sthayi with tabla lehra.",
    submittedAt: inDays(-2, 19),
    classDate: inDays(0),
    status: "review-pending",
    late: true,
    audioUrl: "#audio-thw-2",
  },
  {
    id: "thw-3",
    studentName: "Vivek Rao",
    studentMksmNo: "100538",
    batchName: "Surel Batch",
    title: "Alankar set 4",
    description: "Six alankars in B#.",
    submittedAt: inDays(-3, 18),
    classDate: inDays(-1),
    status: "submitted",
    late: false,
    audioUrl: "#audio-thw-3",
  },
  {
    id: "thw-4",
    studentName: "Priya Nair",
    studentMksmNo: "100540",
    batchName: "Taan Batch",
    title: "Taan practice — drut",
    description: "Fast taans across three saptak.",
    submittedAt: inDays(-6, 21),
    classDate: inDays(-4),
    status: "reviewed",
    late: false,
    audioUrl: "#audio-thw-4",
  },
];

export const teacherSchedule: ScheduleEntry[] = [
  { id: "s-1", day: "Monday", time: "6:00 PM IST", batchName: "Dhun Batch", level: "Intermediate", pitch: "C#" },
  { id: "s-2", day: "Wednesday", time: "8:00 PM IST", batchName: "Taan Batch", level: "Advance", pitch: "G#" },
  { id: "s-3", day: "Saturday", time: "10:00 AM IST", batchName: "Surel Batch", level: "Beginner", pitch: "B#" },
];

export const teacherAttendance: AttendanceView = {
  batches: ["Dhun Batch", "Surel Batch", "Taan Batch"],
  classDate: inDays(0),
  records: [
    { studentName: "Rohan Shinde", mksmNo: "100511", present: true, mode: "online" },
    { studentName: "Sneha Joshi", mksmNo: "100522", present: true, mode: "online" },
    { studentName: "Akash Patil", mksmNo: "100509", present: false, mode: null },
    { studentName: "Isha Kale", mksmNo: "100517", present: true, mode: "offline" },
    { studentName: "Manish Gokhale", mksmNo: "100525", present: true, mode: "online" },
    { studentName: "Tanvi Bhosale", mksmNo: "100531", present: false, mode: null },
  ],
};

/** Teacher's own uploads (shareable to own batches only). */
export const teacherOwnMaterial: PracticeMaterial[] = [
  {
    id: "tm-1",
    title: "Yaman — my reference recording",
    kind: "audio",
    pitch: "C#",
    ownerRole: "teacher",
    batchName: "Dhun Batch",
    notes: "Sing along after the second cycle.",
    addedAt: inDays(-5),
    meta: "5:48",
  },
  {
    id: "tm-2",
    title: "Breathing & posture notes",
    kind: "pdf",
    pitch: null,
    ownerRole: "teacher",
    batchName: "Surel Batch",
    notes: "For beginners struggling with sustained notes.",
    addedAt: inDays(-12),
    meta: "480 KB",
  },
];

/** A class that ran yesterday for Dhun Batch and has no log yet (PRD §8.12). */
export const teacherClassLogHistory: ClassLogEntry[] = [
  {
    id: "cl-1",
    classDate: inDays(-3),
    batchName: "Surel Batch",
    ragaCovered: "Bhupali",
    whatCovered: "Aaroh/avaroh and a simple sargam geet.",
    comments: "Batch is progressing well on sur.",
    teacherName: "Guru Deshpande",
  },
  {
    id: "cl-2",
    classDate: inDays(-8),
    batchName: "Taan Batch",
    ragaCovered: "Bhairav",
    whatCovered: "Drut taan patterns across saptak.",
    comments: null,
    teacherName: "Guru Deshpande",
  },
];

export const ragaOptions = [
  "Yaman",
  "Bhairav",
  "Bhupali",
  "Todi",
  "Malkauns",
  "Desh",
  "Kafi",
  "Bageshri",
];
