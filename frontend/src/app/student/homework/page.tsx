import type { Metadata } from "next";
import { ClipboardText, SpeakerHigh } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IconTile,
} from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { HomeworkStatusBadge } from "@/components/domain/homework-status-badge";
import { HomeworkSubmitForm } from "./homework-submit-form";

export const metadata: Metadata = { title: "Submit Homework" };

export default async function StudentHomeworkPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const { classDates, cutoffDays, submissions } = await repos.student.getHomework(user.mksmNo);

  const submitTab = (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardText size={18} weight="duotone" className="text-brand-600" />
            New submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HomeworkSubmitForm classDates={classDates} cutoffDays={cutoffDays} />
        </CardContent>
      </Card>
    </div>
  );

  const feedbackTab = (
    <div className="space-y-4">
      {submissions.map((s) => (
        <Card key={s.id} interactive>
          <CardContent className="pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <IconTile icon={ClipboardText} className="mt-0.5 size-10" size={20} />
                <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-ink-900">{s.title}</h3>
                  <HomeworkStatusBadge status={s.status} />
                  {s.late ? <Badge tone="warning">Late Submission</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.courseName} · {s.batchName}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">
                  Class {formatDate(s.classDate)} · submitted {formatDate(s.submittedAt)}
                </p>
                </div>
              </div>
            </div>

            {s.feedbackText ? (
              <div className="mt-3 rounded-md bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Teacher feedback
                </p>
                <p className="mt-1 text-sm text-ink-700">{s.feedbackText}</p>
                {s.feedbackAudioUrl ? (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
                  >
                    <SpeakerHigh size={16} /> Play audio feedback
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Awaiting your teacher&apos;s feedback.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Submit Homework"
        description={`Weekly homework tied to your class schedule. Submit at least ${cutoffDays} days before the class to avoid a late tag.`}
      />

      <Tabs
        ariaLabel="Homework"
        tabs={[
          { id: "submit", label: "Submit Homework", content: submitTab },
          { id: "feedback", label: "Check Feedback", content: feedbackTab },
        ]}
      />
    </>
  );
}
