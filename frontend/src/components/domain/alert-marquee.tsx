import { Megaphone } from "@phosphor-icons/react/dist/ssr";

/*
  Scrolling right-to-left banner of important alerts on the student overview.
  Pure CSS animation (see globals.css); pauses on hover and honours
  prefers-reduced-motion. The track is duplicated so the loop is seamless.
*/
/*
  Line art closing the right end of the banner: a staff carrying two notes that
  runs into a cropped tanpura. Masked so it dissolves before it reaches the
  scrolling text, and drawn behind it.
*/
function MarqueeDecor() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/5 max-w-72 text-brand-300"
      viewBox="0 0 260 44"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="mksm-marquee-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="mksm-marquee-mask">
          <rect width="260" height="44" fill="url(#mksm-marquee-fade)" />
        </mask>
      </defs>

      <g mask="url(#mksm-marquee-mask)">
        {/* staff, sagging a touch as it travels right */}
        <g strokeWidth={0.7} opacity="0.75">
          {[9, 16, 23, 30].map((y) => (
            <path key={y} d={`M0 ${y} C 90 ${y + 2}, 170 ${y - 2}, 260 ${y}`} />
          ))}
        </g>

        {/* a pair of beamed notes riding the staff */}
        <g strokeWidth={1.1}>
          <ellipse cx="112" cy="27" rx="4.4" ry="3.4" transform="rotate(-20 112 27)" />
          <path d="M116 26 L116 8" />
          <ellipse cx="136" cy="24" rx="4.4" ry="3.4" transform="rotate(-20 136 24)" />
          <path d="M140 23 L140 6" />
          <path d="M116 8 L140 6" strokeWidth={1.6} />
        </g>

        {/* tanpura, cropped by the top and bottom of the bar */}
        <g strokeWidth={1.1} transform="translate(214 0) rotate(9 0 22)">
          <ellipse cx="0" cy="34" rx="15" ry="17" />
          <path d="M-13 25 C -6 20, 6 20, 13 25" strokeWidth={0.9} />
          <circle cx="0" cy="36" r="4" strokeWidth={0.9} />
          <rect x="-4" y="15" width="8" height="4" rx="1" strokeWidth={0.9} />
          <path d="M-4 15 L-4 -12" />
          <path d="M4 15 L4 -12" />
          <g strokeWidth={0.6}>
            <path d="M-1.5 16 L-1.5 -10" />
            <path d="M1.5 16 L1.5 -10" />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function AlertMarquee({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;

  const items = [...alerts, ...alerts];

  return (
    <section
      aria-label="Important alerts"
      className="mksm-marquee relative mb-4 flex items-center gap-3 overflow-hidden rounded-md border border-brand-200 bg-brand-50 px-3 py-2"
    >
      <MarqueeDecor />
      <span className="relative flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
        <Megaphone size={15} weight="fill" /> Alerts
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="mksm-marquee-track">
          {items.map((text, i) => (
            <span
              key={i}
              className="mx-6 text-sm text-ink-800"
              aria-hidden={i >= alerts.length}
            >
              {text}
              <span className="mx-6 text-brand-300" aria-hidden>
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
