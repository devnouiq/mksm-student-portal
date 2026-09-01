import { cn } from "@/lib/cn";

/** Fret positions down the neck — closer together toward the bridge. */
const FRETS = [176, 206, 234, 260, 284, 306, 326, 344, 360, 374, 386, 397, 407, 416];
/** Tuning pegs on the pegbox, and the sympathetic-string pegs down the neck. */
const HEAD_PEGS = [104, 122, 140];
const TARAB_PEGS = [212, 250, 288, 326, 364];

/**
 * Sitar — drawn as a single-weight engraving: the curled pegbox and its tuning
 * pegs, a long fretted neck, the bridge, and the tumba (gourd) with its rosette.
 * Strings run the whole length in a lighter weight. Decorative line art;
 * inherits colour via currentColor and is sized by the caller.
 */
export function SitarArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 640"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* the curl at the very top of the pegbox */}
        <path d="M100 58 C 94 34, 112 24, 116 40 C 119 53, 106 60, 100 58" />
        {/* pegbox: a dome shouldering down into the neck */}
        <path d="M79 100 C 79 56, 121 56, 121 100" />
        <path d="M79 100 L83 152" />
        <path d="M121 100 L117 152" />
        {/* tuning pegs, three a side */}
        {HEAD_PEGS.map((y, i) => (
          <g key={y}>
            <path d={`M${79 + i} ${y} L${56 - i * 2} ${y - 9}`} />
            <circle cx={55 - i * 2} cy={y - 10} r="3" />
            <path d={`M${121 - i} ${y} L${144 + i * 2} ${y - 9}`} />
            <circle cx={145 + i * 2} cy={y - 10} r="3" />
          </g>
        ))}

        {/* neck, widening a little toward the gourd */}
        <path d="M83 152 C 82 260, 80 370, 78 452" />
        <path d="M117 152 C 118 260, 120 370, 122 452" />

        {/* frets, tied across the neck */}
        {FRETS.map((y) => (
          <path
            key={y}
            strokeWidth={1}
            d={`M${83 - (y - 152) * 0.017} ${y} Q100 ${y - 7} ${117 + (y - 152) * 0.017} ${y}`}
          />
        ))}

        {/* sympathetic-string pegs down the right flank */}
        {TARAB_PEGS.map((y, i) => (
          <g key={y} strokeWidth={1.1}>
            <path d={`M${118 + i * 0.6} ${y} L${138 + i} ${y - 5}`} />
            <circle cx={139 + i} cy={y - 6} r="2.4" />
          </g>
        ))}

        {/* bridge block where the neck meets the table */}
        <path d="M76 452 L124 452 L126 472 L74 472 Z" />
        <path strokeWidth={1} d="M79 462 L121 462" />

        {/* tumba — the gourd, doubled the way an engraver shades a curve */}
        <ellipse cx="100" cy="548" rx="90" ry="84" />
        <ellipse cx="110" cy="544" rx="82" ry="77" strokeWidth={1} opacity="0.7" />
        {/* the table arching under the neck */}
        <path strokeWidth={1} d="M22 512 C 60 480, 140 480, 178 512" />

        {/* rosette and its lugs */}
        <circle cx="100" cy="556" r="14" />
        <circle cx="100" cy="556" r="6" />
        <ellipse cx="82" cy="556" rx="5" ry="8" strokeWidth={1} />
        <ellipse cx="118" cy="556" rx="5" ry="8" strokeWidth={1} />
      </g>

      {/* strings, drawn light so the body reads first — and breathing, the way
          a plucked string keeps sounding */}
      <g stroke="currentColor" strokeWidth={0.7} strokeLinecap="round" opacity="0.85">
        <path className="mksm-sitar-string" d="M89 150 L96 552" />
        <path className="mksm-sitar-string" d="M94 148 L98 552" />
        <path className="mksm-sitar-string" d="M100 147 L100 552" />
        <path className="mksm-sitar-string" d="M106 148 L102 552" />
        <path className="mksm-sitar-string" d="M111 150 L104 552" />
      </g>

      {/* sound lifting off the bridge */}
      <g
        className="mksm-sitar-waves"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      >
        <path className="mksm-sitar-wave" d="M124 486 C 146 470, 160 452, 166 430" opacity="0" />
        <path className="mksm-sitar-wave" d="M130 496 C 158 476, 176 452, 182 422" opacity="0" />
        <path className="mksm-sitar-wave" d="M118 478 C 136 464, 148 448, 152 430" opacity="0" />
      </g>

      {/* and drifting away from it, a phrase at a time */}
      <g stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" fill="none">
        <path className="mksm-sitar-drift" d="M128 470 C 162 434, 180 376, 188 300" opacity="0.7" />
        <path className="mksm-sitar-drift" d="M134 492 C 172 452, 192 396, 197 336" opacity="0.5" />
        <path className="mksm-sitar-drift" d="M120 452 C 150 420, 166 372, 172 316" opacity="0.4" />
      </g>
    </svg>
  );
}
