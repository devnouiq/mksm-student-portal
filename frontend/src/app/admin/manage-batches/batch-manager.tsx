"use client";

import { useMemo, useState } from "react";
import { Check, Plus, UserPlus, X } from "@phosphor-icons/react";
import type { AdminBatch } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PITCHES = ["C#", "G#", "B#"];
const STUDENT_TYPES = ["Kids", "Youth", "Adults"];
const GENDER_MIX = ["Mix", "Male", "Female"];
const LANGUAGES = ["Marathi", "Hindi", "English"];
const LEVELS = ["Beginner", "Intermediate", "Advance"];

const TIME_ZONES = [
  { value: "IST", label: "IST — India (GMT+5:30)" },
  { value: "GST", label: "GST — UAE (GMT+4)" },
  { value: "SGT", label: "SGT — Singapore (GMT+8)" },
  { value: "GMT", label: "GMT — UK (GMT+0)" },
  { value: "CET", label: "CET — Europe (GMT+1)" },
  { value: "EST", label: "EST — US East (GMT−5)" },
  { value: "PST", label: "PST — US West (GMT−8)" },
  { value: "AEST", label: "AEST — Australia East (GMT+10)" },
];

const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "UAE",
  "Singapore",
  "Germany",
  "New Zealand",
  "Qatar",
];

const NEW = "new";

interface Draft {
  name: string;
  day: string;
  time: string;
  timeZone: string;
  pitch: string;
  studentType: string;
  genderMix: string;
  language: string;
  level: string;
  teacherName: string;
  allowedCountries: string[];
  zoomLink: string;
  zoomMeetingId: string;
  zoomPasscode: string;
  whatsappLink: string;
}

function emptyDraft(teacher: string): Draft {
  return {
    name: "",
    day: "Monday",
    time: "",
    timeZone: "IST",
    pitch: "C#",
    studentType: "Adults",
    genderMix: "Mix",
    language: "Hindi",
    level: "Beginner",
    teacherName: teacher,
    allowedCountries: [],
    zoomLink: "",
    zoomMeetingId: "",
    zoomPasscode: "",
    whatsappLink: "",
  };
}

function draftFromBatch(b: AdminBatch, fallbackTeacher: string): Draft {
  return {
    name: b.name,
    day: b.day,
    time: b.time,
    timeZone: b.timeZone ?? "IST",
    pitch: b.pitch ?? "C#",
    studentType: b.studentType ?? "Adults",
    genderMix: b.genderMix ?? "Mix",
    language: b.language,
    level: b.level,
    teacherName: b.teacherName || fallbackTeacher,
    allowedCountries: b.allowedCountries ?? [],
    zoomLink: b.zoomLink,
    zoomMeetingId: b.zoomMeetingId ?? "",
    zoomPasscode: b.zoomPasscode ?? "",
    whatsappLink: b.whatsappLink ?? "",
  };
}

export interface RosterStudent {
  mksmNo: string;
  name: string;
  batchNames: string[];
}

