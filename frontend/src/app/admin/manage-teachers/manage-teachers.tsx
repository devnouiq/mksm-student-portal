"use client";

import { useMemo, useState } from "react";
import {
  ArrowsClockwise,
  Check,
  ClockCounterClockwise,
  Prohibit,
} from "@phosphor-icons/react";
import type { AuditEvent, ManagedTeacher, TeacherStatus } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const NEW = "new";

const STATUS_META: Record<TeacherStatus, { label: string; tone: "success" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
};

const GENDERS = ["Female", "Male", "Prefer not to say"];
const ACCESS_LEVELS = ["Standard", "Senior (multi-batch)", "Read-only"];

interface Draft {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  experienceYears: string;
  specialization: string;
  languages: string;
  accessLevel: string;
  address: string;
  city: string;
  country: string;
  pincode: string;
  joiningDate: string;
  info: string;
}

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
    specialization: "",
    languages: "",
    accessLevel: "Standard",
    address: "",
    city: "",
    country: "India",
    pincode: "",
    joiningDate: todayISO().slice(0, 10),
    info: "",
  };
}

function draftFrom(t: ManagedTeacher): Draft {
  return {
    firstName: t.firstName,
    lastName: t.lastName,
    phone: t.phone,
    email: t.email,
    dob: t.dob?.slice(0, 10) ?? "",
    gender: t.gender,
    experienceYears: t.experienceYears?.toString() ?? "",
    specialization: t.specialization ?? "",
    languages: t.languages ?? "",
    accessLevel: t.accessLevel,
    address: t.address ?? "",
    city: t.city ?? "",
    country: t.country,
    pincode: t.pincode ?? "",
    joiningDate: t.joiningDate.slice(0, 10),
    info: t.info ?? "",
  };
}

let auditSeq = 0;
function auditEvent(label: string, note?: string): AuditEvent {
  auditSeq += 1;
  return { id: `te-${Date.now()}-${auditSeq}`, date: todayISO(), label, note };
}

