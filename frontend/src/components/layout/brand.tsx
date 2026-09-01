import { cn } from "@/lib/cn";

/**
 * Tanpura glyph — the instrument built into MKSM's own logo. A long fretless
 * neck rising from a round gourd (tumba), four drone strings, tuning pegs.
 * Drawn inline (no external asset); inherits colour via `currentColor`.
 */
function Tanpura({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* gourd (tumba) + rosette + bridge */}
      <circle cx="12" cy="17.4" r="4.7" />
      <circle cx="12" cy="17.6" r="1" />
      <path d="M8.4 15.6h7.2" />
      {/* neck rising from the gourd */}
      <path d="M10.3 13.2V4.3q0-1.1 1.7-1.1t1.7 1.1v8.9" />
      {/* drone strings */}
      <path d="M11 12.9V4.4M13 12.9V4.4" />
      {/* tuning pegs */}
      <path d="M9 4.2h1.3M13.7 4.2H15" />
      <circle cx="8.6" cy="4.2" r="0.5" />
      <circle cx="15.4" cy="4.2" r="0.5" />
    </svg>
  );
}

/** MKSM wordmark — the tanpura mark on a dark stage tile beside the name. */
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
        className="mksm-brand-tile grid size-9 place-items-center rounded-md bg-ink-900 text-white shadow-card"
        aria-hidden
      >
        <Tanpura className="size-5" />
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
