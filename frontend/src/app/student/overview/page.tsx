import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatDate, formatHours, formatNumber, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/domain/subscription-badge";

export const metadata: Metadata = { title: "Overview" };

function firstName(name: string) {
  return name.split(" ")[0];
}

export default async function StudentOverviewPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const data = await repos.student.getOverview(user.mksmNo);

  const schoolPct = data.sankalp.schoolAchievedHours / data.sankalp.schoolTargetHours;

  return (
    <>
      <PageHeader
        title={`Namaste, ${firstName(data.student.name)}`}
        description="Here's your practice, courses and Sankalp at a glance."
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <span className="text-sm text-muted-foreground">Subscription</span>
            <SubscriptionBadge status={data.subscription.status} />
          </div>
        }
      />

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Your Sankalp hours"
          value={formatHours(data.sankalp.personalHours)}
          suffix="hrs"
          tone="saffron"
        />
        <StatTile
          label="Active courses"
          value={String(data.courses.length)}
        />
        <StatTile
          label="Renews in"
          value={
            data.subscription.daysToRenew == null
              ? "—"
              : String(data.subscription.daysToRenew)
          }
          suffix={data.subscription.daysToRenew == null ? "" : "days"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your courses</CardTitle>
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                View all <ArrowRight size={15} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.courses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{course.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.batchName} · {course.teacherName}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress
                        value={course.progress}
                        className="max-w-40"
                        label={`${course.courseName} progress`}
                      />
                      <span className="text-xs font-medium text-ink-500">
                        {toPercent(course.progress)}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {course.isClassDay ? (
                      <ButtonLink
                        href="/student/courses"
                        size="sm"
                        title="On class day, Join Now opens Zoom and marks attendance"
                      >
                        <VideoCamera size={16} weight="fill" /> Join now
                      </ButtonLink>
                    ) : (
                      <ButtonLink href="/student/courses" size="sm" variant="outline">
                        Continue
                      </ButtonLink>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voices of MKSM — admin-swapped monthly embed (PRD §5.1) */}
          <Card>
            <CardHeader>
              <CardTitle>Voices of MKSM</CardTitle>
              <span className="text-sm text-muted-foreground">
                {data.voices.month}
              </span>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-ink-900">
                <iframe
                  src={data.voices.youtubeUrl}
                  title={data.voices.title}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* School-wide Sankalp target vs achieved */}
          <Card>
            <CardHeader>
              <CardTitle>Sankalp — school goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-ink-900">
                {formatNumber(data.sankalp.schoolAchievedHours)}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {formatNumber(data.sankalp.schoolTargetHours)} hrs
                </span>
              </p>
              <Progress
                value={schoolPct}
                tone="saffron"
                className="mt-3"
                label="School Sankalp progress"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {toPercent(schoolPct)}% of the school-wide pledge achieved.
              </p>
              <div className="mt-4 rounded-md bg-saffron-100 p-3">
                <p className="text-sm text-ink-700">
                  Your contribution:{" "}
                  <span className="font-semibold text-saffron-700">
                    {formatHours(data.sankalp.personalHours)} hrs
                  </span>
                </p>
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full">
                Log hours
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <span className="text-sm text-muted-foreground">
                {data.announcements.filter((a) => !a.read).length} unread
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.announcements.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span
                    className={
                      "mt-1.5 size-2 shrink-0 rounded-full " +
                      (a.read ? "bg-ink-200" : "bg-brand-500")
                    }
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-medium text-ink-900">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.body}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                      <CalendarBlank size={12} /> {formatDate(a.postedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatTile({
  label,
  value,
  suffix,
  tone = "brand",
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "brand" | "saffron";
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl text-ink-900">
          {value}
          {suffix ? (
            <span
              className={
                "ml-1 text-base " +
                (tone === "saffron" ? "text-saffron-700" : "text-brand-600")
              }
            >
              {suffix}
            </span>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );
}
