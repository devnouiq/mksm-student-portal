import type { Metadata } from "next";
import {
  CheckCircle,
  DownloadSimple,
  FilmSlate,
  ListChecks,
  Play,
  PlayCircle,
  SpeakerHigh,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Pre-Recorded Courses" };

interface Lesson {
  id: string;
  title: string;
  teacher: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advance";
  tag: string;
  progress: number; // 0..1
  lessons: number;
}

const LESSONS: Lesson[] = [
  { id: "l1", title: "Raag Yaman — Aaroh, Avroh & Pakad", teacher: "Guru Deshpande", duration: "18:24", level: "Intermediate", tag: "Khayal", progress: 0.6, lessons: 8 },
  { id: "l2", title: "Alankaar Practice — Pitch C#", teacher: "Anjali Rao", duration: "12:05", level: "Beginner", tag: "Alankaar", progress: 1, lessons: 6 },
  { id: "l3", title: "Bhajan: Vaishnav Jan To", teacher: "Kedar Joshi", duration: "09:47", level: "Beginner", tag: "Bhajan", progress: 0, lessons: 4 },
  { id: "l4", title: "Taan Patterns — Drut Laya", teacher: "Guru Deshpande", duration: "15:32", level: "Advance", tag: "Khayal", progress: 0.25, lessons: 10 },
  { id: "l5", title: "Sur & Shruti — Foundations", teacher: "Anjali Rao", duration: "22:10", level: "Beginner", tag: "Theory", progress: 0.4, lessons: 5 },
  { id: "l6", title: "Raag Bhairav — Vistaar", teacher: "Guru Deshpande", duration: "27:56", level: "Advance", tag: "Khayal", progress: 0, lessons: 12 },
];

// Warm, theme-agnostic gradient placeholders (no external images — CSP-safe).
const THUMBS = [
  "linear-gradient(135deg, #3a2a12 0%, #6b4e0f 55%, #b08637 100%)",
  "linear-gradient(135deg, #2c2118 0%, #7a5a1e 60%, #d0a24a 100%)",
  "linear-gradient(135deg, #23180d 0%, #8a5a12 55%, #e0873f 100%)",
  "linear-gradient(135deg, #302011 0%, #664112 60%, #c89545 100%)",
  "linear-gradient(135deg, #241a10 0%, #5f4413 55%, #b98a3c 100%)",
  "linear-gradient(135deg, #2a1d10 0%, #6f4d14 60%, #ca9a4b 100%)",
];

function levelTone(level: Lesson["level"]): "warning" | "brand" | "neutral" {
  return level === "Advance" ? "warning" : level === "Intermediate" ? "brand" : "neutral";
}

function Thumb({ i, tall = false }: { i: number; tall?: boolean }) {
  return (
    <div
      className={
        "relative w-full overflow-hidden rounded-lg " + (tall ? "aspect-video" : "aspect-video")
      }
      style={{ background: THUMBS[i % THUMBS.length] }}
      aria-hidden
    >
      {/* subtle string lines to read as an instrument, not a flat block */}
      <div className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(90deg,transparent_0,transparent_11px,rgba(255,253,247,0.5)_11px,rgba(255,253,247,0.5)_12px)]" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-12 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm ring-1 ring-white/40">
          <Play size={22} weight="fill" />
        </span>
      </span>
    </div>
  );
}

