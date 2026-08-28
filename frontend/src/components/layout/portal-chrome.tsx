"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "@/config/theme";
import { ClassicShell } from "./shells/classic-shell";
import { RagaShell } from "./shells/raga-shell";
import { StudioShell } from "./shells/studio-shell";
import type { ChromeUser } from "./shells/types";

const SHELLS = {
  classic: ClassicShell,
  raga: RagaShell,
  studio: StudioShell,
} as const;

/**
 * Chooses the layout shell from the active variant on <html data-theme>. The
 * pre-paint script sets that attribute before first paint; we render the
 * default shell on the server and during hydration, then swap to the selected
 * shell after mount so the server and client markup always match.
 */
export function PortalChrome({
  role,
  user,
  children,
}: {
  role: ChromeUser["role"];
  user: ChromeUser;
  children: React.ReactNode;
}) {
  const [variant, setVariant] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const apply = () => {
      const current = document.documentElement.getAttribute("data-theme");
      setVariant(isThemeId(current) ? current : DEFAULT_THEME);
    };
    apply();

    // The LayoutSwitcher mutates data-theme in place — follow it live.
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const Shell = SHELLS[variant] ?? ClassicShell;
  return (
    <Shell role={role} user={user}>
      {children}
    </Shell>
  );
}
