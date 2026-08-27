/*
  Mock fixtures — Student screens beyond the Overview.
  Illustrative sample data only (PRD "honest content" rule).
*/

import type {
  CatalogCourse,
  ClassDateOption,
  CourseDetail,
  HelpView,
  Holiday,
  HomeworkSubmission,
  PaymentRow,
} from "../types";
import { inDays } from "./time";

export const studentCourseDetails: CourseDetail[] = [
  {
    courseId: "c-hindustani-vocal",
    courseName: "Hindustani Classical Vocal",
    batchName: "Dhun Batch",
    teacherName: "Guru Deshpande",
    progress: 0.62,
    nextClassAt: inDays(0),
    isClassDay: true,
    ongoing: true,
    day: "Monday",
    time: "6:00 PM IST",
    pitch: "C#",
    level: "Intermediate",
    attendancePct: 0.91,
    zoomLink: "https://zoom.us/j/000-dhun-batch",
    recordingRequestedOn: null,
  },
  {
    courseId: "c-light-music",
    courseName: "Light Music & Bhajan",
    batchName: "Swatva Batch",
    teacherName: "Anjali Rao",
    progress: 0.34,
    nextClassAt: inDays(3),
    isClassDay: false,
    day: "Thursday",
    time: "7:30 PM IST",
    pitch: "G#",
    level: "Beginner",
    attendancePct: 0.78,
    zoomLink: "https://zoom.us/j/000-swatva-batch",
    recordingRequestedOn: inDays(-2),
  },
  {
    courseId: "c-harmonium",
    courseName: "Harmonium Foundations",
    batchName: "Surel Batch",
    teacherName: "Kedar Joshi",
    progress: 0.12,
    nextClassAt: inDays(5),
    isClassDay: false,
    day: "Saturday",
    time: "10:00 AM IST",
    pitch: "B#",
    level: "Beginner",
    attendancePct: 0.66,
    zoomLink: "https://zoom.us/j/000-surel-batch",
    recordingRequestedOn: null,
  },
];

/** Upcoming class dates the student can submit homework against (PRD §8.7). */
export const studentClassDates: ClassDateOption[] = [
  { value: inDays(3), batchName: "Swatva Batch", courseName: "Light Music & Bhajan" },
  { value: inDays(5), batchName: "Surel Batch", courseName: "Harmonium Foundations" },
  { value: inDays(7), batchName: "Dhun Batch", courseName: "Hindustani Classical Vocal" },
];

export const studentSubmissions: HomeworkSubmission[] = [
  {
    id: "hw-1",
    title: "Raag Yaman — aaroh/avaroh",
    description: "Recorded three cycles at slow tempo as asked.",
    courseName: "Hindustani Classical Vocal",
    batchName: "Dhun Batch",
    classDate: inDays(-7),
    submittedAt: inDays(-9),
    status: "reviewed",
    late: false,
    feedbackText:
      "Good sur on the aaroh. Watch the komal ni on the way down — steady the breath before it.",
    feedbackAudioUrl: "#audio-feedback-hw-1",
  },
  {
    id: "hw-2",
    title: "Bhajan — first antara",
    description: "First antara with harmonium accompaniment.",
    courseName: "Light Music & Bhajan",
    batchName: "Swatva Batch",
    classDate: inDays(-4),
    submittedAt: inDays(-3),
    status: "review-pending",
    late: true,
    feedbackText: null,
    feedbackAudioUrl: null,
  },
  {
    id: "hw-3",
    title: "Alankar set 4",
    description: "All six alankars in C#.",
    courseName: "Harmonium Foundations",
    batchName: "Surel Batch",
    classDate: inDays(-1),
    submittedAt: inDays(-2),
    status: "submitted",
    late: false,
    feedbackText: null,
    feedbackAudioUrl: null,
  },
];

