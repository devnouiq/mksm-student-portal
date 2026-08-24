import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";
import { ClassLogForm } from "./class-log-form";

export const metadata: Metadata = { title: "Class Log" };

export default async function TeacherClassLogPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const { teacherName, batches, ragas, history } = await repos.teacher.getClassLog(user.mksmNo);

  const submitTab = (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New class log</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassLogForm teacherName={teacherName} batches={batches} ragas={ragas} />
        </CardContent>
      </Card>
    </div>
  );

  const historyTab = (
    <TableWrap>
      <Table>
        <THead>
          <TR>
            <TH>Date</TH>
            <TH>Batch</TH>
            <TH>Raga</TH>
            <TH>What was covered</TH>
          </TR>
        </THead>
        <tbody>
          {history.map((log) => (
            <TR key={log.id}>
              <TD className="whitespace-nowrap font-medium text-ink-900">
                {formatDate(log.classDate)}
              </TD>
              <TD className="whitespace-nowrap">{log.batchName}</TD>
              <TD className="whitespace-nowrap">{log.ragaCovered}</TD>
              <TD className="text-muted-foreground">{log.whatCovered}</TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );

  return (
    <>
      <PageHeader
        title="Class Log"
        description="Submit a log after each class and review your previously submitted logs."
      />
      <Tabs
        ariaLabel="Class log"
        tabs={[
          { id: "submit", label: "Submit Log", content: submitTab },
          { id: "history", label: "History", content: historyTab },
        ]}
      />
    </>
  );
}
