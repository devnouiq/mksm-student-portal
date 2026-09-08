import type { Metadata } from "next";
import { UserMinus } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrap, TD, TH, THead, TR } from "@/components/ui/table";

export const metadata: Metadata = { title: "De-enrollment" };

export default async function TeacherDeEnrollmentPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const records = await repos.teacher.getDeEnrollments(user.mksmNo);

  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.deEnrolledOn).getTime() - new Date(a.deEnrolledOn).getTime(),
  );

  return (
    <>
      <PageHeader
        title="De-enrollment"
        description="De-enrolled students from your batches, as recorded by the school office. View only."
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={UserMinus}
          title="No de-enrolled students"
          description="Nobody from your batches has been de-enrolled."
        />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <TR>
                <TH>MKSM No.</TH>
                <TH>Student</TH>
                <TH>Batch</TH>
                <TH>De-enrolled on</TH>
              </TR>
            </THead>
            <tbody>
              {sorted.map((d) => (
                <TR key={d.id}>
                  <TD className="font-medium text-ink-900">{d.mksmNo}</TD>
                  <TD className="whitespace-nowrap">{d.studentName}</TD>
                  <TD className="whitespace-nowrap">{d.batchName}</TD>
                  <TD className="whitespace-nowrap">{formatDate(d.deEnrolledOn)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </>
  );
}
