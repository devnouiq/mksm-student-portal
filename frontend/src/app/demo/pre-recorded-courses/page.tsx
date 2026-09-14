import type { Metadata } from "next";
import Link from "next/link";
import { Clock, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { Progress } from "@/components/ui/progress";
import { COURSES } from "./courses-data";
import { CourseCover } from "./course-cover";

export const metadata: Metadata = { title: "Pre-Recorded Courses" };

export default function PreRecordedCoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl leading-tight text-ink-900 sm:text-3xl">
          Pre-Recorded Courses
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Structured courses you can take at your own pace — videos, reading notes, practice
          exercises and quizzes. Pick a course to open it.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((course, i) => (
          <Link
            key={course.id}
            href={`/demo/pre-recorded-courses/${course.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop"
          >
            <CourseCover course={course} index={i} />
            <div className="flex flex-1 flex-col p-4">
              <p className="font-medium leading-snug text-ink-900 transition group-hover:text-brand-700">
                {course.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <GraduationCap size={14} /> {course.teacher}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {course.hours}
                </span>
              </div>
              <div className="mt-auto pt-3">
                {course.progress > 0 ? (
                  <div className="flex items-center gap-2">
                    <Progress
                      value={course.progress}
                      className="flex-1"
                      label={`${course.title} progress`}
                    />
                    <span className="text-xs font-semibold text-ink-500">
                      {Math.round(course.progress * 100)}%
                    </span>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-brand-700">Not started</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
