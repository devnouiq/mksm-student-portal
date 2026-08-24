import type { Metadata } from "next";
import { getRepositories } from "@/data";
import type { HolidayKind } from "@/data/types";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Holiday Calendar" };

const kindTone: Record<HolidayKind, "brand" | "info" | "neutral"> = {
  festival: "brand",
  national: "info",
  break: "neutral",
};
const kindLabel: Record<HolidayKind, string> = {
  festival: "Festival",
  national: "National",
  break: "Break",
};

function weekday(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(new Date(iso));
}

export default async function StudentCalendarPage() {
  const holidays = await getRepositories().student.getHolidays();

  return (
    <>
      <PageHeader
        title="Holiday Calendar"
        description="Days the school is closed in 2026. No classes are scheduled on these dates."
      />

      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Day</TH>
              <TH>Holiday</TH>
              <TH>Type</TH>
            </TR>
          </THead>
          <tbody>
            {holidays.map((h) => (
              <TR key={h.date}>
                <TD className="font-medium text-ink-900">{formatDate(h.date)}</TD>
                <TD className="text-muted-foreground">{weekday(h.date)}</TD>
                <TD>{h.name}</TD>
                <TD>
                  <Badge tone={kindTone[h.kind]}>{kindLabel[h.kind]}</Badge>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}
