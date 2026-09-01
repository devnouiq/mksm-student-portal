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
  Add Announcement (PRD §5.3). Title, description, optional attachment, a
  "From" identity, and a "Share with" audience. Posting as Mahesh Kale Sir
  routes to the student's Message from MK section; Admin / MKSM Community route
  to Announcements. Marking Important also scrolls it in the overview marquee.
*/

const CUSTOM_AUDIENCES = [
  "All Beginner Students",
  "All Intermediate Students",
  "All Advanced Students",
  "All Kids Students",
  "All Adult Students",
  "All International Kids",
  "All India Kids",
  "All International Adults",
  "All India Adults",
  "All Teachers",
];

const fromHint: Record<string, string> = {
  admin: "Appears in the students' Announcements section.",
  "mahesh-kale": "Appears in the students' Message from MK section.",
  community: "Appears in the students' Announcements section.",
};

export function AnnouncementForm({ batches }: { batches: string[] }) {
  const [from, setFrom] = useState("admin");
  const [audience, setAudience] = useState("all");
  const [important, setImportant] = useState(false);
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

      <Field
        label="Description"
        htmlFor="an-desc"
        hint="Basic formatting: **bold** and *italic*."
      >
        <Textarea id="an-desc" name="description" required />
      </Field>

      <Field label="From" htmlFor="an-from" hint={fromHint[from]}>
        <Select
          id="an-from"
          name="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="mahesh-kale">Mahesh Kale Sir</option>
          <option value="community">MKSM Community</option>
        </Select>
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
          <option value="custom">Custom audience</option>
          <option value="batch">Specific batch</option>
          <option value="student">Specific student</option>
        </Select>
      </Field>

      {audience === "custom" ? (
        <Field label="Audience group" htmlFor="an-group">
          <Select id="an-group" name="group">
            {CUSTOM_AUDIENCES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

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

      <label className="flex items-start gap-2.5 rounded-md border border-border p-3">
        <input
          type="checkbox"
          name="important"
          checked={important}
          onChange={(e) => setImportant(e.target.checked)}
          className="mt-0.5 size-4 accent-brand-600"
        />
        <span className="text-sm">
          <span className="font-medium text-ink-900">Important</span>
          <span className="block text-muted-foreground">
            Also scroll this in the alert banner at the top of the student overview.
          </span>
        </span>
      </label>

      <Button type="submit">Publish announcement</Button>
    </form>
  );
}