export function BatchManager({
  batches: initialBatches,
  teachers,
  students: initialStudents,
}: {
  batches: AdminBatch[];
  teachers: string[];
  students: RosterStudent[];
}) {
  const firstTeacher = teachers[0] ?? "";
  const [batches, setBatches] = useState(initialBatches);
  const [roster, setRoster] = useState<RosterStudent[]>(initialStudents);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  const [draft, setDraft] = useState<Draft>(emptyDraft(firstTeacher));
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [rosterMsg, setRosterMsg] = useState<string | null>(null);
  const [addPick, setAddPick] = useState<string>("");

  const editing = selectedId !== NEW;

  // The selected batch's stored name (membership is keyed by batch name).
  const selectedBatchName = editing
    ? batches.find((b) => b.id === selectedId)?.name ?? ""
    : "";

  const enrolled = useMemo(
    () => roster.filter((s) => s.batchNames.includes(selectedBatchName)),
    [roster, selectedBatchName],
  );
  const available = useMemo(
    () =>
      roster
        .filter((s) => !s.batchNames.includes(selectedBatchName))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [roster, selectedBatchName],
  );

  function addStudent(mksmNo: string) {
    if (!mksmNo || !selectedBatchName) return;
    setRoster((prev) =>
      prev.map((s) =>
        s.mksmNo === mksmNo ? { ...s, batchNames: [...s.batchNames, selectedBatchName] } : s,
      ),
    );
    const s = roster.find((x) => x.mksmNo === mksmNo);
    setRosterMsg(`${s?.name ?? "Student"} added to ${selectedBatchName} — added to its WhatsApp group.`);
    setAddPick("");
  }

  function removeStudent(mksmNo: string) {
    setRoster((prev) =>
      prev.map((s) =>
        s.mksmNo === mksmNo
          ? { ...s, batchNames: s.batchNames.filter((b) => b !== selectedBatchName) }
          : s,
      ),
    );
    const s = roster.find((x) => x.mksmNo === mksmNo);
    setRosterMsg(`${s?.name ?? "Student"} removed from ${selectedBatchName} — removed from its WhatsApp group.`);
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSavedMsg(null);
  }

  function choose(id: string) {
    setSelectedId(id);
    setSavedMsg(null);
    setRosterMsg(null);
    setAddPick("");
    if (id === NEW) {
      setDraft(emptyDraft(firstTeacher));
    } else {
      const b = batches.find((x) => x.id === id);
      if (b) setDraft(draftFromBatch(b, firstTeacher));
    }
  }

  function toggleCountry(c: string) {
    setDraft((prev) => ({
      ...prev,
      allowedCountries: prev.allowedCountries.includes(c)
        ? prev.allowedCountries.filter((x) => x !== c)
        : [...prev.allowedCountries, c],
    }));
    setSavedMsg(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;

    if (editing) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === selectedId
            ? {
                ...b,
                ...draft,
                name: draft.name.trim(),
                level: draft.level as AdminBatch["level"],
                language: draft.language as AdminBatch["language"],
              }
            : b,
        ),
      );
      setSavedMsg(`“${draft.name.trim()}” updated.`);
    } else {
      const id = `b-${Date.now()}`;
      const created: AdminBatch = {
        id,
        studentCount: 0,
        ...draft,
        name: draft.name.trim(),
        level: draft.level as AdminBatch["level"],
        language: draft.language as AdminBatch["language"],
      };
      setBatches((prev) => [...prev, created]);
      setSelectedId(id);
      setSavedMsg(`“${draft.name.trim()}” created.`);
    }
  }

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>{editing ? "Edit batch" : "New batch"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Batch selector — create new or edit an existing one */}
        <Field
          label="Batch"
          htmlFor="b-select"
          hint="Select a batch to edit, or create a new one."
        >
          <Select id="b-select" value={selectedId} onChange={(e) => choose(e.target.value)}>
            <option value={NEW}>+ Create new batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>

        {savedMsg ? (
          <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
            <Check size={16} weight="bold" /> {savedMsg}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Batch name" htmlFor="b-name">
            <Input
              id="b-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Dhun Batch"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Day" htmlFor="b-day">
              <Select id="b-day" value={draft.day} onChange={(e) => set("day", e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field label="Time" htmlFor="b-time">
              <Input
                id="b-time"
                value={draft.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="e.g. 6:00 PM"
              />
            </Field>
            <Field label="Primary time zone" htmlFor="b-tz" hint="The time above is in this zone.">
              <Select id="b-tz" value={draft.timeZone} onChange={(e) => set("timeZone", e.target.value)}>
                {TIME_ZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Pitch" htmlFor="b-pitch">
              <Select id="b-pitch" value={draft.pitch} onChange={(e) => set("pitch", e.target.value)}>
                {PITCHES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Student type" htmlFor="b-type">
              <Select
                id="b-type"
                value={draft.studentType}
                onChange={(e) => set("studentType", e.target.value)}
              >
                {STUDENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gender mix" htmlFor="b-gender">
              <Select
                id="b-gender"
                value={draft.genderMix}
                onChange={(e) => set("genderMix", e.target.value)}
              >
                {GENDER_MIX.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="Language" htmlFor="b-lang">
              <Select
                id="b-lang"
                value={draft.language}
                onChange={(e) => set("language", e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch level" htmlFor="b-level">
              <Select id="b-level" value={draft.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Assign teacher" htmlFor="b-teacher">
              <Select
                id="b-teacher"
                value={draft.teacherName}
                onChange={(e) => set("teacherName", e.target.value)}
              >
                {teachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Countries allowed for this batch — multi-select */}
          <Field
            label="Assign students from these countries"
            htmlFor="b-countries"
            hint="Some batches are more flexible for certain countries. Select all that apply."
          >
            <div id="b-countries" className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => {
                const on = draft.allowedCountries.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCountry(c)}
                    className={
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition " +
                      (on
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-border text-ink-600 hover:bg-ink-50")
                    }
                  >
                    {on ? <Check size={13} weight="bold" /> : <Plus size={13} />}
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Zoom — static link plus separate meeting id & passcode */}
          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 text-sm font-medium text-ink-800">Zoom (static)</p>
            <div className="space-y-4">
              <Field label="Meeting link" htmlFor="b-zoom" hint="Recurring Zoom link for this batch.">
                <Input
                  id="b-zoom"
                  type="url"
                  value={draft.zoomLink}
                  onChange={(e) => set("zoomLink", e.target.value)}
                  placeholder="https://zoom.us/j/…"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meeting ID" htmlFor="b-zoom-id">
                  <Input
                    id="b-zoom-id"
                    value={draft.zoomMeetingId}
                    onChange={(e) => set("zoomMeetingId", e.target.value)}
                    placeholder="000 0000 0000"
                  />
                </Field>
                <Field label="Passcode" htmlFor="b-zoom-pass">
                  <Input
                    id="b-zoom-pass"
                    value={draft.zoomPasscode}
                    onChange={(e) => set("zoomPasscode", e.target.value)}
                    placeholder="e.g. dhun24"
                  />
                </Field>
              </div>
            </div>
          </div>

          <Field
            label="WhatsApp group link"
            htmlFor="b-whatsapp"
            hint="Students assigned to this batch are added to this group."
          >
            <Input
              id="b-whatsapp"
              type="url"
              value={draft.whatsappLink}
              onChange={(e) => set("whatsappLink", e.target.value)}
              placeholder="https://chat.whatsapp.com/…"
            />
          </Field>

          <div className="flex gap-2">
            <Button type="submit">{editing ? "Save changes" : "Create batch"}</Button>
            {editing ? (
              <Button type="button" variant="outline" onClick={() => choose(NEW)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>

    {/* Student roster — add / remove students for this batch (many-to-many) */}
    {editing ? (
      <Card>
        <CardHeader>
          <CardTitle>Students in {selectedBatchName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rosterMsg ? (
            <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              <Check size={16} weight="bold" /> {rosterMsg}
            </div>
          ) : null}

          {/* Add a student to this batch */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Add a student" htmlFor="b-add-student" hint="A student can belong to several batches.">
                <Select id="b-add-student" value={addPick} onChange={(e) => setAddPick(e.target.value)}>
                  <option value="">Select a student…</option>
                  {available.map((s) => (
                    <option key={s.mksmNo} value={s.mksmNo}>
                      {s.name} — #{s.mksmNo}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="button" onClick={() => addStudent(addPick)} disabled={!addPick}>
              <UserPlus size={16} /> Add to batch
            </Button>
          </div>

          {/* Current roster */}
          {enrolled.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students in this batch yet.</p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {enrolled.map((s) => (
                <li key={s.mksmNo} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{s.mksmNo}
                      {s.batchNames.length > 1
                        ? ` · also in ${s.batchNames.filter((b) => b !== selectedBatchName).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStudent(s.mksmNo)}
                    aria-label={`Remove ${s.name}`}
                  >
                    <X size={15} /> Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    ) : null}
    </div>
  );
}
