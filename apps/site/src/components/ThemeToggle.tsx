"use client";

import { useEffect, useState } from "react";

import type { Locale } from "../utils/i18n";
import { getTopBarCopy } from "../utils/i18n";
import { type ThemePreference } from "../utils/theme";
import {
  SegmentedControl,
  type SegmentedControlOption
} from "./controls/SegmentedControl";

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

type ThemeToggleProps = {
  className?: string;
  locale: Locale;
};

export function ThemeToggle({ className, locale }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const { themeLabel, themeOptions } = getTopBarCopy(locale);
  const options: SegmentedControlOption<ThemePreference>[] = [
    { value: "light", label: `☀️`, testId: "theme-light" },
    { value: "system", label: themeOptions.system, testId: "theme-system" },
    { value: "dark", label: `🌙`, testId: "theme-dark" }
  ];

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

  const handleSelect = (next: ThemePreference) => {
    window.__portfolioTheme?.set(next);
    setTheme(next);
  };

  return (
    <SegmentedControl
      label={themeLabel}
      value={theme}
      options={options}
      onChange={handleSelect}
      className={className}
    />
  );
}
