import { cn } from "@/lib/cn";

/** MKSM wordmark — serif monogram in a brand-red tile. No external asset. */
export function Brand({
  className,
  subtitle = "Student Portal",
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="mksm-brand-tile grid size-9 place-items-center rounded-md bg-brand-600 font-display text-lg font-semibold text-white shadow-card"
        aria-hidden
      >
        M
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold text-ink-900">
          MKSM
        </span>
        <span className="block text-[11px] font-medium tracking-wide text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </span>
  );
}
