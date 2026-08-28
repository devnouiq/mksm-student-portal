import type { Metadata } from "next";
import { Brand } from "@/components/layout/brand";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { formatNumber } from "@/lib/format";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-600 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0, transparent 45%)",
          }}
          aria-hidden
        />
        <Brand
          className="[&_span]:text-white"
          subtitle="Mahesh Kale School of Music"
        />
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight">
            Learn, practice, and grow your{" "}
            <em className="not-italic underline decoration-white/40 underline-offset-4">
              Sankalp
            </em>
            .
          </h1>
          <p className="mt-4 text-brand-100">
            One portal for students, teachers and admins — courses, practice
            material, homework and the school-wide practice pledge.
          </p>
        </div>
        <div className="relative flex items-end gap-8">
          <div>
            <p className="font-display text-3xl">
              {formatNumber(30000)}
              <span className="text-brand-200"> / {formatNumber(50000)}</span>
            </p>
            <p className="text-sm text-brand-100">Sankalp hours pledged</p>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center bg-surface px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeSwitcher />
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
