"use client";

import { useState } from "react";
import { Megaphone, NotePencil, Trash } from "@phosphor-icons/react";
import type { Announcement } from "@/data/types";
import { toPlainText } from "@/domain/rich-text";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { RichText } from "@/components/ui/rich-text";
import { Textarea } from "@/components/ui/textarea";

/**
 * Manage existing announcements (prototype: local state only). The list shows
 * title + a plain-text preview; opening one reads the full formatted body in a
 * dialog, and Edit updates it in place without deleting and recreating.
 */
export function ManageAnnouncementsList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [items, setItems] = useState(announcements);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const [editing, setEditing] = useState<Announcement | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements"
        description="Published announcements will appear here."
      />
    );
  }

  function saveEdit(next: Announcement) {
    setItems((prev) => prev.map((x) => (x.id === next.id ? next : x)));
    setEditing(null);
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
          >
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setViewing(a)}
                className="text-left font-medium text-ink-900 hover:text-brand-700 hover:underline"
              >
                {a.title}
              </button>
              <p className="truncate text-sm text-muted-foreground">
                {toPlainText(a.body)}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">{formatDate(a.postedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(a)}
                aria-label={`Edit ${a.title}`}
              >
                <NotePencil size={16} /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setItems((prev) => prev.filter((x) => x.id !== a.id))
                }
                aria-label={`Remove ${a.title}`}
              >
                <Trash size={16} /> Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? "Announcement"}
      >
        {viewing ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-ink-800">
              <RichText text={viewing.body} />
            </p>
            <p className="text-xs text-ink-400">{formatDate(viewing.postedAt)}</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit announcement"
      >
        {editing ? (
          <EditForm
            announcement={editing}
            onCancel={() => setEditing(null)}
            onSave={saveEdit}
          />
        ) : null}
      </Modal>
    </>
  );
}

/** In-place edit of an announcement's title and body. */
function EditForm({
  announcement,
  onCancel,
  onSave,
}: {
  announcement: Announcement;
  onCancel: () => void;
  onSave: (next: Announcement) => void;
}) {
  const [title, setTitle] = useState(announcement.title);
  const [body, setBody] = useState(announcement.body);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...announcement, title: title.trim(), body: body.trim() });
      }}
    >
      <Field label="Title" htmlFor="edit-title">
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field
        label="Description"
        htmlFor="edit-body"
        hint="Basic formatting: **bold** and *italic*."
      >
        <Textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          required
        />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={title.trim() === ""}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
