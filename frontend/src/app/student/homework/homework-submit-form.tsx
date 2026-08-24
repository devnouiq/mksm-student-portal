"use client";

import { useMemo, useState } from "react";
import { CheckCircle, UploadSimple, Warning } from "@phosphor-icons/react";
import type { ClassDateOption } from "@/data/types";
import { isLateSubmission } from "@/domain/homework";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/*
  Weekly homework tied to the class schedule (PRD §8.7): the student picks a
  class date, must submit ≥ `cutoffDays` before it — later is accepted but
  tagged "Late Submission". Prototype: submit is captured locally.
*/
export function HomeworkSubmitForm({
  classDates,
  cutoffDays,
}: {
  classDates: ClassDateOption[];
  cutoffDays: number;
}) {
  const [classDate, setClassDate] = useState(classDates[0]?.value ?? "");
  const [submitted, setSubmitted] = useState(false);

  const willBeLate = useMemo(
    () => isLateSubmission(classDate, cutoffDays),
    [classDate, cutoffDays],
  );

  if (submitted) {
    return (
      <div className="rounded-md border border-success-200 bg-success-100 p-4">
        <p className="flex items-center gap-2 font-medium text-success-500">
          <CheckCircle size={18} weight="fill" /> Homework submitted
        </p>
        <p className="mt-1 text-sm text-ink-700">
          Submitted for the class on {formatDate(classDate)}
          {willBeLate ? " and tagged as a Late Submission." : "."} Your teacher
          will review it and share feedback.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setSubmitted(false)}
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field label="Class date" htmlFor="hw-class-date" hint="Homework is tied to a specific class.">
        <Select
          id="hw-class-date"
          value={classDate}
          onChange={(e) => setClassDate(e.target.value)}
        >
          {classDates.map((c) => (
            <option key={c.value} value={c.value}>
              {formatDate(c.value)} · {c.batchName}
            </option>
          ))}
        </Select>
      </Field>

      {willBeLate ? (
        <p className="flex items-start gap-2 rounded-md bg-warning-100 px-3 py-2 text-sm text-warning-500">
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
          This class is less than {cutoffDays} days away — your submission will be
          accepted but tagged <strong>Late Submission</strong>.
        </p>
      ) : null}

      <Field label="Title" htmlFor="hw-title">
        <Input id="hw-title" name="title" placeholder="e.g. Raag Yaman — aaroh/avaroh" required />
      </Field>

      <Field label="Description" htmlFor="hw-desc">
        <Textarea id="hw-desc" name="description" placeholder="What did you practise and record?" />
      </Field>

      <Field label="Recording / file" htmlFor="hw-file" hint="Audio, video or PDF up to 50 MB.">
        <label
          htmlFor="hw-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink-300 bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground hover:border-brand-400"
        >
          <UploadSimple size={22} className="text-ink-400" />
          <span>
            <span className="font-medium text-brand-700">Choose a file</span> or drag it here
          </span>
          <input id="hw-file" name="file" type="file" className="sr-only" />
        </label>
      </Field>

      <Button type="submit" className="w-full">
        Submit homework
      </Button>
    </form>
  );
}
