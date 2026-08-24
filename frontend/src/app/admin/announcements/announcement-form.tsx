"use client";

import { useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmittedNotice } from "@/components/ui/submitted-notice";

/*
  Add Announcement (PRD §5.3): Title, Description, file upload, and a
  "Share with" audience — All Students / Specific Batch / Specific Student.
*/
export function AnnouncementForm({ batches }: { batches: string[] }) {
  const [audience, setAudience] = useState("all");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SubmittedNotice title="Announcement published">
        Your announcement has been shared with the selected audience.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Create another
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
      <Field label="Title" htmlFor="an-title">
        <Input id="an-title" name="title" required />
      </Field>

      <Field label="Description" htmlFor="an-desc">
        <Textarea id="an-desc" name="description" required />
      </Field>

      <Field label="Attachment" htmlFor="an-file" hint="Optional — choose or drag a file.">
        <label
          htmlFor="an-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink-300 bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground hover:border-brand-400"
        >
          <UploadSimple size={22} className="text-ink-400" />
          <span>
            <span className="font-medium text-brand-700">Choose a file</span> or drag it here
          </span>
          <input id="an-file" name="file" type="file" className="sr-only" />
        </label>
      </Field>

      <Field label="Share with" htmlFor="an-audience">
        <Select
          id="an-audience"
          name="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        >
          <option value="all">All students</option>
          <option value="batch">Specific batch</option>
          <option value="student">Specific student</option>
        </Select>
      </Field>

      {audience === "batch" ? (
        <Field label="Batch" htmlFor="an-batch">
          <Select id="an-batch" name="batch">
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {audience === "student" ? (
        <Field label="Student MKSM number" htmlFor="an-student">
          <Input id="an-student" name="student" placeholder="e.g. 100428" />
        </Field>
      ) : null}

      <Button type="submit">Publish announcement</Button>
    </form>
  );
}
