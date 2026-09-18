"use client";

import { useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Check,
  ClockCounterClockwise,
  PauseCircle,
  Prohibit,
  UserMinus,
} from "@phosphor-icons/react";
import type {
  ManagedStudent,
  StudentAuditEvent,
  StudentStatus,
} from "@/data/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableWrap, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const NEW = "new";

const STATUS_META: Record<
  StudentStatus,
  { label: string; tone: "success" | "warning" | "neutral" | "danger" }
> = {
  active: { label: "Active", tone: "success" },
  "temporary-break": { label: "On Temporary Break", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
  "de-enrolled": { label: "De-enrolled", tone: "danger" },
};

const BREAK_MONTHS = 3;
const DEFAULT_ENROLLMENT_FEE = 2000; // rupees

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function daysBetween(fromISO: string, toISO: string): number {
  return Math.ceil((new Date(toISO).getTime() - new Date(fromISO).getTime()) / 86_400_000);
}

/** A break has lapsed when its resume-by date is in the past. */
function isBreakLapsed(s: { status: StudentStatus; resumeBy?: string }): boolean {
  return s.status === "temporary-break" && !!s.resumeBy && new Date(s.resumeBy).getTime() < Date.now();
}

interface Draft {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  experienceYears: string;
  address: string;
  city: string;
  country: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  joiningDate: string;
  info: string;
}

const GENDERS = ["Female", "Male", "Prefer not to say"];

function todayISO() {
  return new Date().toISOString();
}

function emptyDraft(): Draft {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "Female",
    experienceYears: "",
    address: "",
    city: "",
    country: "India",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    joiningDate: todayISO().slice(0, 10),
    info: "",
  };
}

function draftFrom(s: ManagedStudent): Draft {
  return {
    firstName: s.firstName,
    lastName: s.lastName,
    phone: s.phone,
    email: s.email,
    dob: s.dob?.slice(0, 10) ?? "",
    gender: s.gender,
    experienceYears: s.experienceYears?.toString() ?? "",
    address: s.address ?? "",
    city: s.city ?? "",
    country: s.country,
    pincode: s.pincode ?? "",
    emergencyContactName: s.emergencyContactName ?? "",
    emergencyContactPhone: s.emergencyContactPhone ?? "",
    joiningDate: s.joiningDate.slice(0, 10),
    info: s.info ?? "",
  };
}

/** WhatsApp add/remove audit events across every batch the student is in. */
function whatsappEvents(batchNames: string[], action: "Removed from" | "Re-added to"): string[] {
  return batchNames.map((b) => `${action} ${b} WhatsApp group`);
}

let auditSeq = 0;
function auditEvent(label: string, note?: string): StudentAuditEvent {
  auditSeq += 1;
  return { id: `ae-${Date.now()}-${auditSeq}`, date: todayISO(), label, note };
}

