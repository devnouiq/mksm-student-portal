import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { DeEnrollmentManager } from "./de-enrollment-manager";

export const metadata: Metadata = { title: "De-enrollment" };

export default async function AdminDeEnrollmentPage() {
  const repos = getRepositories();
  const [records, lookup] = await Promise.all([
    repos.admin.getDeEnrollments(),
    repos.admin.getDeEnrollmentLookup(),
  ]);

  return (
    <>
      <PageHeader
        title="De-enrollment"
        description="Record de-enrolled students and manage the full list. Teachers see only their own batches."
      />
      <DeEnrollmentManager records={records} lookup={lookup} />
    </>
  );
}
