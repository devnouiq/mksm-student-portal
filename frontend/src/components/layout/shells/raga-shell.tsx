"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, SignOut, X } from "@phosphor-icons/react";
import { navForRole, roleLabels } from "@/config/nav";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Brand } from "../brand";
import { LayoutSwitcher } from "../layout-switcher";
import type { ShellProps } from "./types";

/** The seven swaras — the signature ribbon of the Raga layout. Decorative. */
const SARGAM = ["सा", "रे", "ग", "म", "प", "ध", "नि"];

/**
 * Raga shell — editorial, music-led. Navigation runs horizontally across the
 * top as underlined tabs (no sidebar), a sargam ribbon sits beneath the brand,
 * and content is a single centred reading column. Grounded in North Indian
 * classical vocal practice rather than a generic warm template.
 */
export function RagaShell({ role, user, children }: ShellProps) {
  const items = navForRole(role);
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const tabs = items.map((item) => {
    const active = pathname.startsWith(item.href);
    const IconCmp = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition",
          active
            ? "border-brand-600 text-brand-700"
            : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-900",
        )}
      >
        <IconCmp
          size={17}
          weight={active ? "fill" : "regular"}
          className={active ? "text-brand-600" : "text-ink-400"}
        />
        {item.label}
      </Link>
    );
  });

  return (
    <div className="mksm-raga flex min-h-screen flex-col">
      <header className="mksm-topbar sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-md text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <List size={20} />
          </button>
          <Brand subtitle={`${roleLabels[role]} Portal`} />
          {/* Sargam ribbon — the seven swaras, the layout's signature. */}
          <ol
            className="mksm-sargam ml-2 hidden items-center gap-2 md:flex"
            aria-hidden
          >
            {SARGAM.map((s, i) => (
              <li
                key={s}
                className="mksm-sargam-swara font-display text-sm"
                style={{ animationDelay: `${i * 0.32}s` }}
              >
                {s}
              </li>
            ))}
          </ol>
          <div className="ml-auto flex items-center gap-3">
            <LayoutSwitcher />
            <span className="hidden items-center gap-2 sm:flex">
              <Avatar name={user.name} className="size-8 text-xs" />
              <span className="text-sm font-medium text-ink-800">
                {user.name.split(" ")[0]}
              </span>
            </span>
          </div>
        </div>

        {/* Horizontal tab nav — desktop */}
        <nav className="mx-auto hidden w-full max-w-6xl items-center gap-6 overflow-x-auto px-4 lg:flex lg:px-8">
          {tabs}
        </nav>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-pop">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Brand subtitle={`${roleLabels[role]} Portal`} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-md text-ink-500 hover:bg-ink-100"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {items.map((item) => {
                const active = pathname.startsWith(item.href);
                const IconCmp = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                    )}
                  >
                    <IconCmp
                      size={19}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-brand-600" : "text-ink-400"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-500 hover:bg-ink-100 hover:text-ink-800"
              >
                <SignOut size={18} />
                Switch role / Log out
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
