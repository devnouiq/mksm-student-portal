import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { AdminClassLogTable } from "./class-log-table";

export const metadata: Metadata = { title: "Class Log" };

export default async function AdminClassLogPage() {
  const logs = await getRepositories().admin.getClassLogs();

  return (
    <>
      <PageHeader
        title="Class Log"
        description="Every class log across teachers and batches. Filter, sort and edit any entry."
      />
      <AdminClassLogTable logs={logs} />
    </>
  );
}
