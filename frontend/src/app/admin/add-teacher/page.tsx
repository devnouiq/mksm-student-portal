import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AddTeacherForm } from "./add-teacher-form";

export const metadata: Metadata = { title: "Add Teacher" };

export default async function AdminAddTeacherPage() {
  const { batches } = await getRepositories().admin.getFormOptions();

  return (
    <>
      <PageHeader
        title="Add Teacher"
        description="Onboard a new teacher, set their access level and assign a batch."
      />
      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <AddTeacherForm batches={batches} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
