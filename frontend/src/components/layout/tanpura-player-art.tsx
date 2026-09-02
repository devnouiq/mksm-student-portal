import { cn } from "@/lib/cn";

/** The dandi runs from the gourd up past her shoulder to the pegbox. */
const NECK = { x1: 120, y1: 378, x2: 58, y2: 150 };
/** Half-width of the dandi, measured along its perpendicular. */
const HALF = { x: 8.7, y: -2.4 };
/** Frets tied across it, as fractions of the neck's length. */
const FRETS = [0.16, 0.27, 0.38, 0.49, 0.6, 0.71, 0.82];

function fret(t: number) {
  const x = NECK.x1 + (NECK.x2 - NECK.x1) * t;
  const y = NECK.y1 + (NECK.y2 - NECK.y1) * t;
  return `M${(x - HALF.x).toFixed(1)} ${(y - HALF.y).toFixed(1)} L${(x + HALF.x).toFixed(1)} ${(y + HALF.y).toFixed(1)}`;
}

/** A quarter note — head, stem and flag — placed at (x, y) and scaled by s. */
function Note({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.2}>
      <ellipse cx="0" cy="0" rx="6.5" ry="5" transform="rotate(-20)" />
      <path d="M6 -2 L6 -32" />
      <path d="M6 -32 C 15 -29 18 -21 13 -14" />
    </g>
  );
}

/**
 * A seated tanpura player — a woman cradling the tanpura across her lap, one
 * hand up on the dandi and the other resting on the gourd, with sound curling
 * around her and foliage breaking at the base. Single-weight gold line art,
 * meant to sit blended into the Classic sidebar background. Purely decorative;
 * inherits colour via currentColor.
 */
