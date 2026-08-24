import { Badge } from "@/components/ui/badge";
import type { HomeworkStatus } from "@/data/types";

const MAP: Record<
  HomeworkStatus,
  { label: string; tone: "success" | "warning" | "info" | "neutral" }
> = {
  submitted: { label: "Submitted", tone: "info" },
  reviewed: { label: "Reviewed", tone: "success" },
  "review-pending": { label: "Review Pending", tone: "warning" },
  "homework-pending": { label: "Homework Pending", tone: "neutral" },
};

export function HomeworkStatusBadge({ status }: { status: HomeworkStatus }) {
  const { label, tone } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
