import type { Metadata } from "next";
import { CalendarBlank, ClipboardText, UsersThree, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My Batches" };

export default async function TeacherBatchesPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const batches = await repos.teacher.getBatches(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Classes / My Batches"
        description="Your batches with quick actions to start class, review homework and check attendance."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {batches.map((b) => (
          <Card key={b.id}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg text-ink-900">{b.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarBlank size={14} /> {b.day}, {b.time}
                  </p>
                </div>
                {b.isClassDay ? <Badge tone="success">Class today</Badge> : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{b.level}</Badge>
                <Badge tone="brand">Pitch {b.pitch}</Badge>
                <Badge tone="info">{b.language}</Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <UsersThree size={15} /> {b.studentCount} students
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {b.isClassDay ? (
                  <ButtonLink href={b.zoomLink} size="sm">
                    <VideoCamera size={16} weight="fill" /> Start class
                  </ButtonLink>
                ) : (
                  <Button size="sm" variant="secondary">
                    <VideoCamera size={16} /> Start class
                  </Button>
                )}
                <ButtonLink href="/teacher/homework" size="sm" variant="outline">
                  <ClipboardText size={16} /> Homework
                </ButtonLink>
                <ButtonLink href="/teacher/attendance" size="sm" variant="outline">
                  <UsersThree size={16} /> Attendance
                </ButtonLink>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
