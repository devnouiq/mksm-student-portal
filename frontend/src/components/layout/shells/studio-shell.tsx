"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  List,
  MagnifyingGlass,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { navForRole, roleLabels } from "@/config/nav";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Brand } from "../brand";
import { LayoutSwitcher } from "../layout-switcher";
import type { ShellProps } from "./types";

/**
 * Studio shell — Apple-clean and spatial. A narrow floating icon rail replaces
 * the sidebar (labels appear on hover), a translucent toolbar lets content
 * scroll beneath it, and a Cmd/Ctrl-K command bar jumps between screens.
 */
export function StudioShell({ role, user, children }: ShellProps) {
  const items = navForRole(role);
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  // Cmd/Ctrl-K toggles the command palette from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Floating icon rail — desktop */}
      <aside className="mksm-rail sticky top-0 z-30 hidden h-screen shrink-0 flex-col items-center gap-1 px-3 py-4 lg:flex">
        <Link
          href={items[0]?.href ?? "/"}
          className="mksm-rail-tile mb-3 grid size-11 place-items-center rounded-2xl bg-brand-600 font-display text-lg font-semibold text-white"
          aria-label="MKSM home"
        >
          M
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const IconCmp = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative grid size-11 place-items-center rounded-2xl transition"
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-2xl transition",
                    active
                      ? "bg-brand-50 text-brand-600"
                      : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
                  )}
                >
                  <IconCmp size={21} weight={active ? "fill" : "regular"} />
                </span>
                {/* Hover label */}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-pop transition group-hover:block group-hover:opacity-100"
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/login"
          aria-label="Switch role or log out"
          className="group relative grid size-11 place-items-center rounded-2xl text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        >
          <SignOut size={21} />
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-pop transition group-hover:block group-hover:opacity-100"
          >
            Switch role / Log out
          </span>
        </Link>
      </aside>

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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
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
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Translucent toolbar — content scrolls beneath it */}
        <header className="mksm-topbar sticky top-0 z-20 flex h-16 items-center gap-3 px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-xl text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <List size={20} />
          </button>
          <div className="lg:hidden">
            <Brand subtitle={`${roleLabels[role]} Portal`} />
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm text-muted-foreground shadow-card transition hover:bg-surface"
          >
            <MagnifyingGlass size={16} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink-500 sm:inline">
              ⌘K
            </kbd>
          </button>
          <LayoutSwitcher />
          <Avatar name={user.name} className="size-8 text-xs" />
        </header>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      {paletteOpen ? (
        <CommandPalette
          role={role}
          onClose={() => setPaletteOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** Cmd-K jump-to menu over the role's own navigation. */
function CommandPalette({
  role,
  onClose,
}: {
  role: ShellProps["role"];
  onClose: () => void;
}) {
  const router = useRouter();
  const items = useMemo(() => navForRole(role), [role]);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[cursor];
      if (target) go(target.href);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-pop backdrop-blur"
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <MagnifyingGlass size={18} className="text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to…"
            aria-label="Search screens"
            className="h-12 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
            Esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No screens match “{query}”.
            </li>
          ) : (
            results.map((item, i) => {
              const IconCmp = item.icon;
              const active = i === cursor;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-700 hover:bg-ink-100",
                    )}
                  >
                    <IconCmp
                      size={18}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-brand-600" : "text-ink-400"}
                    />
                    {item.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
