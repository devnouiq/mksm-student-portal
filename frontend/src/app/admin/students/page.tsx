import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { StudentDirectory } from "./student-directory";

export const metadata: Metadata = { title: "Active Students" };

export default async function AdminStudentsPage() {
  const rows = await getRepositories().admin.getStudents();

  return (
    <>
      <PageHeader
        title="Active Students"
        description="Searchable directory of students with attendance activity over the last 30 and 90 days."
      />
      <StudentDirectory rows={rows} />
    </>
  );
}
