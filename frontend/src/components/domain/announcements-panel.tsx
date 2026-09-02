"use client";

import { useState } from "react";
import { CalendarBlank, Check } from "@phosphor-icons/react";
import type { Announcement } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RichText } from "@/components/ui/rich-text";

/**
 * Announcements list — titles only. Clicking a title opens the full, formatted
 * body in a dialog and marks it read (PRD §5.2/§5.3). A local "mark all read"
 * clears the unread state for the session.
 */
export function AnnouncementsPanel({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [items, setItems] = useState(announcements);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const unread = items.filter((a) => !a.read).length;

  function open(a: Announcement) {
    setViewing(a);
    setItems((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, read: true } : x)),
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {unread} unread of {items.length}
        </span>
        {unread > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setItems((prev) => prev.map((a) => ({ ...a, read: true })))
            }
          >
            <Check size={16} /> Mark all read
          </Button>
        ) : null}
      </div>

      <ul className="space-y-1">
        {items.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => open(a)}
              className={
                "-mx-2 flex w-full items-start gap-3 rounded-md border-l-2 px-2 py-2 text-left transition duration-200 hover:bg-brand-50/70 " +
                (a.read ? "border-transparent" : "border-brand-300")
              }
            >
              <span
                className={
                  "mt-1.5 size-2 shrink-0 rounded-full " +
                  (a.read ? "bg-ink-200" : "bg-brand-500 ring-4 ring-brand-500/15")
                }
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-900">
                  {a.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                  <CalendarBlank size={12} /> {formatDate(a.postedAt)}
                </span>
              </span>
            </button>
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
    </div>
  );
}
