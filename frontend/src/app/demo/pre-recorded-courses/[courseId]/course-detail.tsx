"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CaretDown,
  Certificate,
  CheckCircle,
  ClipboardText,
  Clock,
  DownloadSimple,
  Exam,
  GraduationCap,
  PencilSimpleLine,
  Play,
  PlayCircle,
  SpeakerHigh,
  Star,
  UploadSimple,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  countType,
  levelTone,
  lessonCount,
  THUMBS,
  type Course,
  type Item,
  type ItemType,
  type Module,
} from "../courses-data";

const TYPE_META: Record<
  ItemType,
  { Icon: typeof PlayCircle; label: string; className: string }
> = {
  video: { Icon: PlayCircle, label: "Video", className: "text-brand-600" },
  reading: { Icon: BookOpen, label: "Reading", className: "text-ink-500" },
  quiz: { Icon: Exam, label: "Pop quiz", className: "text-saffron-700" },
  exercise: { Icon: PencilSimpleLine, label: "Practice", className: "text-brand-600" },
  assignment: { Icon: ClipboardText, label: "Assignment", className: "text-saffron-700" },
};

function metaTail(item: Item) {
  return item.meta.split("· ")[1] ?? item.meta;
}

/* --------------------------- Curriculum ---------------------------- */
function ModuleBlock({
  module,
  index,
  open,
  onToggle,
  onOpenItem,
}: {
  module: Module;
  index: number;
  open: boolean;
  onToggle: () => void;
  onOpenItem: (item: Item, thumb: number) => void;
}) {
  const doneCount = module.items.filter((i) => i.done).length;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 bg-ink-50/60 px-4 py-3 text-left transition hover:bg-ink-100/60"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-900">{module.title}</p>
          <p className="text-xs text-muted-foreground">
            {module.items.length} lessons · {doneCount}/{module.items.length} done
          </p>
        </div>
        <CaretDown
          size={18}
          className={"shrink-0 text-ink-500 transition-transform " + (open ? "rotate-180" : "")}
        />
      </button>
      {open ? (
        <ul className="divide-y divide-border">
          {module.items.map((item, i) => {
            const { Icon, label, className } = TYPE_META[item.type];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(item, index * 3 + i)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-50/50"
                >
                  <Icon
                    size={20}
                    weight={item.type === "video" ? "fill" : "regular"}
                    className={"shrink-0 " + className}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {label} · {metaTail(item)}
                    </p>
                  </div>
                  {item.done ? (
                    <CheckCircle size={18} weight="fill" className="shrink-0 text-saffron-700" />
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-brand-700">Open</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/* ----------------------------- Lesson modal ----------------------------- */
function LessonModal({
  item,
  thumb,
  onClose,
}: {
  item: Item | null;
  thumb: number;
  onClose: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  // Reset the quiz run whenever a new lesson opens.
  useEffect(() => {
    const n = item?.quiz?.length ?? 0;
    setQIndex(0);
    setAnswers(Array(n).fill(null));
    setRevealed(Array(n).fill(false));
    setFinished(false);
  }, [item]);

  useEffect(() => {
    if (!item) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;
  const { label } = TYPE_META[item.type];
  const quiz = item.quiz;

  function pick(oi: number) {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? oi : a)));
  }
  function reveal() {
    setRevealed((prev) => prev.map((r, i) => (i === qIndex ? true : r)));
  }
  function restartQuiz() {
    const n = quiz?.length ?? 0;
    setQIndex(0);
    setAnswers(Array(n).fill(null));
    setRevealed(Array(n).fill(false));
    setFinished(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <X size={18} />
        </button>

        {item.type === "video" ? (
          <div className="relative w-full shrink-0" style={{ background: THUMBS[thumb % THUMBS.length] }}>
            <div className="aspect-video" />
            <div className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(90deg,transparent_0,transparent_15px,rgba(255,253,247,0.5)_15px,rgba(255,253,247,0.5)_16px)]" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-20 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:scale-105">
                <Play size={36} weight="fill" />
              </span>
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-white">
              <Play size={18} weight="fill" />
              <div className="h-1.5 flex-1 rounded-full bg-white/30">
                <div className="h-full w-2/5 rounded-full bg-white" />
              </div>
              <SpeakerHigh size={18} />
              <span className="text-xs tabular-nums">{item.duration}</span>
            </div>
          </div>
        ) : null}

        <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <Badge tone={item.type === "quiz" || item.type === "assignment" ? "warning" : "brand"}>
              {label}
            </Badge>
            <span className="text-sm text-muted-foreground">{metaTail(item)}</span>
          </div>
          <h2 className="mt-2 font-display text-xl text-ink-900">{item.title}</h2>

          {item.body ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700">{item.body}</p>
          ) : null}

          {item.type === "quiz" && quiz ? (
            finished ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quiz complete
                </p>
                <p className="font-display text-2xl text-ink-900">
                  You scored {answers.filter((a, i) => a === quiz[i].answer).length} / {quiz.length}
                </p>
                <Button size="sm" variant="outline" onClick={restartQuiz}>
                  Retry quiz
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Question {qIndex + 1} of {quiz.length}
                  </span>
                  <div className="flex gap-1">
                    {quiz.map((_, i) => (
                      <span
                        key={i}
                        className={
                          "h-1.5 w-6 rounded-full " +
                          (i === qIndex ? "bg-brand-600" : revealed[i] ? "bg-brand-300" : "bg-ink-200")
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm font-medium text-ink-900">{quiz[qIndex].question}</p>

                {quiz[qIndex].options.map((opt, oi) => {
                  const isAnswer = oi === quiz[qIndex].answer;
                  const isPicked = oi === answers[qIndex];
                  const rev = revealed[qIndex];
                  const state = !rev
                    ? isPicked
                      ? "border-brand-400 bg-brand-50"
                      : "border-border hover:bg-ink-50"
                    : isAnswer
                      ? "border-saffron-300 bg-saffron-100"
                      : isPicked
                        ? "border-danger-500 bg-danger-100"
                        : "border-border";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={rev}
                      onClick={() => pick(oi)}
                      className={"flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition " + state}
                    >
                      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[10px] font-semibold text-ink-500">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1 text-ink-800">{opt}</span>
                      {rev && isAnswer ? (
                        <CheckCircle size={16} weight="fill" className="text-saffron-700" />
                      ) : null}
                    </button>
                  );
                })}

                <div className="flex items-center justify-between pt-1">
                  <div>
                    {qIndex > 0 ? (
                      <Button size="sm" variant="ghost" onClick={() => setQIndex((i) => i - 1)}>
                        Previous
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    {revealed[qIndex] ? (
                      <span className="text-sm font-medium text-ink-700">
                        {answers[qIndex] === quiz[qIndex].answer ? "Correct" : "Incorrect"}
                      </span>
                    ) : null}
                    {!revealed[qIndex] ? (
                      <Button size="sm" disabled={answers[qIndex] == null} onClick={reveal}>
                        Check answer
                      </Button>
                    ) : qIndex < quiz.length - 1 ? (
                      <Button size="sm" onClick={() => setQIndex((i) => i + 1)}>
                        Next question
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setFinished(true)}>
                        See score
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : null}

          {item.type === "assignment" ? (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-ink-800">Your recording</label>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-ink-50/50 px-4 py-6 text-sm text-muted-foreground">
                <UploadSimple size={18} /> Drag an audio file here, or click to browse
              </div>
              <label className="block text-sm font-medium text-ink-800">
                Notes for your guru (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Anything you struggled with…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {item.type === "video" ? (
              <>
                <Button size="sm">
                  <Play size={15} weight="fill" /> {item.done ? "Watch again" : "Play"}
                </Button>
                <Button size="sm" variant="outline">
                  <DownloadSimple size={15} /> Practice sheet
                </Button>
              </>
            ) : item.type === "reading" ? (
              <Button size="sm">Mark as read</Button>
            ) : item.type === "exercise" ? (
              <Button size="sm">Mark practised</Button>
            ) : item.type === "assignment" ? (
              <Button size="sm">Submit for review</Button>
            ) : null}
            <Button size="sm" variant="ghost">
              <Star size={15} /> Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Detail ------------------------------- */
export function CourseDetail({ course }: { course: Course }) {
  const [openModule, setOpenModule] = useState(course.modules[0]?.id ?? "");
  const [viewing, setViewing] = useState<{ item: Item; thumb: number } | null>(null);

  const includes: { Icon: typeof VideoCamera; label: string }[] = [
    { Icon: VideoCamera, label: `${countType(course, "video")} on-demand videos` },
    { Icon: BookOpen, label: `${countType(course, "reading")} reading notes` },
    { Icon: PencilSimpleLine, label: `${countType(course, "exercise")} practice exercises` },
    { Icon: Exam, label: `${countType(course, "quiz")} pop quizzes` },
    { Icon: ClipboardText, label: `${countType(course, "assignment")} graded assignment` },
    { Icon: DownloadSimple, label: "Downloadable practice sheets" },
    { Icon: Certificate, label: "Certificate on completion" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Badge tone={levelTone(course.level)}>{course.level}</Badge>
            <span className="text-sm text-muted-foreground">{course.tag}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl leading-tight text-ink-900">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">{course.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={16} /> {course.teacher}
            </span>
            <span className="inline-flex items-center gap-1">
              <VideoCamera size={16} /> {lessonCount(course)} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={16} /> {course.hours}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={course.progress} className="flex-1" label={`${course.title} progress`} />
            <span className="shrink-0 text-sm font-semibold text-ink-600">
              {Math.round(course.progress * 100)}% complete
            </span>
          </div>
          <div className="mt-4">
            <Button>
              <Play size={16} weight="fill" />{" "}
              {course.progress > 0 ? "Continue course" : "Start course"}
            </Button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg text-ink-900">Course content</h2>
          <div className="space-y-3">
            {course.modules.map((m, i) => (
              <ModuleBlock
                key={m.id}
                module={m}
                index={i}
                open={openModule === m.id}
                onToggle={() => setOpenModule((cur) => (cur === m.id ? "" : m.id))}
                onOpenItem={(item, thumb) => setViewing({ item, thumb })}
              />
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink-900">This course includes</h3>
          <ul className="space-y-2.5">
            {includes.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink-700">
                <Icon size={18} className="shrink-0 text-brand-600" /> {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Your guru</h3>
          <div className="flex items-center gap-3">
            <Avatar name={course.teacher} className="size-11" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{course.teacher}</p>
              <p className="truncate text-xs text-muted-foreground">Mahesh Kale School of Music</p>
            </div>
          </div>
        </div>
      </aside>

      <LessonModal
        item={viewing?.item ?? null}
        thumb={viewing?.thumb ?? 0}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
