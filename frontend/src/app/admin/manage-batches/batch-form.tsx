"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmittedNotice } from "@/components/ui/submitted-notice";

/*
  Add / Manage Batch form (PRD §5.3). The Zoom link is a STATIC link pasted by
  the admin (PRD §8.8) — editable later via Edit Batch. No Zoom API.
*/
export function BatchForm({ teachers }: { teachers: string[] }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SubmittedNotice title="Batch saved">
        The batch has been created with its static Zoom link and assigned
        teacher. You can edit it any time from the batch list.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Create another batch
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
      <Field label="Batch name" htmlFor="b-name">
        <Input id="b-name" name="name" placeholder="e.g. Dhun Batch" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Day" htmlFor="b-day">
          <Select id="b-day" name="day">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (d) => (
                <option key={d}>{d}</option>
              ),
            )}
          </Select>
        </Field>
        <Field label="Time" htmlFor="b-time">
          <Input id="b-time" name="time" type="time" />
        </Field>
        <Field label="Pitch" htmlFor="b-pitch">
          <Select id="b-pitch" name="pitch">
            <option>C#</option>
            <option>G#</option>
            <option>B#</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Student type" htmlFor="b-type">
          <Select id="b-type" name="studentType">
            <option>Kids</option>
            <option>Youth</option>
            <option>Adults</option>
          </Select>
        </Field>
        <Field label="Gender mix" htmlFor="b-gender">
          <Select id="b-gender" name="genderMix">
            <option>Mix</option>
            <option>Male</option>
            <option>Female</option>
          </Select>
        </Field>
        <Field label="Language" htmlFor="b-lang">
          <Select id="b-lang" name="language">
            <option>Marathi</option>
            <option>Hindi</option>
            <option>English</option>
          </Select>
        </Field>
        <Field label="Batch level" htmlFor="b-level">
          <Select id="b-level" name="level">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advance</option>
          </Select>
        </Field>
      </div>

      <Field label="Assign teacher" htmlFor="b-teacher">
        <Select id="b-teacher" name="teacher">
          {teachers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Zoom link (static)"
        htmlFor="b-zoom"
        hint="Paste the recurring Zoom meeting link for this batch."
      >
        <Input id="b-zoom" name="zoomLink" type="url" placeholder="https://zoom.us/j/…" />
      </Field>

      <Button type="submit">Save batch</Button>
    </form>
  );
}
