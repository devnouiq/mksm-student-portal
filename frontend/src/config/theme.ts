/*
  Portal theme options. The active theme is stored on <html data-theme="...">
  and persisted per-browser in localStorage. Token values for each theme live
  in globals.css under matching :root[data-theme="..."] blocks.
*/

export type ThemeId = "classic" | "raga" | "studio";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  blurb: string;
}

export const THEMES: ThemeOption[] = [
  { id: "classic", label: "Classic", blurb: "MKSM red · serif" },
  { id: "raga", label: "Raga", blurb: "Warm saffron · editorial" },
  { id: "studio", label: "Studio", blurb: "Cool minimal · Apple-clean" },
];

export const DEFAULT_THEME: ThemeId = "classic";
export const THEME_STORAGE_KEY = "mksm-theme";

const THEME_IDS = THEMES.map((t) => t.id);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.includes(value as ThemeId);
}

// Runs before first paint (inlined in <head>). Kept dependency-free and guarded
// so a blocked/throwing localStorage never breaks rendering.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var ok=${JSON.stringify(
  THEME_IDS,
)}.indexOf(t)>-1;document.documentElement.setAttribute("data-theme",ok?t:${JSON.stringify(
  DEFAULT_THEME,
)});}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(
  DEFAULT_THEME,
)});}})();`;
