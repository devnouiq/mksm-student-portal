"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { StudentDirectoryRow } from "@/data/types";
import { formatDate } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";
import { DownloadCsvButton } from "@/components/domain/download-csv-button";

const csvColumns: CsvColumn<StudentDirectoryRow>[] = [
  { header: "MKSM No.", value: (r) => r.mksmNo },
  { header: "Name", value: (r) => r.name },
  { header: "Email", value: (r) => r.email },
  { header: "Phone", value: (r) => r.phone },
  { header: "Batch", value: (r) => r.batchName },
  { header: "Country", value: (r) => r.country },
  { header: "Classes 30d", value: (r) => r.classes30d },
  { header: "Classes 90d", value: (r) => r.classes90d },
  { header: "Last attended", value: (r) => (r.lastAttended ? formatDate(r.lastAttended) : "Never") },
];

export function StudentDirectory({ rows }: { rows: StudentDirectoryRow[] }) {
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("all");
  const [country, setCountry] = useState("all");

  const batches = useMemo(
    () => Array.from(new Set(rows.map((r) => r.batchName))).sort(),
    [rows],
  );
  const countries = useMemo(
    () => Array.from(new Set(rows.map((r) => r.country))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchBatch = batch === "all" || r.batchName === batch;
      const matchCountry = country === "all" || r.country === country;
      const matchQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.mksmNo.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.batchName.toLowerCase().includes(q);
      return matchBatch && matchCountry && matchQuery;
    });
  }, [rows, query, batch, country]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
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
        <div className="w-full lg:w-44">
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch">
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full lg:w-44">
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
            <option value="all">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <DownloadCsvButton
          rows={filtered}
          columns={csvColumns}
          filename="active-students.csv"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No students match"
          description="Try a different search term or filter."
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
