import type { Metadata } from "next";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  GraduationCap,
  Megaphone,
  MusicNoteSimple,
  MusicNotes,
  Target,
  Timer,
  UserSound,
  VideoCamera,
  Waveform,
} from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { displayProgress } from "@/domain/course";
import { formatHours, formatNumber, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button, ButtonLink } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/domain/subscription-badge";
import { courseIcon } from "@/components/domain/course-icon";
import { AlertMarquee } from "@/components/domain/alert-marquee";
import { AnnouncementsPanel } from "@/components/domain/announcements-panel";
import { MessageFromMk } from "@/components/domain/message-from-mk";

export const metadata: Metadata = { title: "Overview" };

function firstName(name: string) {
  return name.split(" ")[0];
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
          art="hours"
        />
        <StatTile
          label="Active courses"
          value={String(data.courses.length)}
          icon={GraduationCap}
          art="courses"
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
          art="renewal"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MusicNotes size={18} weight="duotone" className="text-brand-600" />
                Your courses
              </CardTitle>
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
                  className={
                    "group relative flex flex-col gap-4 overflow-hidden rounded-lg border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card sm:flex-row sm:items-center " +
                    (done
                      ? "border-saffron-300/60 bg-saffron-100/30"
                      : "border-border")
                  }
                >
                  {/* the sur line down the left edge, drawn on hover — the same
                      gesture the stat tiles use along their bottom */}
                  <span
                    className={
                      "absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100 " +
                      (done
                        ? "bg-gradient-to-b from-saffron-500 to-saffron-700"
                        : "bg-gradient-to-b from-brand-400 to-brand-600")
                    }
                    aria-hidden
                  />
                  <span
                    className={
                      "grid size-11 shrink-0 place-items-center rounded-lg ring-1 ring-inset transition duration-200 group-hover:-rotate-6 group-hover:scale-105 " +
                      (done
                        ? "bg-saffron-100 text-saffron-700 ring-saffron-300/50"
                        : "bg-brand-50 text-brand-600 ring-brand-100 group-hover:bg-brand-100")
                    }
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
                          "inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums " +
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
              <CardTitle className="flex items-center gap-2">
                <Waveform size={18} weight="duotone" className="text-brand-600" />
                Voices of MKSM
              </CardTitle>
              <CardMeta>{data.voices.month}</CardMeta>
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
              <CardTitle className="flex items-center gap-2">
                <Target size={18} weight="duotone" className="text-saffron-700" />
                Sankalp — school goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl tabular-nums text-ink-900">
                {formatNumber(data.sankalp.schoolAchievedHours)}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {formatNumber(data.sankalp.schoolTargetHours)} hrs
                </span>
              </p>
              <div className="relative mt-3">
                <Progress
                  value={schoolPct}
                  tone="saffron"
                  label="School Sankalp progress"
                />
                {/* quarter marks, sitting on the bar like frets on a dandi */}
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-between px-[25%]"
                  aria-hidden
                >
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-px bg-surface/70" />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {toPercent(schoolPct)}% of the school-wide pledge achieved.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="group/tile rounded-md bg-saffron-100 p-3 ring-1 ring-inset ring-saffron-300/40 transition duration-200 hover:-translate-y-0.5 hover:bg-saffron-300/45 hover:ring-saffron-300/80">
                  <p className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Timer size={13} weight="duotone" className="text-saffron-700" />
                    This week
                  </p>
                  <p className="font-semibold tabular-nums text-saffron-700">
                    {formatHours(data.sankalp.weeklyHours)} hrs
                  </p>
                </div>
                <div className="group/tile rounded-md bg-saffron-100 p-3 ring-1 ring-inset ring-saffron-300/40 transition duration-200 hover:-translate-y-0.5 hover:bg-saffron-300/45 hover:ring-saffron-300/80">
                  <p className="flex items-center gap-1.5 text-xs text-ink-500">
                    <MusicNotes size={13} weight="duotone" className="text-saffron-700" />
                    Your total
                  </p>
                  <p className="font-semibold tabular-nums text-saffron-700">
                    {formatHours(data.sankalp.personalHours)} hrs
                  </p>
                </div>
              </div>
              {hoursToMilestone > 0 ? (
                <p className="mt-3 flex items-start gap-2 rounded-md bg-brand-50 p-3 text-sm text-brand-800 ring-1 ring-inset ring-brand-100">
                  <MusicNoteSimple
                    size={15}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-brand-500"
                  />
                  <span>
                    {formatHours(hoursToMilestone)} hours away from reaching your{" "}
                    {formatHours(data.sankalp.nextMilestoneHours)} hour goal.
                  </span>
                </p>
              ) : null}
              <Button variant="outline" size="sm" className="mt-3 w-full">
                <Timer size={15} weight="duotone" /> Log hours
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone size={18} weight="duotone" className="text-brand-600" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnnouncementsPanel announcements={data.announcements} />
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

/**
 * The blended line-art each tile carries behind its numbers — a practice dial
 * for hours, an open book of sargam for courses, a renewing month for the
 * subscription. Same placement, weight and colour on all three so only the
 * subject changes.
 */
function TileArt({ art }: { art: "hours" | "courses" | "renewal" }) {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 text-brand-500/[0.13] transition duration-300 group-hover:text-brand-600/[0.2]"
      viewBox="0 0 180 110"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {art === "hours" ? (
        /* A practice dial: rings, hour ticks and a hand at the quarter. */
        <g transform="translate(126 56)">
          <circle r="46" />
          <circle r="34" strokeWidth={1} opacity="0.7" />
          <path d="M-4 -52 h8" strokeWidth={2.6} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            const [sx, sy] = [Math.sin(a) * 46, -Math.cos(a) * 46];
            const [ex, ey] = [Math.sin(a) * 39, -Math.cos(a) * 39];
            return (
              <path
                key={i}
                d={`M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`}
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
          <path d="M0 0 L0 -30" strokeWidth={2} />
          <path d="M0 0 L22 12" strokeWidth={1.6} />
          <circle r="3" />
        </g>
      ) : null}

      {art === "courses" ? (
        /* An open book with sargam running across both leaves. */
        <g transform="translate(96 22)">
          <path d="M4 62 C 24 46, 50 44, 68 54 C 86 44, 112 46, 132 62" />
          <path d="M4 62 L4 20 C 24 4, 50 2, 68 12 C 86 2, 112 4, 132 20 L132 62" />
          <path d="M68 12 L68 54" strokeWidth={1.6} />
          <g strokeWidth={0.9} opacity="0.75">
            <path d="M16 24 C 32 14, 52 13, 60 20" />
            <path d="M16 32 C 32 22, 52 21, 60 28" />
            <path d="M16 40 C 32 30, 52 29, 60 36" />
            <path d="M76 20 C 86 13, 104 14, 120 24" />
            <path d="M76 28 C 86 21, 104 22, 120 32" />
            <path d="M76 36 C 86 29, 104 30, 120 40" />
          </g>
          <g strokeWidth={1.2}>
            <ellipse cx="34" cy="35" rx="4" ry="3" transform="rotate(-20 34 35)" />
            <path d="M38 34 L38 20" />
            <ellipse cx="98" cy="37" rx="4" ry="3" transform="rotate(-20 98 37)" />
            <path d="M102 36 L102 22" />
            <path d="M102 22 C 109 24 111 30 107 34" />
          </g>
        </g>
      ) : null}

      {art === "renewal" ? (
        /* A month sheet with the renewal loop closing around it. */
        <g transform="translate(104 20)">
          <rect x="10" y="10" width="86" height="72" rx="7" />
          <path d="M10 30 H96" />
          <path d="M28 10 V2" strokeWidth={2} />
          <path d="M78 10 V2" strokeWidth={2} />
          <g strokeWidth={1} opacity="0.7">
            <path d="M26 42 h9 M46 42 h9 M66 42 h9" />
            <path d="M26 56 h9 M66 56 h9" />
            <path d="M26 70 h9 M46 70 h9" />
          </g>
          <path d="M43 56 l7 7 l13 -15" strokeWidth={1.8} />
          <path
            d="M4 46 C 4 18, 30 -2, 58 4"
            strokeWidth={1.2}
            opacity="0.8"
            strokeDasharray="5 6"
          />
          <path d="M52 -2 L60 4 L53 10" strokeWidth={1.2} opacity="0.8" />
        </g>
      ) : null}
    </svg>
  );
}

function StatTile({
  label,
  value,
  suffix,
  tone = "brand",
  icon: Icon,
  art,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "brand" | "saffron";
  icon?: Icon;
  art?: "hours" | "courses" | "renewal";
}) {
  const saffron = tone === "saffron";
  return (
    <Card className="group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-pop">
      {art ? <TileArt art={art} /> : null}
      {/* the wash only arrives on hover, so the resting state stays quiet.
          It is the same wash on every tile — hover is a shared behaviour, the
          tone only colours the resting accent. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-brand-50/80 opacity-0 transition duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <CardContent className="relative flex items-start justify-between gap-3 pt-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl tabular-nums text-ink-900">
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
              // The lift is identical on every tile; brightness deepens each
              // badge within its own tone instead of branching on colour.
              "grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition duration-200 group-hover:-rotate-6 group-hover:scale-110 group-hover:brightness-95"
            }
            aria-hidden
          >
            <Icon size={20} weight="duotone" />
          </span>
        ) : null}
      </CardContent>
      {/* the sur line under the tile, drawn left to right on hover — same
          line on all three tiles */}
      <span
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden
      />
    </Card>
  );
}
