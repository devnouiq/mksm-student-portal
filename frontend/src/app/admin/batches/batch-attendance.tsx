"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Table, TableWrap, TD, TH, THead, TR } from "@/components/ui/table";
import { UsersThree } from "@phosphor-icons/react";

export interface BatchAttendanceRow {
  id: string;
  date: string;
  studentName: string;
  raga: string;
  present: boolean;
}

export function BatchAttendance({
  batches,
  rowsByBatch,
}: {
  batches: string[];
  rowsByBatch: Record<string, BatchAttendanceRow[]>;
}) {
  const [batch, setBatch] = useState(batches[0] ?? "");

  const rows = useMemo(
    () =>
      [...(rowsByBatch[batch] ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [rowsByBatch, batch],
  );

  const present = rows.filter((r) => r.present).length;
  const uniqueStudents = new Set(rows.map((r) => r.studentName)).size;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Batch attendance — last 12 months</CardTitle>
          <div className="w-full sm:w-64">
            <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Select batch">
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={UsersThree}
            title="No attendance recorded"
            description="No classes have been logged for this batch yet."
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              <span className="font-semibold text-ink-800">{present}</span> present marks across{" "}
              {rows.length} class attendances · {uniqueStudents} students.
            </p>
            <TableWrap>
              <Table>
                <THead>
                  <TR>
                    <TH>Date</TH>
                    <TH>Student</TH>
                    <TH>Raga</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <tbody>
                  {rows.map((r) => (
                    <TR key={r.id}>
                      <TD className="whitespace-nowrap">{formatDate(r.date)}</TD>
                      <TD className="whitespace-nowrap font-medium text-ink-900">{r.studentName}</TD>
                      <TD className="whitespace-nowrap">{r.raga}</TD>
                      <TD>
                        <Badge tone={r.present ? "success" : "danger"}>
                          {r.present ? "Present" : "Absent"}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </>
        )}
      </CardContent>
    </Card>
  );
}
