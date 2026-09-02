import { SitarArt } from "./sitar-art";

const DUSK_WASH = [
  // indigo dusk falling from the top-right
  "radial-gradient(58rem 40rem at 88% -12%, color-mix(in srgb, var(--color-brand-600) 17%, transparent), transparent 70%)",
  // marigold lamp-light rising from the bottom-left
  "radial-gradient(50rem 34rem at 4% 106%, color-mix(in srgb, var(--color-saffron-500) 20%, transparent), transparent 68%)",
  // a last, very faint indigo pool low on the right
  "radial-gradient(34rem 26rem at 96% 78%, color-mix(in srgb, var(--color-brand-600) 9%, transparent), transparent 72%)",
].join(", ");

/** One strand of the stave, offset across the bundle but tracing one phrase. */
const strand = (dx: number) =>
  `M${20 + dx} -20 C ${62 + dx} 170, ${6 + dx} 400, ${52 + dx} 610 S ${12 + dx} 862, ${44 + dx} 1020`;

/** The five lines of the stave, a fifth of the gutter apart. */
const STAVE = [0, 11, 22, 33, 44];

/** Notes riding the phrase — position, glyph, tilt and when each one lifts. */
const NOTES = [
  { glyph: "𝄞", top: "6%", left: "24%", size: "3.4rem", tilt: -8, delay: "0s", op: 0.5 },
  { glyph: "♪", top: "26%", left: "58%", size: "1.9rem", tilt: 6, delay: "-1.6s", op: 0.55 },
  { glyph: "♫", top: "46%", left: "22%", size: "2.1rem", tilt: -5, delay: "-3.4s", op: 0.5 },
  { glyph: "♩", top: "66%", left: "52%", size: "1.7rem", tilt: 4, delay: "-5.1s", op: 0.45 },
  { glyph: "♬", top: "86%", left: "30%", size: "2rem", tilt: -6, delay: "-7s", op: 0.4 },
];

/**
 * The stave running down the right gutter with its notes. Five strands trace the
 * same phrase so the bundle reads as one ribbon of sheet music, and a brighter
 * strand runs the phrase end to end the way a line of music is read.
 */
function StaveGutter() {
  return (
    <div className="absolute inset-y-0 right-0 hidden w-40 lg:block xl:w-56">
      <svg
        className="absolute inset-0 size-full text-brand-600"
        viewBox="0 0 160 1000"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        {STAVE.map((dx) => (
          <path key={dx} d={strand(dx)} strokeWidth={1.1} strokeOpacity={0.2} />
        ))}
        <path
          className="mksm-raga-stave"
          d={strand(22)}
          strokeWidth={2}
          strokeOpacity={0.42}
        />
      </svg>

      {NOTES.map((n) => (
        <span
          key={n.glyph}
          className="mksm-raga-note absolute font-display leading-none text-brand-700"
          style={{
            top: n.top,
            left: n.left,
            fontSize: n.size,
            opacity: n.op,
            animationDelay: n.delay,
            ["--note-tilt" as string]: `${n.tilt}deg`,
          }}
        >
          {n.glyph}
        </span>
      ))}
    </div>
  );
}

/**
 * Raga backdrop — the instrument and the music it is reading. The sitar stands
 * in the left gutter, its strings still sounding and phrases drifting off the
 * bridge; a stave of sheet music runs down the right with notes riding it.
 *
 * Both live in the margins the centred reading column leaves free, and drop away
 * below `lg` where there are no margins to spare — the dusk wash carries the
 * theme alone there. Fixed, behind content, non-interactive, still under reduced
 * motion.
 */
export function RagaBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundImage: DUSK_WASH }} />

      <SitarArt className="absolute bottom-[-3rem] left-[-4rem] hidden h-[44rem] w-auto -rotate-6 text-brand-600/[0.3] lg:block xl:left-[-2rem] xl:h-[50rem]" />

      <StaveGutter />
    </div>
  );
}
