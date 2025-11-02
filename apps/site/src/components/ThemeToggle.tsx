"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import {
  getNextTheme,
  type ThemePreference
} from "../utils/theme";

const THEME_LABELS: Record<ThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark"
};

const THEME_ICONS: Record<ThemePreference, string> = {
  system: "🌀",
  light: "🌞",
  dark: "🌙"
};

function readTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }
  const api = window.__portfolioTheme;
  if (!api) {
    return "system";
  }
  const value = api.get();
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    setTheme(readTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const stored = window.__portfolioTheme?.get();
      if (!stored || stored === "system") {
        setTheme("system");
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener?.(handleChange);
    return () => media.removeListener?.(handleChange);
  }, []);

  const buttonLabel = useMemo(
    () => `Switch color theme (currently ${THEME_LABELS[theme]})`,
    [theme]
  );

  const handleClick = () => {
    const next = getNextTheme(theme);
    window.__portfolioTheme?.set(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted",
        FOCUS_VISIBLE_RING,
        className
      )}
      onClick={handleClick}
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      <span aria-hidden className="text-base">
        {THEME_ICONS[theme]}
      </span>
      <span aria-hidden>{THEME_LABELS[theme]}</span>
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
