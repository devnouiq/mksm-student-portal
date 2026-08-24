"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmittedNotice } from "@/components/ui/submitted-notice";

/** Add Teacher onboarding form (PRD §5.3). Prototype captures submit locally. */
export function AddTeacherForm({ batches }: { batches: string[] }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SubmittedNotice title="Teacher added">
        The teacher has been onboarded with the chosen access level and batch
        assignment. Sign-in credentials are emailed to the teacher.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Add another teacher
          </Button>
        </div>
      </SubmittedNotice>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field label="Full name" htmlFor="t-name">
        <Input id="t-name" name="name" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country code + phone" htmlFor="t-phone">
          <Input id="t-phone" name="phone" type="tel" placeholder="+91 …" required />
        </Field>
        <Field label="Email" htmlFor="t-email">
          <Input id="t-email" name="email" type="email" required />
        </Field>
      </div>

      <Field label="Postal address" htmlFor="t-address">
        <Textarea id="t-address" name="address" rows={2} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Access level" htmlFor="t-access" hint="Determines portal permissions.">
          <Select id="t-access" name="access">
            <option>Teacher — standard</option>
            <option>Teacher — senior (multi-batch)</option>
            <option>Teacher — read-only</option>
          </Select>
        </Field>
        <Field label="Assign batch" htmlFor="t-batch">
          <Select id="t-batch" name="batch">
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Button type="submit">Add teacher</Button>
    </form>
  );
}
