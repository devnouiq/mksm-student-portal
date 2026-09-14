import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { COURSES, courseBySlug } from "../courses-data";
import { CourseDetail } from "./course-detail";

export function generateStaticParams() {
  return COURSES.map((c) => ({ courseId: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = courseBySlug(courseId);
  return { title: course ? course.title : "Course" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = courseBySlug(courseId);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <Link
        href="/demo/pre-recorded-courses"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition hover:text-brand-700"
      >
        <ArrowLeft size={16} /> All courses
      </Link>
      <CourseDetail course={course} />
    </main>
  );
}
