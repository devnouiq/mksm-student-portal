"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ChalkboardTeacher,
  ShieldStar,
  Warning,
  User,
  Lock,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import type { Role } from "@/data/types";
import { ButtonLink, Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/*
  PROTOTYPE sign-in only. Real authentication (password check, sessions,
  forgot-password) arrives in Milestone 2. Here we just match one of the demo
  identities (MKSM number or email) and route to that role's overview — any
  password is accepted.
*/
const DEMO: Record<string, { role: Role; overview: string }> = {
  "100428": { role: "student", overview: "/student/overview" },
  "melody@example.com": { role: "student", overview: "/student/overview" },
  "500112": { role: "teacher", overview: "/teacher/overview" },
  "guru@example.com": { role: "teacher", overview: "/teacher/overview" },
  "900001": { role: "admin", overview: "/admin/overview" },
  "admin@example.com": { role: "admin", overview: "/admin/overview" },
};

const roleEntries = [
  { href: "/student/overview", label: "Student", icon: GraduationCap },
  { href: "/teacher/overview", label: "Teacher", icon: ChalkboardTeacher },
  { href: "/admin/overview", label: "Admin", icon: ShieldStar },
];

export function SignInForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = identifier.trim().toLowerCase();
    const match = DEMO[key];
    if (!match) {
      setError(
        "Unknown demo login. Use MKSM 100428 (Student), 500112 (Teacher) or 900001 (Admin).",
      );
      return;
    }
    router.push(match.overview);
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="font-display text-2xl text-ink-900">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in with your MKSM number or email.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-label="Sign in">
        <Field label="MKSM number or email" htmlFor="identifier">
          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              id="identifier"
              name="identifier"
              autoComplete="username"
              placeholder="100428 or you@example.com"
              className="pl-10"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
              }}
            />
          </div>
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="px-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-700">
            <input
              type="checkbox"
              name="keep"
              className="size-4 rounded border-ink-300 accent-brand-600"
            />
            Keep me signed in
          </label>
          <a href="#" className="font-medium text-brand-700 hover:underline">
            Forgot password?
          </a>
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md bg-danger-100 px-3 py-2 text-sm text-danger-500"
          >
            <Warning size={16} className="mt-0.5 shrink-0" weight="fill" />
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-border" />
        OR JUMP STRAIGHT IN
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {roleEntries.map(({ href, label, icon: Icon }) => (
          <ButtonLink
            key={href}
            href={href}
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
          >
            <Icon size={20} weight="duotone" className="text-brand-600" />
            <span className="text-xs">{label}</span>
          </ButtonLink>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need help?{" "}
        <a href="#" className="font-medium text-brand-700 hover:underline">
          Contact support
        </a>
      </p>
    </div>
  );
}
