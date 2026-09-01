import { cn } from "@/lib/cn";

/**
 * Staff ribbon — a bundle of thin gold strands that lifts off the wave divider,
 * sweeps up across the ivory panel and dissolves around the middle of its top
 * edge. All strands trace the same phrase, so the bundle reads as one ribbon of
 * sound rather than a grid of rules.
 *
 * Decorative line art; colour comes from currentColor, placement from the
 * caller.
 */
export function StaffRibbon({
  className,
  lines = 8,
}: {
  className?: string;
  lines?: number;
}) {
  const gap = 17;
  const mid = (lines - 1) / 2;

  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      preserveAspectRatio="none"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        {/* Full-bodied where it leaves the divider, gone by the time it reaches
            the middle of the top edge. */}
        <linearGradient id="mksm-ribbon-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.35" />
          <stop offset="0.16" stopColor="white" stopOpacity="1" />
          <stop offset="0.62" stopColor="white" stopOpacity="0.7" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="mksm-ribbon-mask">
          <rect
            x="0"
            y="-40"
            width="600"
            height="380"
            fill="url(#mksm-ribbon-fade)"
          />
        </mask>
      </defs>

      <g
        mask="url(#mksm-ribbon-mask)"
        stroke="currentColor"
        strokeLinecap="round"
        fill="none"
      >
        {Array.from({ length: lines }, (_, i) => {
          const o = i * gap; // the same phrase, each strand hung a little lower
          const opacity = 1 - (Math.abs(i - mid) / (mid + 1)) * 0.65;
          return (
            <path
              key={i}
              strokeWidth={0.9}
              strokeOpacity={opacity.toFixed(2)}
              d={`M-30 ${268 + o} C 110 ${258 + o}, 226 ${206 + o}, 322 ${144 + o} S 470 ${44 + o}, 600 ${-16 + o}`}
            />
          );
        })}
      </g>
    </svg>
  );
}
