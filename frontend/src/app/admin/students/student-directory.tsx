"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { StudentDirectoryRow } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";

export function StudentDirectory({ rows }: { rows: StudentDirectoryRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.mksmNo.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.batchName.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <Input
          placeholder="Search by name, MKSM no., email or batch"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search students"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No students match"
          description="Try a different search term."
        />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <TR>
                <TH>MKSM No.</TH>
                <TH>Name</TH>
                <TH>Contact</TH>
                <TH>Batch</TH>
                <TH>Country</TH>
                <TH>Classes 30d / 90d</TH>
                <TH>Last attended</TH>
              </TR>
            </THead>
            <tbody>
              {filtered.map((r) => (
                <TR key={r.mksmNo}>
                  <TD className="font-medium text-ink-900">{r.mksmNo}</TD>
                  <TD className="whitespace-nowrap">{r.name}</TD>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    <span className="block">{r.email}</span>
                    <span className="block text-xs">{r.phone}</span>
                  </TD>
                  <TD className="whitespace-nowrap">{r.batchName}</TD>
                  <TD>{r.country}</TD>
                  <TD>
                    {r.classes30d} / {r.classes90d}
                  </TD>
                  <TD className="whitespace-nowrap">
                    {r.lastAttended ? (
                      formatDate(r.lastAttended)
                    ) : (
                      <Badge tone="warning">Never</Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
