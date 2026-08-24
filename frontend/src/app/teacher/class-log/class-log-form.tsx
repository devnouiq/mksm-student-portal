"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmittedNotice } from "@/components/ui/submitted-notice";

/*
  Class Log submitted after each class (PRD §8.12). Teacher Name is auto-filled
  from the profile and read-only. Prototype captures the submit locally.
*/
export function ClassLogForm({
  teacherName,
  batches,
  ragas,
  defaultBatch,
  defaultDate,
}: {
  teacherName: string;
  batches: string[];
  ragas: string[];
  defaultBatch?: string;
  defaultDate?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SubmittedNotice title="Class log submitted">
        Your log has been recorded and is now visible to the admin.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Log another class
          </Button>
        </div>
      </SubmittedNotice>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Class date" htmlFor="cl-date">
          <Input id="cl-date" name="classDate" type="date" defaultValue={defaultDate} required />
        </Field>
        <Field label="Batch" htmlFor="cl-batch">
          <Select id="cl-batch" name="batch" defaultValue={defaultBatch}>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Raga covered" htmlFor="cl-raga">
        <Select id="cl-raga" name="raga">
          {ragas.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="What was covered" htmlFor="cl-covered">
        <Textarea id="cl-covered" name="whatCovered" placeholder="Brief description of the class." required />
      </Field>

      <Field label="Additional comments" htmlFor="cl-comments" hint="Optional.">
        <Textarea id="cl-comments" name="comments" rows={3} />
      </Field>

      <Field label="Teacher name" htmlFor="cl-teacher" hint="Auto-filled from your profile.">
        <Input id="cl-teacher" value={teacherName} readOnly className="bg-ink-50" />
      </Field>

      <Button type="submit">Submit class log</Button>
    </form>
  );
}
