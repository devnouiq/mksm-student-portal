"use client";

import { useEffect, useRef, useState } from "react";
import { PaintBrushBroad, Check } from "@phosphor-icons/react";
import {
  THEMES,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeId,
  type ThemeId,
} from "@/config/theme";
import { cn } from "@/lib/cn";

/**
 * Switches the portal theme by setting <html data-theme> and persisting the
 * choice per-browser. The pre-paint script in the root layout applies the
 * saved value on load; this control keeps React state in sync after mount.
 */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Read whatever the pre-paint script already applied.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (isThemeId(current)) setTheme(current);
  }, []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function apply(next: ThemeId) {
    setTheme(next);
    setOpen(false);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort; the choice still applies for this session.
    }
  }

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}. Change theme`}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm font-medium text-ink-700 shadow-card transition active:scale-[0.98] hover:bg-ink-100"
      >
        <PaintBrushBroad size={17} className="text-brand-600" />
        <span className="hidden sm:inline">{active.label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Choose a theme"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-pop"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Layout theme
          </p>
          {THEMES.map((t) => {
            const selected = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => apply(t.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition active:scale-[0.99]",
                  selected ? "bg-brand-50" : "hover:bg-ink-100",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                    selected ? "bg-brand-600 text-white" : "text-transparent",
                  )}
                >
                  <Check size={13} weight="bold" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      selected ? "text-brand-700" : "text-ink-900",
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
