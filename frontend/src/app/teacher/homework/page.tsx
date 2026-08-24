import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { HomeworkQueue } from "./homework-queue";

export const metadata: Metadata = { title: "Check Homework" };

export default async function TeacherHomeworkPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const { items, batches } = await repos.teacher.getHomeworkQueue(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Check Homework"
        description="Review student submissions, play the audio and share written or audio feedback."
      />
      <HomeworkQueue items={items} batches={batches} />
    </>
  );
}
