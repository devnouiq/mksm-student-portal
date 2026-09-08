"use client";

import { useMemo, useState } from "react";
import { NotePencil, Trash, UserMinus } from "@phosphor-icons/react";
import type { DeEnrollment, DeEnrollmentLookup } from "@/data/types";
import { formatDate, formatMonth } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableWrap, TD, TH, THead, TR } from "@/components/ui/table";
import { DownloadCsvButton } from "@/components/domain/download-csv-button";

const csvColumns: CsvColumn<DeEnrollment>[] = [
  { header: "MKSM No.", value: (r) => r.mksmNo },
  { header: "Student", value: (r) => r.studentName },
  { header: "Batch", value: (r) => r.batchName },
  { header: "Teacher", value: (r) => r.teacherName },
  { header: "De-enrolled on", value: (r) => formatDate(r.deEnrolledOn) },
];

type Draft = Omit<DeEnrollment, "id">;

function emptyDraft(): Draft {
  return {
    mksmNo: "",
    studentName: "",
    batchName: "",
    teacherName: "",
    deEnrolledOn: new Date().toISOString(),
  };
}

export function DeEnrollmentManager({
  records,
  lookup,
}: {
  records: DeEnrollment[];
  lookup: DeEnrollmentLookup;
}) {
  const [items, setItems] = useState(records);
  const [editing, setEditing] = useState<DeEnrollment | null>(null);

  const [month, setMonth] = useState("all");
  const [teacher, setTeacher] = useState("all");
  const [batch, setBatch] = useState("all");

  const months = useMemo(() => {
    const seen = new Map<string, number>();
    for (const d of items) {
      seen.set(formatMonth(d.deEnrolledOn), new Date(d.deEnrolledOn).getTime());
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [items]);

  const teachers = useMemo(
    () => Array.from(new Set(items.map((d) => d.teacherName))).sort(),
    [items],
  );
  const batches = useMemo(
    () => Array.from(new Set(items.map((d) => d.batchName))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    return items
      .filter((d) => {
        const matchMonth = month === "all" || formatMonth(d.deEnrolledOn) === month;
        const matchTeacher = teacher === "all" || d.teacherName === teacher;
        const matchBatch = batch === "all" || d.batchName === batch;
        return matchMonth && matchTeacher && matchBatch;
      })
      .sort(
        (a, b) =>
          new Date(b.deEnrolledOn).getTime() - new Date(a.deEnrolledOn).getTime(),
      );
  }, [items, month, teacher, batch]);

  function addRecord(draft: Draft) {
    setItems((prev) => [{ ...draft, id: `de-${Date.now()}` }, ...prev]);
  }

  function saveEdit(next: DeEnrollment) {
    setItems((prev) => prev.map((x) => (x.id === next.id ? next : x)));
    setEditing(null);
  }

  function removeRecord(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add de-enrolled student</CardTitle>
        </CardHeader>
        <CardContent>
          <DeEnrollmentForm
            key="add"
            lookup={lookup}
            submitLabel="Add entry"
            onSubmit={addRecord}
            resetAfterSubmit
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full lg:w-48">
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Filter by month"
            >
              <option value="all">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-48">
            <Select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              aria-label="Filter by teacher"
            >
              <option value="all">All teachers</option>
              {teachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-48">
            <Select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              aria-label="Filter by batch"
            >
              <option value="all">All batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3 lg:ml-auto">
            <span className="text-sm text-muted-foreground">
              {filtered.length} of {items.length}
            </span>
            <DownloadCsvButton
              rows={filtered}
              columns={csvColumns}
              filename="de-enrollments.csv"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={UserMinus}
            title="No de-enrolled students"
            description="Add an entry above, or adjust the filters."
          />
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>MKSM No.</TH>
                  <TH>Student</TH>
                  <TH>Batch</TH>
                  <TH>Teacher</TH>
                  <TH>De-enrolled on</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <tbody>
                {filtered.map((d) => (
                  <TR key={d.id}>
                    <TD className="font-medium text-ink-900">{d.mksmNo}</TD>
                    <TD className="whitespace-nowrap">{d.studentName}</TD>
                    <TD className="whitespace-nowrap">{d.batchName}</TD>
                    <TD className="whitespace-nowrap">{d.teacherName}</TD>
                    <TD className="whitespace-nowrap">{formatDate(d.deEnrolledOn)}</TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(d)}
                          aria-label={`Edit ${d.studentName}`}
                        >
                          <NotePencil size={16} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecord(d.id)}
                          aria-label={`Remove ${d.studentName}`}
                        >
                          <Trash size={16} /> Remove
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit de-enrollment"
      >
        {editing ? (
          <DeEnrollmentForm
            key={editing.id}
            initial={editing}
            lookup={lookup}
            submitLabel="Save changes"
            onSubmit={(draft) => saveEdit({ ...draft, id: editing.id })}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}

/** Add / edit fields with MKSM-number and batch autofill. */
function DeEnrollmentForm({
  initial,
  lookup,
  submitLabel,
  onSubmit,
  onCancel,
  resetAfterSubmit = false,
}: {
  initial?: DeEnrollment;
  lookup: DeEnrollmentLookup;
  submitLabel: string;
  onSubmit: (draft: Draft) => void;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(initial ?? emptyDraft());

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  // MKSM number → autofill student name, batch, and (via batch) teacher.
  function onMksm(value: string) {
    const match = lookup.students.find((s) => s.mksmNo === value.trim());
    if (match) {
      setDraft((prev) => ({
        ...prev,
        mksmNo: value,
        studentName: match.studentName,
        batchName: match.batchName,
        teacherName: lookup.batchTeacher[match.batchName] ?? prev.teacherName,
      }));
    } else {
      set("mksmNo", value);
    }
  }

  // Batch → autofill the teacher who runs it.
  function onBatch(value: string) {
    setDraft((prev) => ({
      ...prev,
      batchName: value,
      teacherName: lookup.batchTeacher[value] ?? prev.teacherName,
    }));
  }

  const canSubmit =
    draft.mksmNo.trim() !== "" &&
    draft.studentName.trim() !== "" &&
    draft.batchName.trim() !== "";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          ...draft,
          mksmNo: draft.mksmNo.trim(),
          studentName: draft.studentName.trim(),
          teacherName: draft.teacherName.trim(),
        });
        if (resetAfterSubmit) setDraft(emptyDraft());
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="MKSM number"
          htmlFor="de-mksm"
          hint="Autofills name, batch and teacher when the number is known."
        >
          <Input
            id="de-mksm"
            value={draft.mksmNo}
            onChange={(e) => onMksm(e.target.value)}
            placeholder="e.g. 100428"
            required
          />
        </Field>
        <Field label="Student name" htmlFor="de-name">
          <Input
            id="de-name"
            value={draft.studentName}
            onChange={(e) => set("studentName", e.target.value)}
            required
          />
        </Field>
        <Field label="Batch" htmlFor="de-batch">
          <Select
            id="de-batch"
            value={draft.batchName}
            onChange={(e) => onBatch(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a batch
            </option>
            {Object.keys(lookup.batchTeacher).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Teacher" htmlFor="de-teacher">
          <Input
            id="de-teacher"
            value={draft.teacherName}
            onChange={(e) => set("teacherName", e.target.value)}
          />
        </Field>
        <Field label="De-enrolled on" htmlFor="de-date">
          <Input
            id="de-date"
            type="date"
            value={draft.deEnrolledOn.slice(0, 10)}
            onChange={(e) =>
              set(
                "deEnrolledOn",
                e.target.value
                  ? new Date(e.target.value).toISOString()
                  : new Date().toISOString(),
              )
            }
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
