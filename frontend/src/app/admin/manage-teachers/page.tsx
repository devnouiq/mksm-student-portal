import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { ManageTeachers } from "./manage-teachers";

export const metadata: Metadata = { title: "Manage Teachers" };

export default async function AdminManageTeachersPage() {
  const teachers = await getRepositories().admin.getManagedTeachers();

  return (
    <>
      <PageHeader
        title="Add / Manage Teachers"
        description="Pick a teacher from the dropdown to edit them, or add a new one. Same form for both — every teacher gets a T-number primary ID."
      />
      <ManageTeachers teachers={teachers} />
    </>
  );
}
