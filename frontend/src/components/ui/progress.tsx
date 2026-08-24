import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/format";

interface ProgressProps {
  /** 0..1 */
  value: number;
  className?: string;
  tone?: "brand" | "saffron";
  label?: string;
}

export function Progress({
  value,
  className,
  tone = "brand",
  label,
}: ProgressProps) {
  const pct = toPercent(value);
  const bar = tone === "saffron" ? "bg-saffron-500" : "bg-brand-600";
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
