import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Table, TableWrap, TH, THead, TR, TD } from "@/components/ui/table";

export const metadata: Metadata = { title: "Classes / Batches" };

export default async function AdminBatchesPage() {
  const batches = await getRepositories().admin.getBatches();

  return (
    <>
      <PageHeader
        title="Manage Classes / Batches"
        description="All batches with their teacher, students and static Zoom link."
        actions={
          <ButtonLink href="/admin/manage-batches" size="sm">
            <Plus size={16} /> Create new batch
          </ButtonLink>
        }
      />

      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Batch</TH>
              <TH>Teacher</TH>
              <TH>Schedule</TH>
              <TH>Level / Language</TH>
              <TH>Students</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {batches.map((b) => (
              <TR key={b.id}>
                <TD className="font-medium text-ink-900">{b.name}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{b.teacherName}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">
                  {b.day}, {b.time}
                </TD>
                <TD className="whitespace-nowrap">
                  <Badge tone="neutral">{b.level}</Badge>{" "}
                  <Badge tone="info">{b.language}</Badge>
                </TD>
                <TD>{b.studentCount}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Students
                    </Button>
                    <ButtonLink href={b.zoomLink} variant="ghost" size="sm">
                      Zoom
                    </ButtonLink>
                    <Button variant="ghost" size="sm">
                      Change teacher
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </>
  );
}
