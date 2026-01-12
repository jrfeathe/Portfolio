"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import clsx from "clsx";

import { getDictionary } from "../utils/dictionaries";
import { getLocaleLabel, locales, type Locale } from "../utils/i18n";
import {
  getNextTheme,
  isThemeLocale,
  type ThemeLocale,
  type ThemePreference
} from "../utils/theme";
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

function readThemeLocale(fallback: ThemeLocale): ThemeLocale {
  if (typeof window === "undefined") {
    return fallback;
  }
  const api = window.__portfolioThemeLocale;
  if (!api) {
    return fallback;
  }
  const value = api.get();
  return isThemeLocale(value) ? value : fallback;
}

type ThemeToggleProps = {
  className?: string;
  locale: Locale;
};

export function ThemeToggle({ className, locale }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [themeLocale, setThemeLocale] = useState<ThemeLocale>(locale);
  const [prefersDark, setPrefersDark] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const themePickerId = useId();
  const trayRef = useRef<HTMLDivElement | null>(null);
  const { themeToggle } = getDictionary(locale);
  const {
    label: themeLabel,
    options: themeOptions,
    cycleLabel,
    pickerLabel,
    pickerOptions
  } = themeToggle;
  const options: SegmentedControlOption<ThemePreference>[] = [
    { value: "light", label: `☀️`, testId: "theme-light" },
    { value: "system", label: themeOptions.system, testId: "theme-system" },
    { value: "dark", label: `🌙`, testId: "theme-toggle" }
  ];

  useEffect(() => {
    setTheme(readTheme());
    setThemeLocale(readThemeLocale(locale));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDark(media.matches);
    const handleChange = () => {
      setPrefersDark(media.matches);
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
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(pointer: coarse)");
    const handleChange = () => setIsCoarsePointer(media.matches);
    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener?.(handleChange);
    return () => media.removeListener?.(handleChange);
  }, []);

  useEffect(() => {
    if (!isCoarsePointer || !isTrayOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!trayRef.current) {
        return;
      }
      if (trayRef.current.contains(event.target as Node)) {
        return;
      }
      setIsTrayOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isCoarsePointer, isTrayOpen]);

  const handleSelect = (next: ThemePreference) => {
    window.__portfolioTheme?.set(next);
    setTheme(next);
    if (next !== "dark" && themeLocale === "dreamland") {
      window.__portfolioThemeLocale?.set(locale);
      setThemeLocale(locale);
    }
  };

  const cycleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : getNextTheme(current);
      window.__portfolioTheme?.set(next);
      if (next !== "dark" && themeLocale === "dreamland") {
        window.__portfolioThemeLocale?.set(locale);
        setThemeLocale(locale);
      }
      return next;
    });
  };

  const handleTrayIntent = () => {
    if (isCoarsePointer) {
      setIsTrayOpen(true);
    }
  };

  const handleThemeLocaleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;

    if (nextValue === "dark") {
      window.__portfolioThemeLocale?.set(locale);
      setThemeLocale(locale);
      window.__portfolioTheme?.set("dark");
      setTheme("dark");
      return;
    }

    if (nextValue === "dreamland") {
      window.__portfolioThemeLocale?.set("dreamland");
      setThemeLocale("dreamland");
      window.__portfolioTheme?.set("dark");
      setTheme("dark");
      return;
    }

    if (isThemeLocale(nextValue)) {
      window.__portfolioThemeLocale?.set(nextValue);
      setThemeLocale(nextValue);
    } else {
      window.__portfolioThemeLocale?.set(locale);
      setThemeLocale(locale);
    }

    window.__portfolioTheme?.set("light");
    setTheme("light");
  };

  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  const themePickerValue =
    themeLocale === "dreamland"
      ? "dreamland"
      : resolvedTheme === "dark"
        ? "dark"
        : themeLocale;
  const trayPinned = isCoarsePointer && isTrayOpen;

  return (
    <>
      <div
        ref={trayRef}
        className={clsx("group", className, trayPinned && "pb-12")}
        onPointerDown={handleTrayIntent}
        onFocusCapture={handleTrayIntent}
      >
        <div className="relative">
          <SegmentedControl
            label={themeLabel}
            value={theme}
            options={options}
            onChange={handleSelect}
            onActiveSelect={cycleTheme}
            className="w-full"
          />
          <div
            className={clsx(
              "pointer-events-none invisible absolute left-0 right-0 top-full z-10 translate-y-1 pt-2 opacity-0 transition duration-200 ease-out",
              "group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
              "group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
              trayPinned && "pointer-events-auto visible translate-y-0 opacity-100"
            )}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-surface/90 px-3 py-2 text-xs font-semibold text-textMuted shadow-lg ring-1 ring-border/20 backdrop-blur-sm dark:border-dark-border/60 dark:bg-dark-surface/90 dark:text-dark-textMuted dark:ring-dark-border/20">
              <label htmlFor={themePickerId} className="text-[11px] font-semibold">
                {pickerLabel}
              </label>
              <select
                id={themePickerId}
                value={themePickerValue}
                onChange={handleThemeLocaleSelect}
                className="max-w-[100px] truncate rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border dark:bg-dark-background dark:text-dark-text dark:hover:border-dark-accent dark:focus-visible:ring-dark-accent/40"
                aria-label={pickerLabel}
              >
                {locales.map((value) => {
                  const { nativeLabel } = getLocaleLabel(value);
                  return (
                    <option key={value} value={value}>
                      ☀️ {nativeLabel}
                    </option>
                  );
                })}
                <option value="dark" aria-label={themeOptions.dark}>
                  🌙
                </option>
                <option value="dreamland">{pickerOptions.dreamland}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        data-testid="theme-toggle-cycle"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onClick={cycleTheme}
      >
        {cycleLabel}
      </button>
    </>
  );
}
