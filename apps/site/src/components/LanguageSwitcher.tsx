"use client";

import { useTransition } from "react";
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
  locales,
  type Locale
} from "../utils/i18n";

type LanguageSwitcherProps = {
  className?: string;
};

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

    startTransition(() => {
      document.cookie = `${localeCookieName}=${nextLocale}; path=/`;
      router.replace(nextUrl);
    });
  };

  return (
    <label className={className}>
      <span className="sr-only">
        {label}
      </span>
      <select
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:border-borderMuted focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-borderMuted dark:focus:border-dark-focus"
        value={activeLocale}
        onChange={(event) => handleSelect(event.target.value as Locale)}
        disabled={isPending}
        aria-label={label}
      >
        {locales.map((locale) => {
          const { label, nativeLabel } = getLocaleLabel(locale);
          return (
            <option key={locale} value={locale}>
              {`${nativeLabel} · ${label}`}
            </option>
          );
        })}
      </select>
    </label>
  );
}
