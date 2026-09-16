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
  "temporary-break": { label: "Temporary break", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
  "de-enrolled": { label: "De-enrolled", tone: "danger" },
};

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
  batchName: string;
  joiningDate: string;
  info: string;
}

const GENDERS = ["Female", "Male", "Prefer not to say"];

function todayISO() {
  return new Date().toISOString();
}

function emptyDraft(batch: string): Draft {
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
    batchName: batch,
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
    batchName: s.batchName,
    joiningDate: s.joiningDate.slice(0, 10),
    info: s.info ?? "",
  };
}

let auditSeq = 0;
function auditEvent(label: string, note?: string): StudentAuditEvent {
  auditSeq += 1;
  return { id: `ae-${Date.now()}-${auditSeq}`, date: todayISO(), label, note };
}

export function ManageStudents({
  students: initial,
  batches,
}: {
  students: ManagedStudent[];
  batches: string[];
}) {
  const [students, setStudents] = useState(initial);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  const [draft, setDraft] = useState<Draft>(emptyDraft(batches[0] ?? ""));
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
      setDraft(emptyDraft(batches[0] ?? ""));
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

  function changeStatus(next: StudentStatus, label: string) {
    if (!current || current.status === next) return;
    patchCurrent({ status: next }, [auditEvent(label)]);
    setSavedMsg(label + ".");
  }

  function deEnroll() {
    if (!current || current.status === "de-enrolled") return;
    patchCurrent({ status: "de-enrolled" }, [
      auditEvent(`De-enrolled from ${current.batchName}`),
      auditEvent(`Removed from ${current.batchName} WhatsApp group`),
    ]);
    setSavedMsg(`${current.firstName} ${current.lastName} de-enrolled.`);
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
      const batchChanged = draft.batchName !== current.batchName;
      const events: StudentAuditEvent[] = batchChanged
        ? [
            auditEvent(`Moved to ${draft.batchName}`),
            auditEvent(`Removed from ${current.batchName} WhatsApp group`),
            auditEvent(`Added to ${draft.batchName} WhatsApp group`),
          ]
        : [];
      patchCurrent({ ...profile, batchName: draft.batchName }, events);
      setSavedMsg(
        batchChanged
          ? `Saved. Moved to ${draft.batchName} — WhatsApp groups updated.`
          : "Saved.",
      );
    } else {
      const mksmNo = String(100700 + createdCount);
      const created: ManagedStudent = {
        mksmNo,
        ...profile,
        batchName: draft.batchName,
        status: "active",
        joiningDate: draft.joiningDate ? new Date(draft.joiningDate).toISOString() : todayISO(),
        audit: [
          auditEvent("Joined MKSM"),
          auditEvent(`Assigned to ${draft.batchName}`),
          auditEvent(`Added to ${draft.batchName} WhatsApp group`),
        ],
        attendance: [],
      };
      setStudents((prev) => [...prev, created]);
      setCreatedCount((n) => n + 1);
      setSelectedId(mksmNo);
      setSavedMsg(`Student created — MKSM #${mksmNo}.`);
    }
  }

  const batchChangedNow =
    editing && current !== null && draft.batchName !== current.batchName;

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
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-ink-50/40 p-3">
              <span className="mr-1 text-sm font-medium text-ink-700">Status actions:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  changeStatus(
                    "active",
                    current.status === "temporary-break" ? "Resumed from temporary break" : "Marked active",
                  )
                }
                disabled={current.status === "active"}
              >
                <ArrowsClockwise size={15} /> Active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => changeStatus("temporary-break", "Put on temporary break")}
                disabled={current.status === "temporary-break"}
              >
                <PauseCircle size={15} /> Temporary break
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => changeStatus("inactive", "Marked inactive")}
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

            <Field
              label="Assign batch"
              htmlFor="s-batch"
              hint={
                batchChangedNow
                  ? `On save: remove from ${current!.batchName} WhatsApp group, add to ${draft.batchName} WhatsApp group.`
                  : "Changing the batch updates the student's WhatsApp group on save."
              }
            >
              <Select id="s-batch" value={draft.batchName} onChange={(e) => set("batchName", e.target.value)}>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>

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
