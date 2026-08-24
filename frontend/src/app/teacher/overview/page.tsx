import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardText,
  Notebook,
  UsersThree,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatDate, formatHours, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { AnnouncementsPanel } from "@/components/domain/announcements-panel";

export const metadata: Metadata = { title: "Overview" };

function firstName(name: string) {
  return name.split(" ")[0];
}

export default async function TeacherOverviewPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const data = await repos.teacher.getOverview(user.mksmNo);
  const sankalpPct = data.sankalpAchievedHours / data.sankalpTargetHours;

  const hw = data.homework;

  return (
    <>
      <PageHeader
        title={`Namaste, ${firstName(data.teacher.name)}`}
        description="Your batches, homework queue and class reminders."
      />

      {/* Pending class-log reminder (PRD §8.12) */}
      {data.pendingClassLog ? (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-warning-200 bg-warning-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Notebook size={20} weight="fill" className="mt-0.5 shrink-0 text-warning-500" />
            <div>
              <p className="font-medium text-ink-900">Class log pending</p>
              <p className="text-sm text-ink-700">
                Your {data.pendingClassLog.batchName} class on{" "}
                {formatDate(data.pendingClassLog.classDate)} has no log yet.
              </p>
            </div>
          </div>
          <ButtonLink href="/teacher/class-log" size="sm" className="shrink-0">
            Submit class log
          </ButtonLink>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="My batches" value={String(data.batchCount)} />
        <Stat label="Students" value={String(data.studentCount)} />
        <Stat
          label="Reviews pending"
          value={String(hw.reviewPending)}
          tone="neutral"
          hint="Homework awaiting your feedback"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Homework management */}
          <Card>
            <CardHeader>
              <CardTitle>Homework management</CardTitle>
              <Link
                href="/teacher/homework"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                Review homework <ArrowRight size={15} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <HwStat label="Submitted" value={hw.submitted} tone="info" />
                <HwStat label="Reviewed" value={hw.reviewed} tone="success" />
                <HwStat label="Review Pending" value={hw.reviewPending} tone="warning" />
                <HwStat label="Homework Pending" value={hw.homeworkPending} tone="neutral" />
              </div>
            </CardContent>
          </Card>

          {/* Class management */}
          <Card>
            <CardHeader>
              <CardTitle>Class management</CardTitle>
              <Link
                href="/teacher/batches"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                My batches <ArrowRight size={15} />
              </Link>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <ButtonLink href="/teacher/batches" variant="outline" size="sm">
                <UsersThree size={16} /> View batches
              </ButtonLink>
              <ButtonLink href="/teacher/attendance" variant="outline" size="sm">
                <ClipboardText size={16} /> Attendance
              </ButtonLink>
              <ButtonLink href="/teacher/class-log" variant="outline" size="sm">
                <Notebook size={16} /> Class log
              </ButtonLink>
            </CardContent>
          </Card>

          {/* DEA alerts — own batches only (PRD §8.3) */}
          <Card>
            <CardHeader>
              <CardTitle>De-Enrollment alerts</CardTitle>
              <span className="text-sm text-muted-foreground">Your batches only</span>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.deaAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Warning size={18} weight="fill" className="text-danger-500" />
                    <span className="text-sm text-ink-800">
                      <Badge tone="danger">{a.code}</Badge>{" "}
                      <span className="font-medium">{a.studentName}</span> · {a.batchName}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                href="/teacher/batches"
                className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-brand-700 hover:underline"
              >
                View de-enrollment list <ArrowRight size={15} />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sankalp — your batches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-ink-900">
                {formatHours(data.sankalpAchievedHours)}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {formatHours(data.sankalpTargetHours)} hrs
                </span>
              </p>
              <Progress value={sankalpPct} tone="saffron" className="mt-3" label="Sankalp progress" />
              <p className="mt-2 text-sm text-muted-foreground">
                {toPercent(sankalpPct)}% of your batches&apos; target achieved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementsPanel announcements={data.announcements} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function HwStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "warning" | "neutral";
}) {
  const color = {
    info: "text-info-500",
    success: "text-success-500",
    warning: "text-warning-500",
    neutral: "text-ink-700",
  }[tone];
  return (
    <div className="rounded-md border border-border p-3 text-center">
      <p className={`font-display text-2xl ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
