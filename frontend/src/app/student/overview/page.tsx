import type { Metadata } from "next";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  CalendarCheck,
  CheckCircle,
  GraduationCap,
  MicrophoneStage,
  MusicNoteSimple,
  MusicNotes,
  PianoKeys,
  Timer,
  UserSound,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { displayProgress } from "@/domain/course";
import { formatDate, formatHours, formatNumber, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/domain/subscription-badge";
import { AlertMarquee } from "@/components/domain/alert-marquee";
import { MessageFromMk } from "@/components/domain/message-from-mk";

export const metadata: Metadata = { title: "Overview" };

function firstName(name: string) {
  return name.split(" ")[0];
}

/* Give each course a face: pick an instrument/voice icon from its name so the
   list reads as music, not as generic rows. Falls back to a plain note. */
const COURSE_ICONS: { match: RegExp; icon: Icon }[] = [
  { match: /vocal|classical|khayal|raga|voice/i, icon: MicrophoneStage },
  { match: /bhajan|light|devotional|abhang|semi/i, icon: MusicNotes },
  { match: /harmonium|keyboard|piano|sur/i, icon: PianoKeys },
];
function courseIcon(name: string): Icon {
  return COURSE_ICONS.find((c) => c.match.test(name))?.icon ?? MusicNoteSimple;
}

export default async function StudentOverviewPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const data = await repos.student.getOverview(user.mksmNo);

  const schoolPct = data.sankalp.schoolAchievedHours / data.sankalp.schoolTargetHours;
  const hoursToMilestone = Math.max(
    0,
    Math.ceil(data.sankalp.nextMilestoneHours - data.sankalp.personalHours),
  );

  return (
    <>
      <AlertMarquee alerts={data.alerts} />

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
          icon={Timer}
        />
        <StatTile
          label="Active courses"
          value={String(data.courses.length)}
          icon={GraduationCap}
        />
        <StatTile
          label="Renews in"
          value={
            data.subscription.daysToRenew == null
              ? "—"
              : String(data.subscription.daysToRenew)
          }
          suffix={data.subscription.daysToRenew == null ? "" : "days"}
          icon={CalendarCheck}
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
              {data.courses.map((course) => {
                const progress = displayProgress(course);
                const pct = toPercent(progress);
                const done = pct >= 100;
                const Icon = courseIcon(course.courseName);
                return (
                <div
                  key={course.courseId}
                  className="group flex flex-col gap-4 rounded-lg border border-border p-4 transition hover:border-brand-300 hover:shadow-card sm:flex-row sm:items-center"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition group-hover:bg-brand-100"
                    aria-hidden
                  >
                    <Icon size={22} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-900">{course.courseName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {course.batchName} · {course.teacherName}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress
                        value={progress}
                        tone={done ? "saffron" : "brand"}
                        className="max-w-44 flex-1"
                        label={`${course.courseName} progress`}
                      />
                      <span
                        className={
                          "inline-flex shrink-0 items-center gap-1 text-xs font-semibold " +
                          (done ? "text-saffron-700" : "text-ink-500")
                        }
                      >
                        {done ? <CheckCircle size={13} weight="fill" /> : null}
                        {pct}%
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
                );
              })}
            </CardContent>
          </Card>

          {/* Message from MK — video/audio/text from Mahesh Kale Sir */}
          {data.mkMessage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserSound size={18} weight="duotone" className="text-brand-600" />
                  Message from MK
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MessageFromMk message={data.mkMessage} />
              </CardContent>
            </Card>
          ) : null}

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
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-saffron-100 p-3">
                  <p className="text-xs text-ink-500">This week</p>
                  <p className="font-semibold text-saffron-700">
                    {formatHours(data.sankalp.weeklyHours)} hrs
                  </p>
                </div>
                <div className="rounded-md bg-saffron-100 p-3">
                  <p className="text-xs text-ink-500">Your total</p>
                  <p className="font-semibold text-saffron-700">
                    {formatHours(data.sankalp.personalHours)} hrs
                  </p>
                </div>
              </div>
              {hoursToMilestone > 0 ? (
                <p className="mt-3 rounded-md bg-brand-50 p-3 text-sm text-brand-800">
                  {formatHours(hoursToMilestone)} hours away from reaching your{" "}
                  {formatHours(data.sankalp.nextMilestoneHours)} hour goal.
                </p>
              ) : null}
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
              <ButtonLink
                href="/student/announcements"
                variant="outline"
                size="sm"
                className="w-full"
              >
                Open Announcements
              </ButtonLink>
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
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "brand" | "saffron";
  icon?: Icon;
}) {
  const saffron = tone === "saffron";
  return (
    <Card className="transition hover:shadow-pop">
      <CardContent className="flex items-start justify-between gap-3 pt-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl text-ink-900">
            {value}
            {suffix ? (
              <span
                className={
                  "ml-1 text-base " +
                  (saffron ? "text-saffron-700" : "text-brand-600")
                }
              >
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
        {Icon ? (
          <span
            className={
              "grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset " +
              (saffron
                ? "bg-saffron-100 text-saffron-700 ring-saffron-300/40"
                : "bg-brand-50 text-brand-600 ring-brand-100")
            }
            aria-hidden
          >
            <Icon size={20} weight="duotone" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
