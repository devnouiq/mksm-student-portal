"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { SubscriptionRow } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";
import { SubscriptionBadge } from "@/components/domain/subscription-badge";

const providerName: Record<string, string> = {
  razorpay: "Razorpay",
  paypal: "PayPal",
  "one-time": "One-time",
};

export function SubscriptionsTable({ rows }: { rows: SubscriptionRow[] }) {
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchProvider = provider === "all" || r.provider === provider;
      const matchStatus = status === "all" || r.status === status;
      const matchQuery =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.mksmNo.includes(q) ||
        r.subId.toLowerCase().includes(q);
      return matchProvider && matchStatus && matchQuery;
    });
  }, [rows, provider, status, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <Input
            placeholder="Search by student, MKSM no. or subscription id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search subscriptions"
          />
        </div>
        <div className="w-full lg:w-44">
          <Select value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="Filter by provider">
            <option value="all">All providers</option>
            <option value="razorpay">Razorpay</option>
            <option value="paypal">PayPal</option>
            <option value="one-time">One-time</option>
          </Select>
        </div>
        <div className="w-full lg:w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MagnifyingGlass} title="No subscriptions match" description="Try different filters." />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <TR>
                <TH>MKSM No.</TH>
                <TH>Student</TH>
                <TH>Batch</TH>
                <TH>Country</TH>
                <TH>Provider</TH>
                <TH>Sub. ID</TH>
                <TH>Status</TH>
                <TH>Cycle (paid/active)</TH>
                <TH>Start</TH>
                <TH>Next due</TH>
                <TH>Paid this yr</TH>
                <TH>Last 3 mo</TH>
              </TR>
            </THead>
            <tbody>
              {filtered.map((r) => (
                <TR key={r.mksmNo + r.subId}>
                  <TD className="font-medium text-ink-900">{r.mksmNo}</TD>
                  <TD className="whitespace-nowrap">
                    <span className="block">{r.studentName}</span>
                    <span className="block text-xs text-muted-foreground">{r.email}</span>
                  </TD>
                  <TD className="whitespace-nowrap">{r.batchName}</TD>
                  <TD>{r.country}</TD>
                  <TD>{providerName[r.provider]}</TD>
                  <TD className="whitespace-nowrap text-muted-foreground">{r.subId}</TD>
                  <TD>
                    <SubscriptionBadge status={r.status} />
                  </TD>
                  <TD className="text-center">
                    {r.paidCycle} / {r.activeCycle}
                  </TD>
                  <TD className="whitespace-nowrap">{formatDate(r.startDate)}</TD>
                  <TD className="whitespace-nowrap">
                    {r.nextDue ? formatDate(r.nextDue) : "—"}
                  </TD>
                  <TD className="text-center">{r.paymentsThisYear}</TD>
                  <TD className="text-center">{r.paymentsLast3Months}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
