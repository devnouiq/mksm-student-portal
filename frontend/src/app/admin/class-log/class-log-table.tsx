"use client";

import { useMemo, useState } from "react";
import type { ClassLogEntry } from "@/data/types";
import { formatDate } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Notebook } from "@phosphor-icons/react";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";
import { DownloadCsvButton } from "@/components/domain/download-csv-button";

const csvColumns: CsvColumn<ClassLogEntry>[] = [
  { header: "Date", value: (l) => formatDate(l.classDate) },
  { header: "Teacher", value: (l) => l.teacherName },
  { header: "Batch", value: (l) => l.batchName },
  { header: "Raga", value: (l) => l.ragaCovered },
  { header: "What was covered", value: (l) => l.whatCovered },
  { header: "Comments", value: (l) => l.comments },
];

export function AdminClassLogTable({ logs }: { logs: ClassLogEntry[] }) {
  const [teacher, setTeacher] = useState("all");
  const [batch, setBatch] = useState("all");

  const teachers = useMemo(
    () => Array.from(new Set(logs.map((l) => l.teacherName))),
    [logs],
  );
  const batches = useMemo(
    () => Array.from(new Set(logs.map((l) => l.batchName))),
    [logs],
  );

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          (teacher === "all" || l.teacherName === teacher) &&
          (batch === "all" || l.batchName === batch),
      ),
    [logs, teacher, batch],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full sm:w-56">
          <Select value={teacher} onChange={(e) => setTeacher(e.target.value)} aria-label="Filter by teacher">
            <option value="all">All teachers</option>
            {teachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch">
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:ml-auto">
          <DownloadCsvButton
            rows={filtered}
            columns={csvColumns}
            filename="class-logs.csv"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Notebook} title="No logs match" description="Try different filters." />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Teacher</TH>
                <TH>Batch</TH>
                <TH>Raga</TH>
                <TH>What was covered</TH>
                <TH className="text-right">Action</TH>
              </TR>
            </THead>
            <tbody>
              {filtered.map((l) => (
                <TR key={l.id}>
                  <TD className="whitespace-nowrap font-medium text-ink-900">
                    {formatDate(l.classDate)}
                  </TD>
                  <TD className="whitespace-nowrap">{l.teacherName}</TD>
                  <TD className="whitespace-nowrap">{l.batchName}</TD>
                  <TD className="whitespace-nowrap">{l.ragaCovered}</TD>
                  <TD className="text-muted-foreground">{l.whatCovered}</TD>
                  <TD className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
