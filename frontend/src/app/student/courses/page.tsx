import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlank, ClipboardText, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatDate, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { PracticeMaterialList } from "@/components/domain/practice-material-list";
import { RequestRecordingButton } from "@/components/domain/request-recording-button";

export const metadata: Metadata = { title: "My Courses" };

export default async function StudentCoursesPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const [{ courses }, practice] = await Promise.all([
    repos.student.getCourses(user.mksmNo),
    repos.student.getPracticeMaterial(user.mksmNo),
  ]);

  const coursesTab = (
    <div className="space-y-4">
      {courses.map((c) => (
        <Card key={c.courseId}>
          <CardContent className="pt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-ink-900">{c.courseName}</h3>
                  <Badge tone="neutral">{c.level}</Badge>
                  <Badge tone="brand">Pitch {c.pitch}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.batchName} · {c.teacherName}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarBlank size={14} /> {c.day}, {c.time}
                  {c.nextClassAt ? ` · next ${formatDate(c.nextClassAt)}` : ""}
                </p>

                <div className="mt-3 grid max-w-md gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium text-ink-500">Course progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={c.progress} label={`${c.courseName} progress`} />
                      <span className="text-xs font-medium text-ink-500">
                        {toPercent(c.progress)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-ink-500">Attendance</p>
                    <div className="flex items-center gap-2">
                      <Progress value={c.attendancePct} tone="saffron" label="Attendance" />
                      <span className="text-xs font-medium text-ink-500">
                        {toPercent(c.attendancePct)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                {c.isClassDay ? (
                  <ButtonLink
                    href={c.zoomLink}
                    size="sm"
                    title="Opens Zoom and marks attendance Present (Online)"
                  >
                    <VideoCamera size={16} weight="fill" /> Join now
                  </ButtonLink>
                ) : (
                  <Button size="sm" variant="outline">
                    Continue
                  </Button>
                )}
                <ButtonLink href="/student/homework" size="sm" variant="secondary">
                  <ClipboardText size={16} /> Homework
                </ButtonLink>
                <RequestRecordingButton requestedOn={c.recordingRequestedOn} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="My Courses"
        description="Your enrolled courses, progress, attendance and quick actions."
        actions={
          <Link
            href="/student/explore"
            className="inline-flex items-center text-sm font-medium text-brand-700 hover:underline"
          >
            Explore other courses
          </Link>
        }
      />

      <Tabs
        ariaLabel="Courses and practice material"
        tabs={[
          { id: "courses", label: "Your Courses", content: coursesTab },
          {
            id: "practice",
            label: "Practice Material",
            content: <PracticeMaterialList items={practice.adminShared} />,
          },
        ]}
      />
    </>
  );
}
