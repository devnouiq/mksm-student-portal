import type { Metadata } from "next";
import { Brand } from "@/components/layout/brand";
import { LayoutSwitcher } from "@/components/layout/layout-switcher";
import { SargamWatermark } from "@/components/layout/sargam-watermark";
import { formatNumber } from "@/lib/format";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Brand panel — a warm stage under gold light, echoing the school itself */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex">
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
        {/* Ambient sargam — the ascending scale, large on the stage */}
        <SargamWatermark className="bottom-6 right-8 text-right text-[6rem] leading-[1.05] text-[#e7c86a]/[0.16]" />
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
        <div className="relative flex items-end gap-8">
          <div>
            <p className="font-display text-3xl">
              {formatNumber(30000)}
              <span className="text-brand-300"> / {formatNumber(50000)}</span>
            </p>
            <p className="text-sm text-white/60">Sankalp hours pledged</p>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center bg-surface px-6 py-12">
        <div className="absolute right-4 top-4">
          <LayoutSwitcher />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand subtitle="Student Portal" />
          </div>
          <SignInForm />
        </div>
      </section>
    </div>
  );
}
