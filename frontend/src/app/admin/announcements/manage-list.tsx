"use client";

import { useState } from "react";
import { Megaphone, Trash } from "@phosphor-icons/react";
import type { Announcement } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Manage existing announcements — remove them (prototype: local only). */
export function ManageAnnouncementsList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [items, setItems] = useState(announcements);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements"
        description="Published announcements will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
        >
          <div>
            <p className="font-medium text-ink-900">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.body}</p>
            <p className="mt-0.5 text-xs text-ink-400">{formatDate(a.postedAt)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== a.id))}
            aria-label={`Remove ${a.title}`}
          >
            <Trash size={16} /> Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
