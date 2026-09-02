/** The seven swaras, climbing. Same scale the topbar ribbon sings. */
const SARGAM = ["सा", "रे", "ग", "म", "प", "ध", "नि"];

/**
 * Keeps the art in the outer gutters: opaque at both edges, clear across the
 * middle where the reading column sits, so nothing ever competes with text.
 */
const GUTTER_MASK =
  "linear-gradient(to right, #000 0, #000 14%, transparent 32%, transparent 68%, #000 86%, #000 100%)";

const DUSK_WASH = [
  // indigo dusk falling from the top-right
  "radial-gradient(58rem 40rem at 88% -12%, color-mix(in srgb, var(--color-brand-600) 17%, transparent), transparent 70%)",
  // marigold lamp-light rising from the bottom-left
  "radial-gradient(50rem 34rem at 4% 106%, color-mix(in srgb, var(--color-saffron-500) 20%, transparent), transparent 68%)",
  // a last, very faint indigo pool low on the right
  "radial-gradient(34rem 26rem at 96% 78%, color-mix(in srgb, var(--color-brand-600) 9%, transparent), transparent 72%)",
].join(", ");

/** The sur-patti — evenly ruled pitch lines, the ladder the swaras sit on. */
const SUR_PATTI =
  "repeating-linear-gradient(to bottom, color-mix(in srgb, var(--color-brand-600) 14%, transparent) 0 1px, transparent 1px 3.25rem)";

/**
 * Raga backdrop — the page read as a concert hall at dusk rather than blank
 * paper. Three quiet layers: a warm indigo/marigold wash, ruled sur-patti in
 * the gutters, and the raga itself in motion at the margins — the aroha
 * climbing on the left, a slow alaap contour tracing down the right with
 * marigold rests where the phrase settles.
 *
 * All of it lives in the outer gutters, which is the empty space the centred
 * reading column leaves behind; the column itself stays clean. Fixed, behind
 * everything, non-interactive, and still under reduced motion.
 */
export function RagaBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundImage: DUSK_WASH }} />

      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: SUR_PATTI,
          maskImage: GUTTER_MASK,
          WebkitMaskImage: GUTTER_MASK,
        }}
      />

      {/* Aroha — the ascending scale, each swara stepping out as it rises. */}
      <ol className="absolute bottom-24 left-4 hidden flex-col-reverse items-start gap-7 lg:flex xl:left-10">
        {SARGAM.map((swara, i) => (
          <li
            key={swara}
            className="mksm-raga-swara font-display text-2xl leading-none xl:text-3xl"
            style={{ marginLeft: `${i * 0.55}rem`, animationDelay: `${i * 0.62}s` }}
          >
            {swara}
          </li>
        ))}
      </ol>

      {/* Alaap — one long phrase falling down the right gutter. */}
      <svg
        className="absolute inset-y-0 right-0 hidden h-full w-56 text-brand-600 lg:block xl:w-72"
        viewBox="0 0 220 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <g stroke="currentColor" strokeLinecap="round" fill="none">
          <path
            strokeWidth={1.3}
            strokeOpacity={0.22}
            d="M150 -20 C 78 96, 196 168, 108 268 S 40 404, 146 498 S 200 640, 96 742 S 34 884, 138 1020"
          />
          <path
            className="mksm-raga-alaap"
            strokeWidth={2}
            strokeOpacity={0.5}
            d="M150 -20 C 78 96, 196 168, 108 268 S 40 404, 146 498 S 200 640, 96 742 S 34 884, 138 1020"
          />
          <path
            strokeWidth={1}
            strokeOpacity={0.12}
            d="M186 -20 C 118 110, 226 186, 142 286 S 76 420, 180 516 S 232 656, 132 760 S 70 898, 172 1020"
          />
        </g>

        {/* Rests — the swaras the phrase leans on, lit in marigold. */}
        <g className="text-saffron-500" fill="currentColor">
          <circle className="mksm-raga-rest" cx="108" cy="268" r="4.5" />
          <circle className="mksm-raga-rest" cx="146" cy="498" r="5.5" />
          <circle className="mksm-raga-rest" cx="96" cy="742" r="4.5" />
        </g>
      </svg>
    </div>
  );
}
