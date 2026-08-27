/** Pure CSV serialisation for table downloads. No DOM, no side effects. */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/** Escape one field per RFC 4180 — quote when it holds a comma, quote or newline. */
function escapeField(raw: string | number | null | undefined): string {
  const s = raw == null ? "" : String(raw);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a CSV document (header row + one row per record) from typed columns. */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const lines = [columns.map((c) => escapeField(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => escapeField(c.value(row))).join(","));
  }
  return lines.join("\r\n");
}
