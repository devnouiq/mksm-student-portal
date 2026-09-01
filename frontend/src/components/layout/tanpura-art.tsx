import { cn } from "@/lib/cn";

/**
 * Tanpura — the drone instrument at the heart of every Hindustani performance,
 * drawn as detailed line art. The four strings shimmer and sound-waves rise from
 * the bridge (jawari), evoking the sustained drone. Motion is CSS-only and fully
 * disabled under prefers-reduced-motion. Inherits colour via currentColor.
 */
export function TanpuraArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 460"
      fill="none"
      className={cn("mksm-tanpura", className)}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* sound-waves rising from the bridge */}
        <g className="mksm-tanpura-waves" strokeWidth={1.2}>
          <path className="mksm-tanpura-wave" d="M44 300a40 40 0 0 1 72 0" opacity="0" />
          <path className="mksm-tanpura-wave" d="M30 300a54 54 0 0 1 100 0" opacity="0" />
          <path className="mksm-tanpura-wave" d="M16 300a68 68 0 0 1 128 0" opacity="0" />
        </g>

        {/* tumba (gourd resonator) */}
        <path d="M80 300c-46 0-64 34-64 74s28 74 64 74 64-34 64-74-18-74-64-74Z" />
        {/* tabli (face plate) across the top of the gourd */}
        <path d="M31 316c14-11 34-16 49-16s35 5 49 16" />
        {/* rosette + tuning rings on the face */}
        <circle cx="80" cy="392" r="11" />
        <circle cx="80" cy="392" r="4" />
        <path d="M80 300v10" />
        {/* bridge (jawari) */}
        <rect x="68" y="305" width="24" height="9" rx="2" />

        {/* neck (dandi) rising to the pegbox */}
        <path d="M69 306V70q0-16 11-16t11 16v236" />

        {/* four drone strings from bridge to pegs */}
        <line className="mksm-tanpura-string" x1="74" y1="308" x2="74" y2="60" />
        <line className="mksm-tanpura-string" x1="78" y1="308" x2="78" y2="52" />
        <line className="mksm-tanpura-string" x1="82" y1="308" x2="82" y2="52" />
        <line className="mksm-tanpura-string" x1="86" y1="308" x2="86" y2="60" />

        {/* pegbox + tuning pegs (khunti) */}
        <path d="M67 70q13-9 26 0" />
        <line x1="70" y1="60" x2="58" y2="56" />
        <line x1="74" y1="52" x2="62" y2="46" />
        <line x1="86" y1="52" x2="98" y2="46" />
        <line x1="90" y1="60" x2="102" y2="56" />
        {/* finial curl at the very top */}
        <path d="M80 54v-14q0-10 9-10t9 9" />
      </g>
    </svg>
  );
}
