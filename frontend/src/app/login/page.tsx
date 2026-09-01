import type { Metadata } from "next";
import { Brand } from "@/components/layout/brand";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { SitarArt } from "@/components/layout/sitar-art";
import { StaffRibbon } from "@/components/layout/staff-ribbon";
import { WaterStain } from "@/components/layout/water-stain";
import { formatNumber } from "@/lib/format";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

/** The ascending scale — the aroha — climbing the Raga stage. */
const AROHA = ["सा", "रे", "ग", "म", "प", "ध", "नि", "सां"];

function SankalpCounter({ subdued = false }: { subdued?: boolean }) {
  return (
    <div className="relative">
      <p className="font-display text-3xl">
        {formatNumber(30000)}
        <span className="text-brand-300"> / {formatNumber(50000)}</span>
      </p>
      <p className={subdued ? "text-sm text-ink-500" : "text-sm text-white/60"}>
        Sankalp hours pledged
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative grid min-h-[100dvh] lg:grid-cols-2">
      {/* Wave divider — one normalised path, used both to clip the ivory panel
          and (visually) as the single boundary between dark and ivory. */}
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <clipPath id="mksm-wave" clipPathUnits="objectBoundingBox">
            <path d="M0.50,0 C0.49,0.18 0.585,0.4 0.51,0.56 C0.47,0.72 0.575,0.9 0.50,1 L1,1 L1,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Classic desktop stage — ONE full-bleed dark element. Its wavy right
          edge (mirrored by the ivory clip) is the ONLY divider: no straight
          seam, no middle band. Everything dark lives here. ── */}
      <div
        className="mksm-classic-bg pointer-events-none absolute inset-0 z-0 overflow-hidden bg-ink-900"
        aria-hidden
      >
        {/* Warm room light. One motivated source: it pools behind the body of
            the instrument so the sitar is lit from behind, with a little
            spill off the top-left wall and a floor bounce beneath. A vignette
            sits over all of it so the light reads as light and not as a patch
            — that is what keeps the falloff from showing an edge. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              // vignette, painted over the pools
              "radial-gradient(115% 95% at 34% 60%, transparent 40%, rgba(9,7,4,0.42) 100%)",
              // key light, behind and just above the gourd
              "radial-gradient(36% 42% at 39% 66%, rgba(216,193,146,0.20) 0%, rgba(206,183,136,0.11) 40%, rgba(198,175,128,0.04) 66%, transparent 84%)",
              // wall spill, pushed off-canvas so it never reads as a blob
              "radial-gradient(46% 38% at 2% -10%, rgba(196,173,126,0.10) 0, transparent 62%)",
              // floor bounce
              "radial-gradient(58% 30% at 28% 108%, rgba(196,173,126,0.09) 0, transparent 72%)",
            ].join(", "),
          }}
        />
        {/* Instrument strings — barely-there vertical threads for depth */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 46px, rgba(203,182,138,0.05) 46px 47px)",
          }}
        />
        {/* Sitar at the boundary, sitting high on the stage */}
        <SitarArt className="absolute bottom-[8%] left-[40%] h-[86%] w-auto -translate-x-1/2 rotate-[6deg] text-[#c9b48c]/65" />
        {/* Gold particles + a single rising note, restrained */}
        {[
          { top: "34%", left: "10%", s: 1.5 },
          { top: "60%", left: "33%", s: 2 },
          { top: "72%", left: "16%", s: 1.5 },
          { top: "26%", left: "25%", s: 1 },
        ].map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#d8c8a4]/35"
            style={{
              top: d.top,
              left: d.left,
              width: `${d.s * 2}px`,
              height: `${d.s * 2}px`,
            }}
          />
        ))}
        {/* Notes drifting up through the room — spread thin, kept clear of the
            headline and the counter so they read as air, not decoration. */}
        {[
          { glyph: "♪", top: "66%", left: "9%", size: "1.25rem", op: 0.35, dur: "7.5s", delay: "1.4s" },
          { glyph: "♫", top: "24%", left: "17%", size: "1rem", op: 0.28, dur: "8.5s", delay: "0s" },
          { glyph: "♩", top: "80%", left: "27%", size: "0.9rem", op: 0.22, dur: "9s", delay: "2.6s" },
          { glyph: "♪", top: "13%", left: "31%", size: "0.85rem", op: 0.2, dur: "8s", delay: "3.4s" },
          { glyph: "♬", top: "38%", left: "6%", size: "1.05rem", op: 0.26, dur: "10s", delay: "0.8s" },
          { glyph: "♪", top: "52%", left: "35%", size: "0.8rem", op: 0.18, dur: "9.5s", delay: "4.2s" },
        ].map((n, i) => (
          <span
            key={i}
            className="mksm-note absolute font-display leading-none"
            style={{
              top: n.top,
              left: n.left,
              fontSize: n.size,
              // The float keyframes drive `opacity`, so per-note weight has to
              // live in the colour instead.
              color: `rgba(216,200,164,${n.op})`,
              animationDuration: n.dur,
              animationDelay: n.delay,
            }}
          >
            {n.glyph}
          </span>
        ))}
      </div>

      {/* Classic ivory — full-bleed, clipped to the wave so it meets the dark on
          the centre line and the single boundary can cross 50/50. */}
      <div
        className="mksm-ivory-classic pointer-events-none absolute inset-0 z-0 bg-surface"
        style={{ clipPath: "url(#mksm-wave)" }}
        aria-hidden
      />

      {/* Classic-only decor (desktop). Full-bleed and clipped to the same wave
          as the ivory, so the ribbon can only ever start at the boundary — no
          part of it survives on the dark side. */}
      <div
        className="mksm-classic-decor pointer-events-none absolute inset-0 z-0"
        style={{ clipPath: "url(#mksm-wave)" }}
        aria-hidden
      >
        {/* Soft champagne spotlight behind the form. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(23% 42% at 80% 46%, rgba(214,199,163,0.10) 0, transparent 70%)",
          }}
        />
        {/* The phrase lifting off the divider and fading out over the middle of
            the ivory panel's top edge. */}
        <StaffRibbon
          className="absolute -top-[5%] left-[46%] h-[19%] w-[34%] text-[#c4ad7e]/80"
          lines={7}
        />
        {/* A few tiny, restrained notes riding the ribbon */}
        {[
          { glyph: "♪", top: "9%", left: "52%", size: "1.35rem", dur: "7s", delay: "0s" },
          { glyph: "♫", top: "6.5%", left: "57%", size: "1.05rem", dur: "6.5s", delay: "1s" },
          { glyph: "♩", top: "3.5%", left: "62%", size: "0.9rem", dur: "7.5s", delay: "2.1s" },
        ].map((n, i) => (
          <span
            key={i}
            className="mksm-note absolute font-display text-[#c4ad7e]/55"
            style={{
              top: n.top,
              left: n.left,
              fontSize: n.size,
              animationDuration: n.dur,
              animationDelay: n.delay,
            }}
          >
            {n.glyph}
          </span>
        ))}
        {/* Bottom-right corner: paper that got wet and dried, tide lines and all */}
        <WaterStain className="absolute bottom-0 right-0 h-[38%] w-[20%]" />
      </div>

      {/* ── Classic stage content (transparent, sitting over the dark) ── */}
      <section className="mksm-stage mksm-stage-classic relative z-10 flex-col justify-between overflow-hidden p-10 text-white">
        <Brand
          className="relative [&_span]:text-white"
          subtitle="Mahesh Kale School of Music"
        />
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight">
            Spreading love through music,{" "}
            <em className="not-italic text-brand-300">one note at a time.</em>
          </h1>
          <p className="mt-4 text-white/70">
            One portal for students, teachers and admins — courses, practice
            material, homework and the school-wide{" "}
            <span className="text-white">Sankalp</span> practice pledge.
          </p>
        </div>
        <div className="relative">
          <SankalpCounter />
        </div>
      </section>

      {/* ── Raga stage — indigo night, the aroha climbing the scale swara by swara ── */}
      <section
        className="mksm-stage mksm-stage-raga relative flex-col justify-between overflow-hidden p-10 text-white"
        style={{
          backgroundImage:
            "linear-gradient(158deg, #14102a 0%, #2b224d 48%, #4c3a8a 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(90% 70% at 85% 8%, rgba(227,156,22,0.22) 0, transparent 55%), radial-gradient(80% 80% at 10% 100%, rgba(133,116,207,0.30) 0, transparent 55%)",
          }}
          aria-hidden
        />
        {/* Aroha — the ascending scale, climbing bottom-left to top-right, lit in sequence */}
        <ol
          className="pointer-events-none absolute inset-0 font-display"
          aria-hidden
        >
          {AROHA.map((s, i) => (
            <li
              key={s}
              className="mksm-aroha-swara absolute"
              style={{
                left: `${33 + i * 8}%`,
                bottom: `${11 + i * 10.2}%`,
                fontSize: `${2.2 + i * 0.3}rem`,
                animationDelay: `${i * 0.34}s`,
              }}
            >
              {s}
            </li>
          ))}
        </ol>
        {/* Tanpura string that ties the ascent together, faint at the right edge */}
        <span
          className="pointer-events-none absolute right-10 top-0 h-full w-px bg-gradient-to-b from-transparent via-saffron-300/25 to-transparent"
          aria-hidden
        />
        <Brand
          className="relative [&_span]:text-white"
          subtitle="Mahesh Kale School of Music"
        />
        <div className="relative max-w-md">
          <p className="mb-3 font-display text-lg tracking-wide text-saffron-300">
            आरोह · the ascending scale
          </p>
          <h1 className="font-display text-4xl leading-tight">
            Every raga begins with a single{" "}
            <em className="not-italic text-saffron-300">swara.</em>
          </h1>
          <p className="mt-4 text-white/70">
            Courses, practice material, homework and the school-wide{" "}
            <span className="text-white">Sankalp</span> pledge — for students,
            teachers and admins alike.
          </p>
        </div>
        <div className="relative">
          <SankalpCounter />
        </div>
      </section>

      {/* ── Studio stage — light, minimal, typographic; no instrument, just space ── */}
      <section className="mksm-stage mksm-stage-studio relative flex-col justify-between overflow-hidden bg-[#f5f5f7] p-12 text-ink-900">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(70% 55% at 80% 12%, rgba(0,113,227,0.10) 0, transparent 60%)",
          }}
          aria-hidden
        />
        <Brand className="relative" subtitle="Mahesh Kale School of Music" />
        <div className="relative max-w-lg">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Practice,
            <br />
            <span className="text-brand-600">beautifully organised.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-500">
            One clean workspace for courses, practice material, homework and the
            school-wide Sankalp pledge.
          </p>
        </div>
        <div className="relative">
          <SankalpCounter subdued />
        </div>
      </section>

      {/* ── Form panel — shared across all stages ── */}
      <section className="relative flex flex-col overflow-hidden lg:items-center lg:justify-center lg:px-6 lg:py-12">
        {/* Ivory background. Plain for mobile + Raga/Studio; clipped to the wave
            for Classic desktop so the single dark boundary shows through. */}
        <div className="mksm-ivory pointer-events-none absolute inset-0 bg-surface" aria-hidden />
        <div className="absolute right-4 top-4 z-50">
          <LayoutSwitcher />
        </div>
        {/* Mobile hero — full-bleed branded header (the lg stage is hidden below
            lg), so mobile keeps each theme's identity and reads as one screen. */}
        <div className="lg:hidden">
          {/* Classic — charcoal + gold, drone strings, meend wave */}
          <div className="mksm-mhero mksm-mhero-classic relative overflow-hidden bg-ink-900 px-6 pb-9 pt-14 text-white">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent 0 28px, rgba(201,159,51,0.14) 28px 29px), radial-gradient(120% 90% at 12% 0%, rgba(201,159,51,0.28) 0, transparent 60%)",
                }}
                aria-hidden
              />
              <Brand className="relative [&_span]:text-white" subtitle="Student Portal" />
              <p className="relative mt-3 font-display text-lg leading-snug">
                Spreading love through music,{" "}
                <em className="not-italic text-brand-300">one note at a time.</em>
              </p>
              <svg
                className="pointer-events-none absolute inset-x-0 -bottom-1 h-12 w-full"
                viewBox="0 0 400 60"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden
              >
                <path
                  d="M-10 44 C 70 8 150 8 210 30 S 340 58 420 20"
                  stroke="#c99f33"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Raga — indigo night, the aroha climbing in a row */}
            <div
              className="mksm-mhero mksm-mhero-raga relative overflow-hidden px-6 pb-9 pt-14 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(158deg, #14102a 0%, #2b224d 55%, #4c3a8a 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(90% 80% at 88% 6%, rgba(227,156,22,0.24) 0, transparent 55%)",
                }}
                aria-hidden
              />
              <Brand className="relative [&_span]:text-white" subtitle="Student Portal" />
              <ol
                className="relative mt-4 flex items-end gap-2 font-display"
                aria-hidden
              >
                {AROHA.map((s, i) => (
                  <li
                    key={s}
                    className="mksm-aroha-swara"
                    style={{
                      fontSize: `${1 + i * 0.14}rem`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ol>
              <p className="relative mt-3 text-sm text-white/75">
                <span className="text-saffron-300">आरोह</span> — every raga begins
                with a single swara.
              </p>
            </div>

          {/* Studio — light, minimal, blue */}
          <div className="mksm-mhero mksm-mhero-studio relative overflow-hidden border-b border-border bg-[#f5f5f7] px-6 pb-9 pt-14 text-ink-900">
            <Brand subtitle="Student Portal" />
            <p className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight">
              Practice,{" "}
              <span className="text-brand-600">beautifully organised.</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm px-6 pb-14 pt-9 lg:p-0">
          <SignInForm />
        </div>
      </section>
    </div>
  );
}
