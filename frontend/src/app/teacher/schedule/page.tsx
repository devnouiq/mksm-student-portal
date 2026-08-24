import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Class Schedule" };

export default async function TeacherSchedulePage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const schedule = await repos.teacher.getSchedule(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Class Schedule"
        description="Your weekly timetable. This is read-only — rescheduling and substitutions are handled offline."
      />

      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Day</TH>
              <TH>Time</TH>
              <TH>Batch</TH>
              <TH>Level</TH>
              <TH>Pitch</TH>
            </TR>
          </THead>
          <tbody>
            {schedule.map((s) => (
              <TR key={s.id}>
                <TD className="font-medium text-ink-900">{s.day}</TD>
                <TD className="text-muted-foreground">{s.time}</TD>
                <TD>{s.batchName}</TD>
                <TD>
                  <Badge tone="neutral">{s.level}</Badge>
                </TD>
                <TD>
                  <Badge tone="brand">{s.pitch}</Badge>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}