/* ---------------- Variant A — cinematic card grid ---------------- */
function VariantGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {LESSONS.map((l, i) => {
        const done = l.progress >= 1;
        const started = l.progress > 0 && l.progress < 1;
        return (
          <Card key={l.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
            <div className="relative">
              <Thumb i={i} />
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                {l.duration}
              </span>
              <span className="absolute left-2 top-2">
                <Badge tone={levelTone(l.level)}>{l.level}</Badge>
              </span>
            </div>
            <CardContent className="pt-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <FilmSlate size={13} /> {l.tag} · {l.lessons} lessons
              </div>
              <p className="font-medium leading-snug text-ink-900">{l.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{l.teacher}</p>
              {started ? (
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={l.progress} tone="brand" className="flex-1" label={`${l.title} progress`} />
                  <span className="shrink-0 text-xs font-semibold text-ink-500">
                    {Math.round(l.progress * 100)}%
                  </span>
                </div>
              ) : done ? (
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron-700">
                  <CheckCircle size={14} weight="fill" /> Completed
                </p>
              ) : (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="w-full">
                    <Play size={15} weight="fill" /> Start course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Variant B — continue-watching rail + list ---------------- */
function VariantRail() {
  const inProgress = LESSONS.filter((l) => l.progress > 0 && l.progress < 1);
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink-900">Continue watching</h3>
          <span className="text-sm text-muted-foreground">{inProgress.length} in progress</span>
        </div>
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {inProgress.map((l, i) => (
            <div key={l.id} className="w-64 shrink-0">
              <div className="relative">
                <Thumb i={i} />
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                  {l.duration}
                </span>
              </div>
              <p className="mt-2 truncate font-medium text-ink-900">{l.title}</p>
              <p className="truncate text-sm text-muted-foreground">{l.teacher}</p>
              <Progress value={l.progress} tone="brand" className="mt-2" label={`${l.title} progress`} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg text-ink-900">All courses</h3>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {LESSONS.map((l, i) => (
            <div key={l.id} className="flex items-center gap-4 p-3 transition hover:bg-brand-50/60">
              <div className="w-28 shrink-0">
                <Thumb i={i} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink-900">{l.title}</p>
                  <Badge tone={levelTone(l.level)}>{l.level}</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {l.teacher} · {l.tag} · {l.lessons} lessons · {l.duration}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                {l.progress >= 1 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-700">
                    <CheckCircle size={14} weight="fill" /> Done
                  </span>
                ) : null}
                <Button size="sm" variant={l.progress > 0 ? "primary" : "outline"}>
                  <Play size={15} weight="fill" /> {l.progress > 0 ? "Resume" : "Start"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Variant C — course player + playlist ---------------- */
function VariantPlayer() {
  const current = LESSONS[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <div>
        <div className="relative overflow-hidden rounded-xl" style={{ background: THUMBS[0] }}>
          <div className="aspect-video" />
          <div className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(90deg,transparent_0,transparent_13px,rgba(255,253,247,0.5)_13px,rgba(255,253,247,0.5)_14px)]" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-black/30 text-white ring-1 ring-white/40 backdrop-blur-sm">
              <Play size={30} weight="fill" />
            </span>
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-white">
            <Play size={16} weight="fill" />
            <div className="h-1 flex-1 rounded-full bg-white/30">
              <div className="h-full w-3/5 rounded-full bg-white" />
            </div>
            <SpeakerHigh size={16} />
            <span className="text-xs tabular-nums">11:04 / {current.duration}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Badge tone={levelTone(current.level)}>{current.level}</Badge>
            <span className="text-sm text-muted-foreground">{current.tag}</span>
          </div>
          <h3 className="mt-2 font-display text-xl text-ink-900">{current.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {current.teacher} · Lesson 3 of {current.lessons}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700">
            Establishing the aaroh and avroh of Raag Yaman, with the pakad phrase and slow
            vistaar. Practise along with the tanpura drone at your assigned pitch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm">
              <Play size={15} weight="fill" /> Resume
            </Button>
            <Button size="sm" variant="outline">
              <DownloadSimple size={15} /> Practice sheet
            </Button>
            <Button size="sm" variant="ghost">
              <Star size={15} /> Save
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-800">
          <ListChecks size={16} className="text-brand-600" /> Course lessons
        </div>
        <ol className="space-y-1">
          {LESSONS.map((l, i) => {
            const active = i === 0;
            const done = l.progress >= 1;
            return (
              <li key={l.id}>
                <div
                  className={
                    "flex items-center gap-3 rounded-lg border p-2.5 transition " +
                    (active
                      ? "border-brand-300 bg-brand-50"
                      : "border-transparent hover:bg-ink-50")
                  }
                >
                  <span
                    className={
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold " +
                      (done
                        ? "bg-saffron-100 text-saffron-700"
                        : active
                          ? "bg-brand-600 text-white"
                          : "bg-ink-100 text-ink-600")
                    }
                  >
                    {done ? <CheckCircle size={16} weight="fill" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={"truncate text-sm " + (active ? "font-semibold text-ink-900" : "text-ink-800")}>
                      {l.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{l.duration}</p>
                  </div>
                  {active ? <PlayCircle size={20} weight="fill" className="shrink-0 text-brand-600" /> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default function PreRecordedCoursesDemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl leading-tight text-ink-900 sm:text-3xl">
          Pre-Recorded Courses
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Learn at your own pace with recorded lessons from your gurus.
        </p>
      </div>

      <Tabs
        ariaLabel="Pre-recorded courses"
        tabs={[
          { id: "grid", label: "Card grid", content: <VariantGrid /> },
          { id: "rail", label: "Continue watching", content: <VariantRail /> },
          { id: "player", label: "Course player", content: <VariantPlayer /> },
        ]}
        className="mt-2"
      />
    </main>
  );
}
