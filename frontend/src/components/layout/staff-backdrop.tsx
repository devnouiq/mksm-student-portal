import { cn } from "@/lib/cn";

/** Left-edge y of each stave inside the band; both climb to the right. */
const STAVES = [186, 246];
/**
 * Symbols riding the staves. All of them live in the open right half of the
 * header band — the part of the page nothing else occupies.
 */
const GLYPHS = [
  { glyph: "𝄞", top: "6%", left: "88%", size: "2.9rem", rotate: -6, op: 0.4 },
  { glyph: "♪", top: "34%", left: "47%", size: "1.7rem", rotate: 5, op: 0.5 },
  { glyph: "♩", top: "20%", left: "60%", size: "1.5rem", rotate: -4, op: 0.45 },
  { glyph: "♫", top: "48%", left: "70%", size: "1.6rem", rotate: 6, op: 0.42 },
  { glyph: "सा", top: "62%", left: "38%", size: "1.6rem", rotate: 0, op: 0.32 },
];

/**
 * Staff backdrop — two staves climbing across the header band with notes and a
 * sargam mark riding them. It is deliberately confined to the band beside the
 * page title: that strip is open, so the art is actually seen there, and it
 * never ends up buried behind a card. Masked away on the left so the title
 * always reads against clean paper. Decorative and non-interactive.
 */
export function StaffBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute overflow-hidden", className)}
      aria-hidden
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="mksm-staff-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.3" stopColor="white" stopOpacity="0.25" />
            <stop offset="0.52" stopColor="white" stopOpacity="1" />
            <stop offset="0.94" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0.45" />
          </linearGradient>
          <mask id="mksm-staff-mask">
            <rect x="0" y="0" width="1200" height="300" fill="url(#mksm-staff-fade)" />
          </mask>
        </defs>

        <g
          mask="url(#mksm-staff-mask)"
          stroke="currentColor"
          strokeWidth={1.1}
          strokeLinecap="round"
        >
          {STAVES.map((base, s) =>
            Array.from({ length: 5 }, (_, i) => {
              const y = base + i * 13;
              const a = 14 + s * 6; // how much the phrase sags mid-flight
              return (
                <path
                  key={`${base}-${i}`}
                  strokeOpacity={(0.7 - Math.abs(i - 2) * 0.1).toFixed(2)}
                  d={`M-30 ${y} C 260 ${y - 26 + a}, 560 ${y - 74 - a}, 860 ${y - 118} S 1140 ${y - 168 + a}, 1230 ${y - 196}`}
                />
              );
            }),
          )}
        </g>
      </svg>

      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="absolute font-display leading-none"
          style={{
            top: g.top,
            left: g.left,
            fontSize: g.size,
            opacity: g.op,
            transform: `rotate(${g.rotate}deg)`,
          }}
        >
          {g.glyph}
        </span>
      ))}
    </div>
  );
}
