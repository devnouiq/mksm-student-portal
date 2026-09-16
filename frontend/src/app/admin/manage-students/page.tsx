import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { ManageStudents } from "./manage-students";

export const metadata: Metadata = { title: "Manage Students" };

export default async function AdminManageStudentsPage() {
  const repos = getRepositories();
  const [students, { batches }] = await Promise.all([
    repos.admin.getManagedStudents(),
    repos.admin.getFormOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Add / Manage Students"
        description="Pick a student from the dropdown to edit them, or add a new one. Same form for both — with status, audit trail and attendance."
      />
      <ManageStudents students={students} batches={batches} />
    </>
  );
}
