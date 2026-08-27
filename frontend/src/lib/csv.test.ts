import { describe, expect, it } from "vitest";
import { toCsv, type CsvColumn } from "./csv";

interface Row {
  name: string;
  hours: number;
  note: string | null;
}

const columns: CsvColumn<Row>[] = [
  { header: "Name", value: (r) => r.name },
  { header: "Hours", value: (r) => r.hours },
  { header: "Note", value: (r) => r.note },
];

describe("toCsv", () => {
  it("emits a header row even with no data", () => {
    expect(toCsv([], columns)).toBe("Name,Hours,Note");
  });

  it("serialises rows with CRLF line endings", () => {
    const csv = toCsv([{ name: "Arjun", hours: 12, note: "ok" }], columns);
    expect(csv).toBe("Name,Hours,Note\r\nArjun,12,ok");
  });

  it("quotes fields containing commas, quotes or newlines", () => {
    const csv = toCsv(
      [{ name: "Rao, A", hours: 3, note: 'said "hi"\nagain' }],
      columns,
    );
    expect(csv).toBe(
      'Name,Hours,Note\r\n"Rao, A",3,"said ""hi""\nagain"',
    );
  });

  it("renders null and undefined as empty fields", () => {
    const csv = toCsv([{ name: "Deepa", hours: 0, note: null }], columns);
    expect(csv).toBe("Name,Hours,Note\r\nDeepa,0,");
  });
});
