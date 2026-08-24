import { MusicNotes } from "@phosphor-icons/react/dist/ssr";
import type { PracticeMaterial } from "@/data/types";
import { formatDateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MaterialIcon, materialMeta } from "./material-icon";

/*
  Presentational list of practice material, shared by the student, teacher and
  admin screens. `showShare` surfaces a "Share to batch" action (teacher/admin);
  `readonlyOwner` marks admin-owned items teachers cannot edit (PRD §8.10).
*/
export function PracticeMaterialList({
  items,
  showShare = false,
  emptyLabel = "No practice material yet",
}: {
  items: PracticeMaterial[];
  showShare?: boolean;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={MusicNotes}
        title={emptyLabel}
        description="Material shared with your batch will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const meta = materialMeta(item.kind);
        return (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-ink-50">
                <MaterialIcon kind={item.kind} />
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge tone="neutral">{meta.label}</Badge>
                  {item.pitch ? <Badge tone="brand">Pitch {item.pitch}</Badge> : null}
                  {item.ownerRole === "admin" ? (
                    <Badge tone="info">Admin library</Badge>
                  ) : (
                    <Badge tone="success">My upload</Badge>
                  )}
                  <span>{item.meta}</span>
                  <span>· Added {formatDateShort(item.addedAt)}</span>
                </div>
                {item.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showShare ? (
                <Button variant="outline" size="sm">
                  Share to batch
                </Button>
              ) : null}
              <Button size="sm" variant="secondary">
                {meta.action}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
