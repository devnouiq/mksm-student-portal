import type { Metadata } from "next";
import { Brand } from "@/components/layout/brand";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { TanpuraArt } from "@/components/layout/tanpura-art";
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
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* ── Classic stage — a warm charcoal room under gold light, tanpura droning ── */}
      <section className="mksm-stage mksm-stage-classic relative flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 90% at 15% 0%, rgba(201,159,51,0.30) 0, transparent 55%), radial-gradient(90% 80% at 95% 100%, rgba(201,159,51,0.14) 0, transparent 50%)",
          }}
          aria-hidden
        />
        {/* Tanpura drone strings — faint vertical threads, the constant backdrop of the raga */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 43px, rgba(201,159,51,0.12) 43px 44px)",
          }}
          aria-hidden
        />
        {/* Tanpura — the drone instrument, its strings resonating on the stage */}
        <TanpuraArt className="pointer-events-none absolute -right-6 top-1/2 h-[27rem] w-auto -translate-y-1/2 text-[#e7c86a]/75 sm:right-2" />
        {/* Meend — a vocal glide between two swaras, drawn faint like sound in the air */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-28 h-44 w-full"
          viewBox="0 0 400 180"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path
            d="M-10 150 C 70 60 150 60 210 110 S 340 170 420 80"
            stroke="#c99f33"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="132" r="3" fill="#c99f33" fillOpacity="0.5" />
          <circle cx="404" cy="88" r="3" fill="#c99f33" fillOpacity="0.5" />
        </svg>
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
      <section className="relative flex flex-col bg-surface lg:items-center lg:justify-center lg:px-6 lg:py-12">
        <div className="absolute right-4 top-4 z-10">
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

        <div className="w-full max-w-sm px-6 pb-14 pt-9 lg:p-0">
          <SignInForm />
        </div>
      </section>
    </div>
  );
}
