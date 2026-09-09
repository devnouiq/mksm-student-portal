import type { Metadata } from "next";
import { CoursesDemo } from "./courses-demo";

export const metadata: Metadata = { title: "Pre-Recorded Courses" };

export default function PreRecordedCoursesDemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl leading-tight text-ink-900 sm:text-3xl">
          Pre-Recorded Courses
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Learn at your own pace with recorded lessons from your gurus.
        </p>
      </div>

      <CoursesDemo />
    </main>
  );
}
