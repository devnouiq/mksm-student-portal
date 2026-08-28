import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  THEMES,
  isThemeId,
} from "./theme";

/*
  The layout variant is the switch behind all three shells (Classic sidebar /
  Raga top-nav / Studio icon-rail). These tests pin the two pieces that run
  before React does: the id guard the switcher trusts, and the pre-paint script
  that must never throw and must always land on a known variant (no FOUC, no
  crash on a hostile localStorage).
*/

describe("isThemeId", () => {
  it("accepts every declared variant id", () => {
    for (const t of THEMES) {
      expect(isThemeId(t.id)).toBe(true);
    }
  });

  it("rejects unknown or malformed values", () => {
    for (const bad of ["", "dark", "Classic", "raga ", "sidebar"]) {
      expect(isThemeId(bad)).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    for (const bad of [null, undefined, 0, 1, {}, [], true]) {
      expect(isThemeId(bad)).toBe(false);
    }
  });
});

/**
 * Runs the inlined pre-paint script in a sandbox that mimics <head>, returning
 * the value it wrote to <html data-theme>. `localStorage` and `document` are
 * free variables in the script, so they bind to the injected parameters.
 */
function runInitScript(opts: {
  stored?: string | null;
  throwing?: boolean;
}): string | undefined {
  let applied: string | undefined;
  const doc = {
    documentElement: {
      setAttribute(name: string, value: string) {
        if (name === "data-theme") applied = value;
      },
    },
  };
  const storage = opts.throwing
    ? {
        getItem() {
          throw new Error("localStorage blocked");
        },
      }
    : { getItem: () => opts.stored ?? null };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function("document", "localStorage", THEME_INIT_SCRIPT);
  fn(doc, storage);
  return applied;
}

describe("THEME_INIT_SCRIPT", () => {
  it("applies a valid stored variant", () => {
    expect(runInitScript({ stored: "raga" })).toBe("raga");
    expect(runInitScript({ stored: "studio" })).toBe("studio");
  });

  it("falls back to the default for an unknown stored value", () => {
    expect(runInitScript({ stored: "neon" })).toBe(DEFAULT_THEME);
  });

  it("falls back to the default when nothing is stored", () => {
    expect(runInitScript({ stored: null })).toBe(DEFAULT_THEME);
  });

  it("never throws and still applies the default when storage is blocked", () => {
    expect(() => runInitScript({ throwing: true })).not.toThrow();
    expect(runInitScript({ throwing: true })).toBe(DEFAULT_THEME);
  });

  it("reads from the shared storage key", () => {
    expect(THEME_INIT_SCRIPT).toContain(JSON.stringify(THEME_STORAGE_KEY));
  });
});
