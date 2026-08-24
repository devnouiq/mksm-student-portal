import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { SubscriptionsTable } from "./subscriptions-table";

export const metadata: Metadata = { title: "Manage Subscription" };

export default async function AdminSubscriptionsPage() {
  const rows = await getRepositories().admin.getSubscriptions();

  return (
    <>
      <PageHeader
        title="Manage Subscription"
        description="Read-only status synced from Razorpay (India) and PayPal (international). No payments are processed in the portal."
      />
      <SubscriptionsTable rows={rows} />
    </>
  );
}
