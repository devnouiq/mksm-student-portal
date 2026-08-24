"use client";

import { useMemo, useState } from "react";
import { CheckCircle, MagnifyingGlass, SpeakerHigh } from "@phosphor-icons/react";
import type { HomeworkForReview } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeworkStatusBadge } from "@/components/domain/homework-status-badge";

export function HomeworkQueue({
  items,
  batches,
}: {
  items: HomeworkForReview[];
  batches: string[];
}) {
  const [batch, setBatch] = useState("all");
  const [query, setQuery] = useState("");
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const matchesBatch = batch === "all" || i.batchName === batch;
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          i.studentName.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q);
        return matchesBatch && matchesQuery;
      }),
    [items, batch, query],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <Input
            placeholder="Search by student or title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search homework"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch">
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No homework matches"
          description="Try a different batch or search term."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => {
            const isReviewed = reviewed[i.id] || i.status === "reviewed";
            return (
              <Card key={i.id}>
                <CardContent className="pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-ink-900">{i.title}</h3>
                        {isReviewed ? (
                          <Badge tone="success">Reviewed</Badge>
                        ) : (
                          <HomeworkStatusBadge status={i.status} />
                        )}
                        {i.late ? <Badge tone="warning">Late Submission</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {i.studentName} · {i.batchName}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        Class {formatDate(i.classDate)} · submitted {formatDate(i.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Audio player placeholder */}
                  <div className="mt-3 flex items-center gap-3 rounded-md bg-surface-muted px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-brand-600 text-white"
                      aria-label="Play submission"
                    >
                      <SpeakerHigh size={16} weight="fill" />
                    </button>
                    <div className="h-1.5 flex-1 rounded-full bg-ink-200">
                      <div className="h-full w-1/3 rounded-full bg-brand-400" />
                    </div>
                    <span className="text-xs text-ink-400">2:41</span>
                  </div>

                  <div className="mt-3">
                    {isReviewed && !reviewed[i.id] ? (
                      <p className="text-sm text-success-500">Feedback already shared.</p>
                    ) : reviewed[i.id] ? (
                      <p className="flex items-center gap-1.5 text-sm text-success-500">
                        <CheckCircle size={16} weight="fill" /> Feedback sent to {i.studentName}.
                      </p>
                    ) : openId === i.id ? (
                      <div className="space-y-2">
                        <Textarea placeholder="Write feedback for the student…" rows={3} />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setReviewed((prev) => ({ ...prev, [i.id]: true }))
                            }
                          >
                            Send feedback
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setOpenId(i.id)}>
                        Give feedback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
