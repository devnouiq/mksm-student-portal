"use client";

import { useState } from "react";
import type { AttendanceView } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";

/*
  Attendance is auto-marked Present (Online) when a student joins via Zoom on
  the class day (PRD §8.8); the teacher can review and adjust here.
*/
export function AttendanceTable({ data }: { data: AttendanceView }) {
  const [records, setRecords] = useState(data.records);

  const toggle = (mksmNo: string) =>
    setRecords((prev) =>
      prev.map((r) =>
        r.mksmNo === mksmNo
          ? {
              ...r,
              present: !r.present,
              mode: !r.present ? "offline" : null,
            }
          : r,
      ),
    );

  const presentCount = records.filter((r) => r.present).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {presentCount} of {records.length} present
      </p>
      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Student</TH>
              <TH>MKSM No.</TH>
              <TH>Status</TH>
              <TH>Mode</TH>
              <TH className="text-right">Adjust</TH>
            </TR>
          </THead>
          <tbody>
            {records.map((r) => (
              <TR key={r.mksmNo}>
                <TD className="font-medium text-ink-900">{r.studentName}</TD>
                <TD className="text-muted-foreground">{r.mksmNo}</TD>
                <TD>
                  {r.present ? (
                    <Badge tone="success">Present</Badge>
                  ) : (
                    <Badge tone="danger">Absent</Badge>
                  )}
                </TD>
                <TD className="text-muted-foreground">
                  {r.mode === "online"
                    ? "Online (auto)"
                    : r.mode === "offline"
                      ? "Marked by teacher"
                      : "—"}
                </TD>
                <TD className="text-right">
                  <Button variant="outline" size="sm" onClick={() => toggle(r.mksmNo)}>
                    Mark {r.present ? "absent" : "present"}
                  </Button>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
