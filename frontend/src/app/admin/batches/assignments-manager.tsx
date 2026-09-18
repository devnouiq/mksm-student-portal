"use client";

import { useMemo, useState } from "react";
import { Check, ChalkboardTeacher, UserPlus, UsersThree, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

export interface AssignBatch {
  id: string;
  batchId?: string;
  name: string;
  teacherName: string;
  day: string;
  time: string;
}

export interface AssignTeacher {
  teacherId: string;
  name: string;
}

export interface AssignStudent {
  mksmNo: string;
  name: string;
  batchNames: string[];
}

/**
 * Assignments — the single place batch relationships are wired.
 * Pick a batch, then change its teacher (teacher assignment) and add or
 * remove students (student assignment). Zoom / batch fields live on Manage
 * Batches, so the teacher and roster are only set here.
 */
export function AssignmentsManager({
  batches: initialBatches,
  teachers,
  students: initialStudents,
}: {
  batches: AssignBatch[];
  teachers: AssignTeacher[];
  students: AssignStudent[];
}) {
  const [batches, setBatches] = useState(initialBatches);
  const [roster, setRoster] = useState(initialStudents);
  const [selectedId, setSelectedId] = useState<string>(initialBatches[0]?.id ?? "");
  const [teacherMsg, setTeacherMsg] = useState<string | null>(null);
  const [rosterMsg, setRosterMsg] = useState<string | null>(null);
  const [addPick, setAddPick] = useState<string>("");

  const selected = batches.find((b) => b.id === selectedId);
  const selectedName = selected?.name ?? "";

  const enrolled = useMemo(
    () => roster.filter((s) => s.batchNames.includes(selectedName)),
    [roster, selectedName],
  );
  const available = useMemo(
    () =>
      roster
        .filter((s) => !s.batchNames.includes(selectedName))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [roster, selectedName],
  );

  function chooseBatch(id: string) {
    setSelectedId(id);
    setTeacherMsg(null);
    setRosterMsg(null);
    setAddPick("");
  }

  function changeTeacher(name: string) {
    if (!selected || name === selected.teacherName) return;
    setBatches((prev) => prev.map((b) => (b.id === selectedId ? { ...b, teacherName: name } : b)));
    setTeacherMsg(`${selectedName} is now taught by ${name}.`);
  }

  function addStudent(mksmNo: string) {
    if (!mksmNo || !selectedName) return;
    setRoster((prev) =>
      prev.map((s) =>
        s.mksmNo === mksmNo ? { ...s, batchNames: [...s.batchNames, selectedName] } : s,
      ),
    );
    const s = roster.find((x) => x.mksmNo === mksmNo);
    setRosterMsg(`${s?.name ?? "Student"} added to ${selectedName} — added to its WhatsApp group.`);
    setAddPick("");
  }

  function removeStudent(mksmNo: string) {
    setRoster((prev) =>
      prev.map((s) =>
        s.mksmNo === mksmNo
          ? { ...s, batchNames: s.batchNames.filter((b) => b !== selectedName) }
          : s,
      ),
    );
    const s = roster.find((x) => x.mksmNo === mksmNo);
    setRosterMsg(`${s?.name ?? "Student"} removed from ${selectedName} — removed from its WhatsApp group.`);
  }

  if (!selected) {
    return <p className="text-sm text-muted-foreground">No batches to assign yet.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a batch</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Batch" htmlFor="a-batch" hint="Assign its teacher and students below.">
            <Select id="a-batch" value={selectedId} onChange={(e) => chooseBatch(e.target.value)}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.batchId ? ` — ${b.batchId}` : ""} · {b.day} {b.time}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* Teacher assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChalkboardTeacher size={18} className="text-brand-600" /> Teacher assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teacherMsg ? (
            <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              <Check size={16} weight="bold" /> {teacherMsg}
            </div>
          ) : null}
          <Field
            label={`Teacher for ${selectedName}`}
            htmlFor="a-teacher"
            hint="One teacher per batch — this is the only place the batch's teacher is set."
          >
            <Select id="a-teacher" value={selected.teacherName} onChange={(e) => changeTeacher(e.target.value)}>
              {teachers.map((t) => (
                <option key={t.teacherId} value={t.name}>
                  {t.name} — {t.teacherId}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* Student assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersThree size={18} className="text-brand-600" /> Student assignment — {selectedName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rosterMsg ? (
            <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              <Check size={16} weight="bold" /> {rosterMsg}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Add a student" htmlFor="a-add-student" hint="A student can belong to several batches.">
                <Select id="a-add-student" value={addPick} onChange={(e) => setAddPick(e.target.value)}>
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
                        ? ` · also in ${s.batchNames.filter((b) => b !== selectedName).join(", ")}`
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
    </div>
  );
}