export function ManageTeachers({ teachers: initial }: { teachers: ManagedTeacher[] }) {
  const [teachers, setTeachers] = useState(initial);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  const editing = selectedId !== NEW;
  const current = editing ? teachers.find((t) => t.teacherId === selectedId) ?? null : null;

  const sorted = useMemo(
    () =>
      [...teachers].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      ),
    [teachers],
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
      const t = teachers.find((x) => x.teacherId === id);
      if (t) setDraft(draftFrom(t));
    }
  }

  function patchCurrent(patch: Partial<ManagedTeacher>, events: AuditEvent[]) {
    setTeachers((prev) =>
      prev.map((t) =>
        t.teacherId === selectedId ? { ...t, ...patch, audit: [...t.audit, ...events] } : t,
      ),
    );
  }

  function markActive() {
    if (!current || current.status === "active") return;
    patchCurrent({ status: "active" }, [auditEvent("Marked active")]);
    setSavedMsg("Marked active.");
  }

  function markInactive() {
    if (!current || current.status === "inactive") return;
    patchCurrent({ status: "inactive" }, [auditEvent("Marked inactive")]);
    setSavedMsg("Marked inactive.");
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
      specialization: draft.specialization.trim(),
      languages: draft.languages.trim(),
      accessLevel: draft.accessLevel,
      address: draft.address.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
      pincode: draft.pincode.trim(),
      info: draft.info.trim(),
    };

    if (editing && current) {
      patchCurrent(profile, []);
      setSavedMsg("Saved.");
    } else {
      // Next T-number, padded to 6 digits — the teacher's primary ID.
      const nextNum =
        teachers.reduce(
          (max, t) => Math.max(max, Number(t.teacherId.replace(/\D/g, "")) || 0),
          0,
        ) +
        1 +
        createdCount;
      const teacherId = `T${String(nextNum).padStart(6, "0")}`;
      const created: ManagedTeacher = {
        teacherId,
        ...profile,
        status: "active",
        joiningDate: draft.joiningDate ? new Date(draft.joiningDate).toISOString() : todayISO(),
        batchNames: [],
        audit: [auditEvent("Joined MKSM as teacher")],
      };
      setTeachers((prev) => [...prev, created]);
      setCreatedCount((n) => n + 1);
      setSelectedId(teacherId);
      setSavedMsg(`Teacher created — primary ID ${teacherId}. Assign to a batch on Assignments.`);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{editing ? "Edit teacher" : "Add new teacher"}</CardTitle>
            {current ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-ink-50 px-2.5 py-1 font-mono text-xs text-ink-700">
                  {current.teacherId} · primary ID
                </span>
                <Badge tone={STATUS_META[current.status].tone}>
                  {STATUS_META[current.status].label}
                </Badge>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="Teacher" htmlFor="t-select" hint="Select a teacher to edit, or add a new one.">
            <Select id="t-select" value={selectedId} onChange={(e) => choose(e.target.value)}>
              <option value={NEW}>+ Add new teacher</option>
              {sorted.map((t) => (
                <option key={t.teacherId} value={t.teacherId}>
                  {t.firstName} {t.lastName} — {t.teacherId}
                </option>
              ))}
            </Select>
          </Field>

          {/* Status actions (edit only) */}
          {current ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-ink-50/40 p-3">
              <span className="mr-1 text-sm font-medium text-ink-700">Status actions:</span>
              <Button size="sm" variant="outline" onClick={markActive} disabled={current.status === "active"}>
                <ArrowsClockwise size={15} /> Mark active
              </Button>
              <Button size="sm" variant="outline" onClick={markInactive} disabled={current.status === "inactive"}>
                <Prohibit size={15} /> Inactive
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
              <Field label="First name" htmlFor="t-first">
                <Input id="t-first" value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} required />
              </Field>
              <Field label="Last name" htmlFor="t-last">
                <Input id="t-last" value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} required />
              </Field>
              <Field label="Contact number" htmlFor="t-phone">
                <Input id="t-phone" type="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
              </Field>
              <Field label="Email" htmlFor="t-email">
                <Input id="t-email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Date of birth" htmlFor="t-dob">
                <Input id="t-dob" type="date" value={draft.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender" htmlFor="t-gender">
                <Select id="t-gender" value={draft.gender} onChange={(e) => set("gender", e.target.value)}>
                  {GENDERS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Years of teaching experience" htmlFor="t-exp">
                <Input id="t-exp" type="number" min={0} max={80} value={draft.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
              </Field>
              <Field label="Joining date" htmlFor="t-join" hint="Start date with MKSM.">
                <Input id="t-join" type="date" value={draft.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
              </Field>
              <Field label="Specialization" htmlFor="t-spec" hint="Focus areas, e.g. Khayal, Bhajan.">
                <Input id="t-spec" value={draft.specialization} onChange={(e) => set("specialization", e.target.value)} />
              </Field>
              <Field label="Teaching languages" htmlFor="t-lang" hint="e.g. Hindi, Marathi.">
                <Input id="t-lang" value={draft.languages} onChange={(e) => set("languages", e.target.value)} />
              </Field>
              <Field label="Access level" htmlFor="t-access" hint="Portal permission tier.">
                <Select id="t-access" value={draft.accessLevel} onChange={(e) => set("accessLevel", e.target.value)}>
                  {ACCESS_LEVELS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Postal address" htmlFor="t-address">
              <Textarea id="t-address" rows={2} value={draft.address} onChange={(e) => set("address", e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="t-city">
                <Input id="t-city" value={draft.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Country" htmlFor="t-country">
                <Input id="t-country" value={draft.country} onChange={(e) => set("country", e.target.value)} />
              </Field>
              <Field label="Pincode" htmlFor="t-pin">
                <Input id="t-pin" value={draft.pincode} onChange={(e) => set("pincode", e.target.value)} />
              </Field>
            </div>

            {/* Batches are read-only here — set on the Assignments screen. */}
            {current ? (
              <Field
                label="Batches"
                htmlFor="t-batches"
                hint="A teacher can run several batches. Add or remove them on the Assignments screen."
              >
                <div id="t-batches" className="flex flex-wrap gap-2">
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
                      No batch assigned — assign one on Assignments.
                    </span>
                  )}
                </div>
              </Field>
            ) : null}

            <Field label="Additional info" htmlFor="t-info" hint="Optional.">
              <Textarea id="t-info" rows={2} value={draft.info} onChange={(e) => set("info", e.target.value)} />
            </Field>

            <div className="flex gap-2">
              <Button type="submit">{editing ? "Save changes" : "Add teacher"}</Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={() => choose(NEW)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit trail (edit only) */}
      {current ? (
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
      ) : null}
    </div>
  );
}
