"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { Button } from "@/components/ui/button";

/*
  Download the current rows of a table as a CSV file. Serialisation is pure
  (see lib/csv); this component only wires the result to a browser download.
*/
export function DownloadCsvButton<T>({
  rows,
  columns,
  filename,
  label = "Download",
}: {
  rows: readonly T[];
  columns: readonly CsvColumn<T>[];
  filename: string;
  label?: string;
}) {
  function handleDownload() {
    // Prepend a BOM so spreadsheet apps read Unicode names correctly.
    const bom = String.fromCharCode(0xfeff);
    const csv = bom + toCsv(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={rows.length === 0}
    >
      <DownloadSimple size={16} /> {label}
    </Button>
  );
}
