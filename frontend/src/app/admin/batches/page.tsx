import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { AssignmentsManager } from "./assignments-manager";
import { BatchAttendance, type BatchAttendanceRow } from "./batch-attendance";

export const metadata: Metadata = { title: "Assignments" };

export default async function AdminAssignmentsPage() {
  const repos = getRepositories();
  const [batches, managed, teachers] = await Promise.all([
    repos.admin.getBatches(),
    repos.admin.getManagedStudents(),
    repos.admin.getManagedTeachers(),
  ]);

  const assignBatches = batches.map((b) => ({
    id: b.id,
    batchId: b.batchId,
    name: b.name,
    teacherName: b.teacherName,
    day: b.day,
    time: b.time,
  }));

  const assignTeachers = teachers
    .filter((t) => t.status === "active")
    .map((t) => ({ teacherId: t.teacherId, name: `${t.firstName} ${t.lastName}` }));

  const assignStudents = managed.map((s) => ({
    mksmNo: s.mksmNo,
    name: `${s.firstName} ${s.lastName}`,
    batchNames: s.batchNames,
  }));

  // Attendance grouped by batch, same data as the student view.
  const rowsByBatch: Record<string, BatchAttendanceRow[]> = {};
  for (const s of managed) {
    for (const a of s.attendance) {
      (rowsByBatch[a.batchName] ??= []).push({
        id: a.id,
        date: a.date,
        studentName: `${s.firstName} ${s.lastName}`,
        raga: a.ragaCovered,
        present: a.present,
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Pick a batch to assign its teacher and its students. Create or edit batches themselves on Manage Batches."
        actions={
          <ButtonLink href="/admin/manage-batches" size="sm">
            <Plus size={16} /> Create new batch
          </ButtonLink>
        }
      />

      <AssignmentsManager
        batches={assignBatches}
        teachers={assignTeachers}
        students={assignStudents}
      />

      <div className="mt-8">
        <BatchAttendance batches={batches.map((b) => b.name)} rowsByBatch={rowsByBatch} />
      </div>
    </>
  );
}
