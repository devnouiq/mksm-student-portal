import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AddStudentForm } from "./add-student-form";

export const metadata: Metadata = { title: "Add Student" };

export default async function AdminAddStudentPage() {
  const { batches } = await getRepositories().admin.getFormOptions();

  return (
    <>
      <PageHeader
        title="Add Student"
        description="Onboard a new student and assign them to a batch."
      />
      <div className="max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <AddStudentForm batches={batches} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