export function ManageStudents({ students: initial }: { students: ManagedStudent[] }) {
  const [students, setStudents] = useState(initial);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  const editing = selectedId !== NEW;
  const current = editing ? students.find((s) => s.mksmNo === selectedId) ?? null : null;

  const sorted = useMemo(
    () =>
      [...students].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      ),
    [students],
  );

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSavedMsg(null);
  }

  function choose(id: string) {
    setSelectedId(id);
    setSavedMsg(null);
    if (id === NEW) {
      setDraft(emptyDraft());
    } else {
      const s = students.find((x) => x.mksmNo === id);
      if (s) setDraft(draftFrom(s));
    }
  }

  // Append audit events to the selected student and optionally patch fields.
  function patchCurrent(patch: Partial<ManagedStudent>, events: StudentAuditEvent[]) {
    setStudents((prev) =>
      prev.map((s) =>
        s.mksmNo === selectedId
          ? { ...s, ...patch, audit: [...s.audit, ...events] }
          : s,
      ),
    );
  }

  function markInactive() {
    if (!current || current.status === "inactive") return;
    patchCurrent(
      { status: "inactive", breakStartDate: undefined, resumeBy: undefined, subscriptionPaused: false },
      [auditEvent("Marked inactive")],
    );
    setSavedMsg("Marked inactive.");
  }

  // Put a student on a temporary break: starts the 3-month clock, pauses the
  // subscription and removes them from the batch WhatsApp group.
  function startBreak() {
    if (!current || current.status === "temporary-break") return;
    const start = todayISO();
    const resumeBy = addMonths(start, BREAK_MONTHS);
    patchCurrent(
      {
        status: "temporary-break",
        breakStartDate: start,
        resumeBy,
        subscriptionPaused: true,
      },
      [
        auditEvent("Put on temporary break", `Maximum ${BREAK_MONTHS} months — resume by ${formatDate(resumeBy)}.`),
        auditEvent("Subscription paused"),
        ...whatsappEvents(current.batchNames, "Removed from").map((l) => auditEvent(l)),
      ],
    );
    setSavedMsg(`On temporary break — resume by ${formatDate(resumeBy)}.`);
  }

  // Resume / re-activate. Re-enrolling after a lapsed break (or from
  // de-enrolled) triggers the one-time enrollment fee.
  function resumeOrActivate() {
    if (!current || current.status === "active") return;

    const lapsed = isBreakLapsed(current);
    const reEnrolling = current.status === "de-enrolled" || lapsed;

    if (reEnrolling) {
      const fee = current.enrollmentFee ?? DEFAULT_ENROLLMENT_FEE;
      patchCurrent(
        {
          status: "active",
          breakStartDate: undefined,
          resumeBy: undefined,
          subscriptionPaused: false,
          feeApplicable: true,
          enrollmentFee: fee,
        },
        [
          auditEvent("Re-enrolled after break"),
          auditEvent(`One-time enrollment fee applied (₹${fee})`),
          auditEvent("Subscription resumed"),
          ...whatsappEvents(current.batchNames, "Re-added to").map((l) => auditEvent(l)),
        ],
      );
      setSavedMsg(`Re-enrolled — one-time enrollment fee of ₹${fee} applies.`);
      return;
    }

    if (current.status === "temporary-break") {
      patchCurrent(
        { status: "active", breakStartDate: undefined, resumeBy: undefined, subscriptionPaused: false },
        [
          auditEvent("Resumed from temporary break"),
          auditEvent("Subscription resumed"),
          ...whatsappEvents(current.batchNames, "Re-added to").map((l) => auditEvent(l)),
        ],
      );
      setSavedMsg("Resumed from break.");
      return;
    }

    // from inactive
    patchCurrent({ status: "active" }, [auditEvent("Marked active")]);
    setSavedMsg("Marked active.");
  }

  // Admin confirms de-enrollment when a break has exceeded 3 months.
  function confirmLapse() {
    if (!current) return;
    patchCurrent(
      {
        status: "de-enrolled",
        subscriptionPaused: true,
        feeApplicable: true,
        enrollmentFee: current.enrollmentFee ?? DEFAULT_ENROLLMENT_FEE,
      },
      [auditEvent(`Break exceeded ${BREAK_MONTHS} months — de-enrolled`)],
    );
    setSavedMsg("Break lapsed — student de-enrolled.");
  }

  function deEnroll() {
    if (!current || current.status === "de-enrolled") return;
    const from = current.batchNames.length ? current.batchNames.join(", ") : "MKSM";
    patchCurrent({ status: "de-enrolled", subscriptionPaused: true }, [
      auditEvent(`De-enrolled from ${from}`),
      ...whatsappEvents(current.batchNames, "Removed from").map((l) => auditEvent(l)),
    ]);
    setSavedMsg(`${current.firstName} ${current.lastName} de-enrolled.`);
  }

  function setEnrollmentFee(value: number) {
    setStudents((prev) =>
      prev.map((s) => (s.mksmNo === selectedId ? { ...s, enrollmentFee: value } : s)),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.firstName.trim() || !draft.lastName.trim()) return;

    const experienceYears = draft.experienceYears ? Number(draft.experienceYears) : undefined;
    const profile = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      dob: draft.dob ? new Date(draft.dob).toISOString() : undefined,
      gender: draft.gender,
      experienceYears,
      address: draft.address.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
      pincode: draft.pincode.trim(),
      emergencyContactName: draft.emergencyContactName.trim(),
      emergencyContactPhone: draft.emergencyContactPhone.trim(),
      info: draft.info.trim(),
    };

    if (editing && current) {
      // Batch membership is managed from the batch roster, not here.
      patchCurrent(profile, []);
      setSavedMsg("Saved.");
    } else {
      const mksmNo = String(100700 + createdCount);
      const created: ManagedStudent = {
        mksmNo,
        ...profile,
        batchNames: [],
        status: "active",
        joiningDate: draft.joiningDate ? new Date(draft.joiningDate).toISOString() : todayISO(),
        audit: [auditEvent("Joined MKSM")],
        attendance: [],
      };
      setStudents((prev) => [...prev, created]);
      setCreatedCount((n) => n + 1);
      setSelectedId(mksmNo);
      setSavedMsg(`Student created — MKSM #${mksmNo}. Assign to a batch on Manage Batches.`);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{editing ? "Edit student" : "Add new student"}</CardTitle>
            {current ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">MKSM #{current.mksmNo}</span>
                <Badge tone={STATUS_META[current.status].tone}>
                  {STATUS_META[current.status].label}
                </Badge>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="Student" htmlFor="s-select" hint="Select a student to edit, or add a new one.">
            <Select id="s-select" value={selectedId} onChange={(e) => choose(e.target.value)}>
              <option value={NEW}>+ Add new student</option>
              {sorted.map((s) => (
                <option key={s.mksmNo} value={s.mksmNo}>
                  {s.firstName} {s.lastName} — #{s.mksmNo}
                </option>
              ))}
            </Select>
          </Field>

          {/* Status actions (edit only) */}
          {current ? (
            <div className="space-y-3 rounded-lg border border-border bg-ink-50/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-medium text-ink-700">Status actions:</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resumeOrActivate}
                  disabled={current.status === "active"}
                >
                  <ArrowsClockwise size={15} />{" "}
                  {current.status === "temporary-break"
                    ? "Resume from break"
                    : current.status === "de-enrolled"
                      ? `Re-enroll (₹${current.enrollmentFee ?? DEFAULT_ENROLLMENT_FEE} fee)`
                      : "Mark active"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startBreak}
                  disabled={current.status === "temporary-break" || current.status === "de-enrolled"}
                >
                  <PauseCircle size={15} /> On temporary break
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markInactive}
                  disabled={current.status === "inactive"}
                >
                  <Prohibit size={15} /> Inactive
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deEnroll}
                  disabled={current.status === "de-enrolled"}
                >
                  <UserMinus size={15} /> De-enroll
                </Button>
              </div>

              {/* Active break panel */}
              {current.status === "temporary-break" && current.breakStartDate && current.resumeBy ? (
                isBreakLapsed(current) ? (
                  <div className="space-y-2 rounded-md border border-warning-500 bg-warning-100 p-3">
                    <p className="text-sm font-semibold text-warning-500">
                      Break lapsed — exceeded {BREAK_MONTHS} months (resume-by was{" "}
                      {formatDate(current.resumeBy)}).
                    </p>
                    <p className="text-xs text-ink-700">
                      Per policy this is a de-enrollment. Re-enrolment later carries a one-time
                      enrollment fee. Confirm to record the de-enrollment.
                    </p>
                    <Button size="sm" onClick={confirmLapse}>
                      <UserMinus size={15} /> Confirm de-enrollment
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border border-warning-500 bg-warning-100 px-3 py-2 text-sm text-ink-700">
                    On temporary break since{" "}
                    <span className="font-medium">{formatDate(current.breakStartDate)}</span> · resume by{" "}
                    <span className="font-medium">{formatDate(current.resumeBy)}</span> ·{" "}
                    {Math.max(0, daysBetween(todayISO(), current.resumeBy))} days left. Subscription
                    paused, removed from WhatsApp group.
                  </div>
                )
              ) : null}

              {/* Re-enrollment fee — only while de-enrolled (charged on re-enroll) */}
              {current.status === "de-enrolled" ? (
                <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900">One-time re-enrollment fee</p>
                    <p className="text-xs text-muted-foreground">
                      Charged when this de-enrolled student re-enrolls. Adjust the amount before
                      clicking Re-enroll.
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-sm text-ink-600">₹</span>
                    <Input
                      type="number"
                      min={0}
                      value={(current.enrollmentFee ?? DEFAULT_ENROLLMENT_FEE).toString()}
                      onChange={(e) => setEnrollmentFee(Number(e.target.value))}
                      className="w-28"
                      aria-label="Enrollment fee amount"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {savedMsg ? (
            <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              <Check size={16} weight="bold" /> {savedMsg}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="s-first">
                <Input id="s-first" value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} required />
              </Field>
              <Field label="Last name" htmlFor="s-last">
                <Input id="s-last" value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} required />
              </Field>
              <Field label="Contact number" htmlFor="s-phone">
                <Input id="s-phone" type="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
              </Field>
              <Field label="Email" htmlFor="s-email">
                <Input id="s-email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Date of birth" htmlFor="s-dob">
                <Input id="s-dob" type="date" value={draft.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender" htmlFor="s-gender">
                <Select id="s-gender" value={draft.gender} onChange={(e) => set("gender", e.target.value)}>
                  {GENDERS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Years of musical experience" htmlFor="s-exp">
                <Input id="s-exp" type="number" min={0} max={80} value={draft.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
              </Field>
              <Field label="Joining date" htmlFor="s-join" hint="Start date with MKSM.">
                <Input id="s-join" type="date" value={draft.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
              </Field>
            </div>

            <Field label="Postal address" htmlFor="s-address">
              <Textarea id="s-address" rows={2} value={draft.address} onChange={(e) => set("address", e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="s-city">
                <Input id="s-city" value={draft.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Country" htmlFor="s-country">
                <Input id="s-country" value={draft.country} onChange={(e) => set("country", e.target.value)} />
              </Field>
              <Field label="Pincode" htmlFor="s-pin">
                <Input id="s-pin" value={draft.pincode} onChange={(e) => set("pincode", e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Emergency contact name" htmlFor="s-ec-name">
                <Input id="s-ec-name" value={draft.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} />
              </Field>
              <Field label="Emergency contact number" htmlFor="s-ec-phone">
                <Input id="s-ec-phone" type="tel" value={draft.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
              </Field>
            </div>

            {/* Batches are read-only here — add/remove on Manage Batches. */}
            {current ? (
              <Field
                label="Batches"
                htmlFor="s-batches"
                hint="A student can be in several batches. Add or remove them on the Manage Batches screen."
              >
                <div id="s-batches" className="flex flex-wrap gap-2">
                  {current.batchNames.length ? (
                    current.batchNames.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-ink-50 px-3 py-1 text-sm text-ink-700"
                      >
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No batch assigned — add on Manage Batches.
                    </span>
                  )}
                </div>
              </Field>
            ) : null}

            <Field label="Additional info" htmlFor="s-info" hint="Optional.">
              <Textarea id="s-info" rows={2} value={draft.info} onChange={(e) => set("info", e.target.value)} />
            </Field>

            <div className="flex gap-2">
              <Button type="submit">{editing ? "Save changes" : "Add student"}</Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={() => choose(NEW)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit trail + attendance (edit only) */}
      {current ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockCounterClockwise size={18} className="text-brand-600" /> Audit trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-4">
                {current.audit.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute -left-[1.35rem] top-1 grid size-3 place-items-center rounded-full bg-brand-500 ring-2 ring-surface" />
                    <p className="text-sm font-medium text-ink-900">{ev.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ev.date)}</p>
                    {ev.note ? <p className="mt-0.5 text-xs text-ink-600">{ev.note}</p> : null}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance — last 12 months</CardTitle>
            </CardHeader>
            <CardContent>
              {current.attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes recorded yet.</p>
              ) : (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Present in{" "}
                    <span className="font-semibold text-ink-800">
                      {current.attendance.filter((a) => a.present).length}
                    </span>{" "}
                    of {current.attendance.length} classes.
                  </p>
                  <TableWrap>
                    <Table>
                      <THead>
                        <TR>
                          <TH>Date</TH>
                          <TH>Raga</TH>
                          <TH>Status</TH>
                        </TR>
                      </THead>
                      <tbody>
                        {current.attendance.map((a) => (
                          <TR key={a.id}>
                            <TD className="whitespace-nowrap">{formatDate(a.date)}</TD>
                            <TD className="whitespace-nowrap">{a.ragaCovered}</TD>
                            <TD>
                              <Badge tone={a.present ? "success" : "danger"}>
                                {a.present ? "Present" : "Absent"}
                              </Badge>
                            </TD>
                          </TR>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
