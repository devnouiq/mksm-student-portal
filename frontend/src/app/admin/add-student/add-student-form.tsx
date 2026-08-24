"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmittedNotice } from "@/components/ui/submitted-notice";

/** Add Student onboarding form (PRD §5.3). Prototype captures submit locally. */
export function AddStudentForm({ batches }: { batches: string[] }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SubmittedNotice title="Student added">
        The student has been onboarded and assigned to their batch. A welcome
        email with sign-in details is sent to the student.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Add another student
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="s-first">
          <Input id="s-first" name="firstName" required />
        </Field>
        <Field label="Last name" htmlFor="s-last">
          <Input id="s-last" name="lastName" required />
        </Field>
        <Field label="Contact number" htmlFor="s-phone">
          <Input id="s-phone" name="phone" type="tel" placeholder="+91 …" required />
        </Field>
        <Field label="Email" htmlFor="s-email">
          <Input id="s-email" name="email" type="email" required />
        </Field>
        <Field label="Date of birth" htmlFor="s-dob">
          <Input id="s-dob" name="dob" type="date" />
        </Field>
        <Field label="Age" htmlFor="s-age">
          <Input id="s-age" name="age" type="number" min={3} max={100} />
        </Field>
        <Field label="Gender" htmlFor="s-gender">
          <Select id="s-gender" name="gender">
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
          </Select>
        </Field>
        <Field label="Years of musical experience" htmlFor="s-exp">
          <Input id="s-exp" name="experience" type="number" min={0} max={80} />
        </Field>
      </div>

      <Field label="Postal address" htmlFor="s-address">
        <Textarea id="s-address" name="address" rows={2} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" htmlFor="s-city">
          <Input id="s-city" name="city" />
        </Field>
        <Field label="Country" htmlFor="s-country">
          <Input id="s-country" name="country" defaultValue="India" />
        </Field>
        <Field label="Pincode" htmlFor="s-pin">
          <Input id="s-pin" name="pincode" />
        </Field>
      </div>

      <Field label="Assign batch" htmlFor="s-batch">
        <Select id="s-batch" name="batch">
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Additional info" htmlFor="s-info" hint="Optional.">
        <Textarea id="s-info" name="info" rows={2} />
      </Field>

      <Button type="submit">Add student</Button>
    </form>
  );
}
