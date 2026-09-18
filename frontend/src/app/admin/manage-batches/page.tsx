import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { BatchManager } from "./batch-manager";

export const metadata: Metadata = { title: "Manage Batches" };

export default async function AdminManageBatchesPage() {
  const repos = getRepositories();
  const [{ teachers }, batches, managed] = await Promise.all([
    repos.admin.getFormOptions(),
    repos.admin.getBatches(),
    repos.admin.getManagedStudents(),
  ]);

  const students = managed.map((s) => ({
    mksmNo: s.mksmNo,
    name: `${s.firstName} ${s.lastName}`,
    batchNames: s.batchNames,
  }));

  return (
    <>
      <PageHeader
        title="Add / Manage Batches"
        description="Pick a batch to edit it, change its teacher, and add or remove students. Or create a new one."
      />
      <div className="max-w-3xl">
        <BatchManager batches={batches} teachers={teachers} students={students} />
      </div>
    </>
  );
}
