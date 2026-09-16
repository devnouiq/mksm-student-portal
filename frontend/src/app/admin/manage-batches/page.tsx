import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { BatchManager } from "./batch-manager";

export const metadata: Metadata = { title: "Manage Batches" };

export default async function AdminManageBatchesPage() {
  const repos = getRepositories();
  const [{ teachers }, batches] = await Promise.all([
    repos.admin.getFormOptions(),
    repos.admin.getBatches(),
  ]);

  return (
    <>
      <PageHeader
        title="Add / Manage Batches"
        description="Pick a batch from the dropdown to edit it, or create a new one. Same form for both."
      />
      <div className="max-w-3xl">
        <BatchManager batches={batches} teachers={teachers} />
      </div>
    </>
  );
}