export function TanpuraPlayerArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 600"
      fill="none"
      className={cn(className)}
      aria-hidden
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── Sound curling around her ── */}
      <g strokeWidth={0.8} opacity="0.5">
        <path d="M-8 520 C 60 500, 92 440, 86 366 C 80 286, 108 202, 168 152" />
        <path d="M-6 534 C 68 514, 102 450, 96 372 C 90 288, 120 198, 184 146" />
        <path d="M0 548 C 78 528, 114 458, 106 376 C 98 290, 132 194, 200 142" />
        <path d="M10 562 C 92 542, 126 466, 116 380 C 108 292, 146 190, 216 140" />
        <path d="M236 496 C 268 470, 280 430, 274 392" />
        <path d="M246 508 C 282 480, 294 434, 286 388" />
      </g>

      {/* Notes riding those lines */}
      <g opacity="0.7">
        <Note x={72} y={330} s={0.85} />
        <Note x={46} y={416} s={0.7} />
        <Note x={102} y={238} s={0.6} />
      </g>

      {/* ── The player ── */}
      {/* Head, turned a little toward the instrument, eyes lowered. */}
      <path d="M212 162 C 232 162 244 178 243 198 C 242 220 230 236 212 237 C 194 238 182 220 182 198 C 182 176 194 162 212 162" />
      {/* Hair: centre parting sweeping back to a low bun. */}
      <path d="M183 194 C 178 168 192 152 214 152 C 238 152 250 170 246 196" />
      <path d="M214 152 C 209 162 206 174 206 184" strokeWidth={1} />
      <path d="M244 182 C 262 180 272 196 262 210 C 252 222 234 218 231 204" />
      {/* Closed eye, brow, profile and mouth. */}
      <path d="M194 198 C 199 193 207 193 212 197" strokeWidth={1} />
      <path d="M193 188 C 198 183 207 183 213 186" strokeWidth={1} />
      <path d="M183 200 C 178 206 180 212 186 213" strokeWidth={1} />
      <path d="M188 220 C 193 217 198 218 201 221" strokeWidth={1} />
      <circle cx="232" cy="212" r="3.5" strokeWidth={1} />

      {/* Braid falling behind her shoulder. */}
      <path d="M258 206 C 272 236 276 286 270 330 C 265 366 270 396 276 420" />
      <path d="M267 246 l13 7 M266 286 l14 6 M268 326 l13 7 M271 366 l13 7" strokeWidth={1} />

      {/* Neck and shoulders. */}
      <path d="M202 237 C 202 246 203 252 205 258" />
      <path d="M222 235 C 222 244 222 250 221 256" />
      <path d="M205 258 C 190 262 178 272 172 288" />
      <path d="M221 256 C 238 260 250 272 256 290" />

      {/* Torso, falling into the drape. */}
      <path d="M172 288 C 164 320 162 360 168 400 C 172 428 178 452 186 468" />
      <path d="M256 290 C 266 330 268 380 262 424 C 258 452 250 472 238 484" />
      <path d="M196 330 C 214 322 236 324 250 334" strokeWidth={1} />
      <path d="M190 382 C 210 374 234 376 252 386" strokeWidth={1} />

      {/* Her right arm reaching up to hold the dandi. */}
      <path d="M172 288 C 152 292 132 296 116 306" />
      <path d="M177 303 C 159 307 143 311 127 319" />
      <path d="M114 300 C 105 302 102 313 110 318 C 119 323 127 316 125 307" strokeWidth={1.2} />

      {/* Her left arm coming down over the face of the gourd. */}
      <path d="M256 290 C 258 330 244 372 214 396" />
      <path d="M242 297 C 245 332 232 368 206 388" />
      <path d="M214 396 C 205 405 193 407 185 400" strokeWidth={1.2} />

      {/* Seated: knees and the lap closing under the gourd. */}
      <path d="M92 452 C 76 460 76 480 92 490" />
      <path d="M92 490 C 142 512 214 506 252 480" />
      <path d="M122 498 C 162 508 206 504 236 490" strokeWidth={1} />

      {/* ── The tanpura ── */}
      <ellipse cx="128" cy="452" rx="84" ry="76" transform="rotate(-10 128 452)" />
      <path d="M50 414 C 84 392 168 386 202 410" />
      <rect
        x="104"
        y="392"
        width="30"
        height="11"
        rx="2"
        transform="rotate(-10 119 397)"
      />
      <circle cx="138" cy="462" r="12" />
      <circle cx="138" cy="462" r="4.5" strokeWidth={1} />

      {/* Dandi and its frets. */}
      <path d="M111.3 380.4 L49.3 152.4" />
      <path d="M128.7 375.6 L66.7 147.6" />
      {FRETS.map((t) => (
        <path key={t} d={fret(t)} strokeWidth={1} />
      ))}

      {/* Drone strings, bridge to pegbox. */}
      <g strokeWidth={0.8}>
        <path d="M114 394 L54 162" />
        <path d="M119 393 L59 160" />
        <path d="M124 392 L64 159" />
      </g>

      {/* Pegbox and tuning pegs. */}
      <path d="M49.3 152.4 C 40 124 46 104 62 100 C 74 98 80 108 76 120 L66.7 147.6" />
      <g strokeWidth={1}>
        <path d="M52 138 l-15 -6" />
        <circle cx="35" cy="131" r="2.6" />
        <path d="M46 118 l-15 -6" />
        <circle cx="29" cy="111" r="2.6" />
        <path d="M74 132 l15 -7" />
        <circle cx="91" cy="124" r="2.6" />
        <path d="M76 112 l15 -7" />
        <circle cx="93" cy="104" r="2.6" />
      </g>

      {/* ── Foliage breaking around the base ── */}
      <g strokeWidth={1}>
        <path d="M62 542 C 38 520 34 478 58 452" />
        <path d="M58 452 C 42 458 34 478 44 494 C 60 488 66 468 58 452" />
        <path d="M50 496 C 34 504 28 524 40 538 C 54 530 60 510 50 496" />
        <path d="M74 526 C 90 518 104 526 106 542" />
        <path d="M106 542 C 92 544 78 538 74 526" />
        <path d="M248 538 C 272 514 274 476 252 452" />
        <path d="M252 452 C 268 460 276 480 266 496 C 250 490 244 468 252 452" />
        <path d="M260 494 C 276 502 282 522 270 536 C 256 528 250 508 260 494" />
        <path d="M196 550 C 200 530 214 518 230 520 C 220 536 208 546 196 550" />
      </g>
    </svg>
  );
}
