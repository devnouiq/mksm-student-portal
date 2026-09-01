import { cn } from "@/lib/cn";

/**
 * Water stain — the bottom-right corner of the ivory panel treated like a sheet
 * of paper that got wet and dried: a pale warm wash bleeding in from the edge,
 * ringed by the darker tide lines the water leaves behind, with the whole
 * boundary roughened by fractal noise so it never reads as a clean shape.
 *
 * Decorative and static. Placed by the caller via className.
 */
export function WaterStain({ className }: { className?: string }) {
  // Only the inner boundary is ragged: the water ran off the sheet, so the
  // right and bottom sides carry past the frame and are cut straight by the
  // screen edge. Every path overshoots by more than the displacement + blur so
  // no gap can open along those two edges.
  const spill =
    "M520 4 C 424 24, 376 92, 318 122 C 250 158, 196 138, 148 188 C 104 232, 110 286, 68 330 C 48 352, 32 368, 26 430 L 520 430 Z";
  const tideOuter =
    "M520 48 C 430 68, 388 126, 330 156 C 262 190, 212 172, 168 218 C 128 258, 136 306, 98 348 C 80 370, 68 388, 64 430";
  const tideInner =
    "M520 104 C 448 122, 412 168, 358 194 C 298 222, 250 206, 210 246 C 174 282, 182 322, 148 362 C 132 382, 122 400, 118 430";

  return (
    <svg
      viewBox="0 0 440 372"
      fill="none"
      preserveAspectRatio="xMaxYMax slice"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        {/* Fractal noise pushed through a displacement map — this is what turns
            the smooth spill outline into a ragged, water-bled edge. */}
        <filter id="mksm-wet" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.019"
            numOctaves="4"
            seed="17"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="44"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {/* The wash itself: same ragged displacement, then blurred hard so the
            colour bleeds into the paper instead of stopping at an edge. */}
        <filter id="mksm-wet-bleed" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.019"
            numOctaves="4"
            seed="17"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="44"
            xChannelSelector="R"
            yChannelSelector="G"
            result="ragged"
          />
          <feGaussianBlur in="ragged" stdDeviation="13" />
        </filter>
        {/* Feathering for the tide lines, so they bloom rather than draw. */}
        <filter id="mksm-wet-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {/* Mottling inside the wash — the uneven way paper takes up water. */}
        <filter id="mksm-wet-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="4"
            seed="4"
          />
          <feColorMatrix
            values="0 0 0 0 0.72
                    0 0 0 0 0.63
                    0 0 0 0 0.46
                    0 0 0 0.16 0"
          />
        </filter>
        <radialGradient
          id="mksm-wet-fill"
          cx="0.86"
          cy="0.84"
          r="0.95"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#c2ab7c" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#c9b489" stopOpacity="0.12" />
          <stop offset="1" stopColor="#c9b489" stopOpacity="0" />
        </radialGradient>
        <clipPath id="mksm-wet-clip">
          <path d={spill} />
        </clipPath>
      </defs>

      {/* The wash itself, darkest where the water pooled at the corner. */}
      <path d={spill} fill="url(#mksm-wet-fill)" filter="url(#mksm-wet-bleed)" />

      <g filter="url(#mksm-wet)">
        {/* Grain, kept inside the spill — paper takes up water unevenly. */}
        <g clipPath="url(#mksm-wet-clip)">
          <rect
            x="-20"
            y="0"
            width="460"
            height="372"
            filter="url(#mksm-wet-grain)"
            opacity="0.22"
          />
        </g>
        {/* Tide lines — the rim of pigment left as the edge dried. */}
        <path
          d={spill}
          stroke="#b08d55"
          strokeOpacity="0.28"
          strokeWidth="3"
          filter="url(#mksm-wet-soft)"
        />
        <path
          d={tideOuter}
          stroke="#b08d55"
          strokeOpacity="0.19"
          strokeWidth="2.2"
          filter="url(#mksm-wet-soft)"
        />
        <path
          d={tideInner}
          stroke="#b08d55"
          strokeOpacity="0.13"
          strokeWidth="1.8"
          filter="url(#mksm-wet-soft)"
        />
      </g>
    </svg>
  );
}
