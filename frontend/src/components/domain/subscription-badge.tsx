import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/data/types";

// Read-only status synced from Razorpay/PayPal (PRD §7).
const MAP: Record<
  SubscriptionStatus,
  { label: string; tone: "success" | "danger" | "warning" | "neutral" }
> = {
  active: { label: "Active", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  halted: { label: "Halted", tone: "warning" },
  suspended: { label: "Suspended", tone: "warning" },
  "one-time": { label: "One-time", tone: "neutral" },
};

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const { label, tone } = MAP[status];
  return (
    <Badge tone={tone}>
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden
      />
      {label}
    </Badge>
  );
}
