import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";
import { SubscriptionBadge } from "@/components/domain/subscription-badge";

export const metadata: Metadata = { title: "Payment & Fees" };

const providerLabel: Record<string, string> = {
  razorpay: "Razorpay",
  paypal: "PayPal",
  "one-time": "One-time",
};

export default async function StudentPaymentsPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const { rows } = await repos.student.getPayments(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Payment & Fees"
        description="Subscription status is read-only, synced from Razorpay / PayPal. No payments are processed inside the portal."
        actions={
          <>
            <Button variant="outline" size="sm">
              Change payment method
            </Button>
            <Button size="sm">Re-activate subscription</Button>
          </>
        }
      />

      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Course</TH>
              <TH>Provider</TH>
              <TH>Status</TH>
              <TH>Days to renew</TH>
              <TH>Pending dues</TH>
            </TR>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.courseName}>
                <TD className="font-medium text-ink-900">{r.courseName}</TD>
                <TD className="text-muted-foreground">{providerLabel[r.provider]}</TD>
                <TD>
                  <SubscriptionBadge status={r.status} />
                </TD>
                <TD className="text-muted-foreground">
                  {r.daysToRenew == null ? "—" : `${r.daysToRenew} days`}
                </TD>
                <TD>
                  {r.pendingDuesMinor > 0 ? (
                    <span className="font-medium text-danger-500">
                      {formatCurrency(r.pendingDuesMinor)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}
