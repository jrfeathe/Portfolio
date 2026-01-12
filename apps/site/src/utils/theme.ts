import { isLocale, type Locale } from "./i18n";

export type ThemePreference = "light" | "dark" | "system";

export const themeCookieName = "portfolio-theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export type ThemeLocale = Locale | "dreamland";

export const themeLocaleCookieName = "portfolio-theme-locale";

export function isThemeLocale(value: unknown): value is ThemeLocale {
  return typeof value === "string" && (isLocale(value) || value === "dreamland");
}

const THEME_CYCLE: ThemePreference[] = ["system", "dark", "light"];

export function getNextTheme(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current);
  if (index === -1) {
    return "system";
  }
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}