export const studentPayments: PaymentRow[] = [
  {
    courseName: "Hindustani Classical Vocal",
    provider: "razorpay",
    status: "active",
    daysToRenew: 12,
    pendingDuesMinor: 0,
  },
  {
    courseName: "Light Music & Bhajan",
    provider: "razorpay",
    status: "active",
    daysToRenew: 26,
    pendingDuesMinor: 0,
  },
  {
    courseName: "Harmonium Foundations",
    provider: "one-time",
    status: "one-time",
    daysToRenew: null,
    pendingDuesMinor: 150000,
  },
];

export const courseCatalog: CatalogCourse[] = [
  {
    id: "cat-tabla",
    name: "Tabla — Rhythm Foundations",
    description: "Theka, kaida and basic compositions in Teentaal and Dadra.",
    level: "Beginner",
    language: "Hindi",
    priceLabel: "₹1,500 / month",
    enrolled: false,
  },
  {
    id: "cat-sugam",
    name: "Sugam Sangeet — Marathi Bhavgeet",
    description: "Melodic Marathi light-classical repertoire and expression.",
    level: "Intermediate",
    language: "Marathi",
    priceLabel: "₹1,800 / month",
    enrolled: false,
  },
  {
    id: "cat-vocal-adv",
    name: "Advanced Khayal Gayaki",
    description: "Vistaar, bol-taan and layakari for advanced vocalists.",
    level: "Advance",
    language: "Hindi",
    priceLabel: "₹2,400 / month",
    enrolled: false,
  },
  {
    id: "cat-hindustani",
    name: "Hindustani Classical Vocal",
    description: "Your current course — foundations through intermediate raga work.",
    level: "Intermediate",
    language: "Marathi",
    priceLabel: "Enrolled",
    enrolled: true,
  },
];

export const holidays2026: Holiday[] = [
  { date: "2026-01-26", name: "Republic Day", kind: "national" },
  { date: "2026-03-04", name: "Holi", kind: "festival" },
  { date: "2026-08-15", name: "Independence Day", kind: "national" },
  { date: "2026-08-26", name: "Ganesh Chaturthi", kind: "festival" },
  { date: "2026-10-02", name: "Gandhi Jayanti", kind: "national" },
  { date: "2026-10-20", name: "Dussehra", kind: "festival" },
  { date: "2026-11-08", name: "Diwali", kind: "festival" },
  { date: "2026-12-25", name: "Winter Break begins", kind: "break" },
];

export const helpContent: HelpView = {
  tutorials: [
    {
      id: "t-1",
      title: "Getting started with the MKSM portal",
      description: "A quick tour of your dashboard, courses and Sankalp.",
      durationLabel: "4:20",
    },
    {
      id: "t-2",
      title: "How to submit homework",
      description: "Pick a class date, add a recording and submit before the cutoff.",
      durationLabel: "3:05",
    },
    {
      id: "t-3",
      title: "Requesting a class recording",
      description: "Raise a recording request from My Courses.",
      durationLabel: "2:15",
    },
    {
      id: "t-4",
      title: "Understanding your subscription",
      description: "Reading your subscription status and renewing on time.",
      durationLabel: "3:40",
    },
  ],
  faqs: [
    {
      id: "f-1",
      question: "How are my Sankalp hours counted?",
      answer:
        "Sankalp hours are self-reported and keyed to your 6-digit MKSM number. They roll up into the school-wide pledge shown on your Overview.",
    },
    {
      id: "f-2",
      question: "What happens if I submit homework late?",
      answer:
        "Late submissions are still accepted — they are simply tagged 'Late Submission' for your teacher.",
    },
    {
      id: "f-3",
      question: "How do I join my online class?",
      answer:
        "On a class day, use 'Join Now' on My Courses. It opens Zoom and marks your attendance as Present (Online).",
    },
    {
      id: "f-4",
      question: "How do I change my payment method?",
      answer:
        "Open Payment & Fees and choose 'Change payment method'. Subscription status is read-only in the portal.",
    },
  ],
};
