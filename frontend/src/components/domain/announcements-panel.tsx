"use client";

import { useState } from "react";
import { CalendarBlank, Check } from "@phosphor-icons/react";
import type { Announcement } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** Announcements list with a local "mark all read" (PRD §5.2/§5.3). */
export function AnnouncementsPanel({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [items, setItems] = useState(announcements);
  const unread = items.filter((a) => !a.read).length;

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
            onClick={() => setItems((prev) => prev.map((a) => ({ ...a, read: true })))}
          >
            <Check size={16} /> Mark all read
          </Button>
        ) : null}
      </div>
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span
              className={
                "mt-1.5 size-2 shrink-0 rounded-full " +
                (a.read ? "bg-ink-200" : "bg-brand-500")
              }
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-ink-900">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                <CalendarBlank size={12} /> {formatDate(a.postedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
