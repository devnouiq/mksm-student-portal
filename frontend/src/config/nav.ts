/*
  Role-based navigation (PRD §4 site architecture).
  One source of truth for the sidebar of each persona. Access control is a
  cross-cutting constraint (PRD §7): a role only ever sees its own nav.
*/

import type { Icon } from "@phosphor-icons/react";
import {
  Books,
  CalendarBlank,
  ChalkboardTeacher,
  ChartLineUp,
  ClipboardText,
  Compass,
  CreditCard,
  FileText,
  GraduationCap,
  House,
  IdentificationCard,
  Megaphone,
  MusicNotes,
  Notebook,
  Scroll,
  ShieldCheck,
  Trophy,
  UploadSimple,
  UserPlus,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Role } from "@/data/types";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

const student: NavItem[] = [
  { label: "Overview", href: "/student/overview", icon: House },
  { label: "My Courses", href: "/student/courses", icon: GraduationCap },
  { label: "Practice Material", href: "/student/practice", icon: MusicNotes },
  { label: "Submit Homework", href: "/student/homework", icon: UploadSimple },
  { label: "Sankalp Leaderboard", href: "/student/sankalp", icon: Trophy },
  { label: "Announcements", href: "/student/announcements", icon: Megaphone },
  { label: "Payment & Fees", href: "/student/payments", icon: CreditCard },
  { label: "Explore Courses", href: "/student/explore", icon: Compass },
  { label: "Holiday Calendar", href: "/student/calendar", icon: CalendarBlank },
  { label: "Help", href: "/student/help", icon: ShieldCheck },
  { label: "MKSM Policy", href: "/student/policy", icon: Scroll },
];

const teacher: NavItem[] = [
  { label: "Overview", href: "/teacher/overview", icon: House },
  { label: "My Batches", href: "/teacher/batches", icon: ChalkboardTeacher },
  { label: "Check Homework", href: "/teacher/homework", icon: ClipboardText },
  { label: "Practice Material", href: "/teacher/practice", icon: MusicNotes },
  { label: "Class Schedule", href: "/teacher/schedule", icon: CalendarBlank },
  { label: "Attendance", href: "/teacher/attendance", icon: UsersThree },
  { label: "Class Log", href: "/teacher/class-log", icon: Notebook },
  { label: "Sankalp Leaderboard", href: "/teacher/sankalp", icon: Trophy },
  { label: "Announcements", href: "/teacher/announcements", icon: Megaphone },
];

const admin: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: House },
  { label: "Classes / Batches", href: "/admin/batches", icon: ChalkboardTeacher },
  { label: "Active Students", href: "/admin/students", icon: UsersThree },
  { label: "Practice Material", href: "/admin/practice", icon: MusicNotes },
  { label: "Class Log", href: "/admin/class-log", icon: Notebook },
  { label: "Add Student", href: "/admin/add-student", icon: UserPlus },
  { label: "Add Teacher", href: "/admin/add-teacher", icon: IdentificationCard },
  { label: "Manage Batches", href: "/admin/manage-batches", icon: Books },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: ChartLineUp },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: WhatsappLogo },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

const NAV: Record<Role, NavItem[]> = { student, teacher, admin };

export function navForRole(role: Role): NavItem[] {
  return NAV[role];
}

export const roleLabels: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

// Fallback icon export for pages that want the persona glyph.
export { FileText };
