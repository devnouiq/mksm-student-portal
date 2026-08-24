import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchForm } from "./batch-form";

export const metadata: Metadata = { title: "Manage Batches" };

export default async function AdminManageBatchesPage() {
  const repos = getRepositories();
  const [{ teachers }, batches] = await Promise.all([
    repos.admin.getFormOptions(),
    repos.admin.getBatches(),
  ]);

  return (
    <>
      <PageHeader
        title="Add / Manage Batches"
        description="Create a new batch with its pitch, level, language and static Zoom link, or edit an existing one."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New batch</CardTitle>
          </CardHeader>
          <CardContent>
            <BatchForm teachers={teachers} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Existing batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="font-medium text-ink-900">{b.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.teacherName} · {b.day}, {b.time}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="neutral">{b.level}</Badge>
                    <Badge tone="info">{b.language}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit batch
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
