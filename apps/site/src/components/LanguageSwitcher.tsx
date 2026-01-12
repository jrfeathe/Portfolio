"use client";

import { useMemo, useTransition } from "react";
import type { Route } from "next";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";

import {
  defaultLocale,
  getLanguageSwitcherLabel,
  getLocaleLabel,
  isLocale,
  localeCookieName,
  type Locale
} from "../utils/i18n";
import {
  SegmentedControl,
  type SegmentedControlOption
} from "./controls/SegmentedControl";

type LanguageSwitcherProps = {
  className?: string;
};

const LANGUAGE_ORDER: Locale[] = ["ja", "en", "zh"];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeParam = params?.locale;
  const activeLocale: Locale = Array.isArray(activeParam)
    ? (activeParam[0] as Locale)
    : isLocale(typeof activeParam === "string" ? activeParam : undefined)
      ? (activeParam as Locale)
      : defaultLocale;

  const label = getLanguageSwitcherLabel(activeLocale);
  const options = useMemo<SegmentedControlOption<Locale>[]>(() => {
    return LANGUAGE_ORDER.map((locale) => {
      const { label, nativeLabel } = getLocaleLabel(locale);
      return {
        value: locale,
        label: nativeLabel,
        ariaLabel: `${nativeLabel} · ${label}`
      };
    });
  }, []);

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === activeLocale) {
      return;
    }

    const segments = pathname.split("/");
    // pathname always starts with "/", so index 1 is the locale segment.
    segments[1] = nextLocale;
    const nextPath = segments.join("/") || "/";
    const search = searchParams.toString();
    const nextUrl = (search ? `${nextPath}?${search}` : nextPath) as Route;
    const themePreference = window.__portfolioTheme?.get?.() ?? "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme =
      themePreference === "system" ? (prefersDark ? "dark" : "light") : themePreference;
    const themeLocale = window.__portfolioThemeLocale?.get?.();
    const shouldSyncThemeLocale = themeLocale !== "dreamland";

    startTransition(() => {
      document.cookie = `${localeCookieName}=${nextLocale}; path=/`;
      if (shouldSyncThemeLocale && (resolvedTheme === "light" || resolvedTheme === "dark")) {
        window.__portfolioThemeLocale?.set(nextLocale);
      }
      router.replace(nextUrl);
    });
  };

  return (
    <SegmentedControl
      label={label}
      value={activeLocale}
      options={options}
      onChange={handleSelect}
      disabled={isPending}
      className={className}
    />
  );
}
