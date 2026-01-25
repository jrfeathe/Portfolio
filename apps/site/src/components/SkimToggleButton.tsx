"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type { Locale } from "../utils/i18n";
import { getDictionary } from "../utils/dictionaries";
import { isTruthySkimValue } from "../utils/skim";

type SkimToggleButtonProps = {
  active?: boolean;
  className?: string;
  locale: Locale;
};

export function SkimToggleButton({ active, className, locale }: SkimToggleButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skim = getDictionary(locale).skimToggle;
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedUrlRef = useRef<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const resolvedActive = useMemo(() => {
    if (typeof active === "boolean") {
      return active;
    }
    if (!hydrated) {
      return false;
    }
    const values = searchParams?.getAll("skim") ?? [];
    if (!values.length) {
      return false;
    }
    return values.some((value) => isTruthySkimValue(value));
  }, [active, hydrated, searchParams]);
  const [optimisticActive, setOptimisticActive] = useState(resolvedActive);

  const label = useMemo(
    () => (optimisticActive ? skim.ariaDisable : skim.ariaEnable),
    [optimisticActive, skim.ariaDisable, skim.ariaEnable]
  );

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      return;
    }
    setOptimisticActive(resolvedActive);
  }, [hydrated, resolvedActive]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  const buildNextUrl = useCallback((currentActive: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (currentActive) {
      params.delete("skim");
    } else {
      params.set("skim", "1");
    }
    const nextSearch = params.toString();
    const basePath = pathname || "/";
    return nextSearch ? `${basePath}?${nextSearch}` : basePath;
  }, [pathname, searchParams]);

  const targetUrl = useMemo(
    () => buildNextUrl(resolvedActive),
    [resolvedActive, buildNextUrl]
  );

  const prefetchNextUrl = useCallback(() => {
    if (!targetUrl || prefetchedUrlRef.current === targetUrl) {
      return;
    }
    prefetchedUrlRef.current = targetUrl;
    router.prefetch(targetUrl as Route);
  }, [router, targetUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
    }).connection;
    if (connection?.saveData) {
      return;
    }
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) {
      return;
    }

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetchNextUrl, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetchNextUrl, 250);
    return () => clearTimeout(id);
  }, [prefetchNextUrl, targetUrl]);

  const scheduleFallbackNavigation = (nextUrl: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const target = new URL(nextUrl, window.location.origin);
    const targetKey = `${target.pathname}${target.search}${target.hash}`;

    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
    }

    fallbackTimerRef.current = setTimeout(() => {
      const currentKey = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentKey !== targetKey) {
        window.location.assign(target.toString());
      }
    }, 2500);
  };

  const handleClick = () => {
    setOptimisticActive((current) => !current);
    scheduleFallbackNavigation(targetUrl);
  };

  return (
    <Link
      href={targetUrl as Route}
      scroll={false}
      prefetch={false}
      className={clsx(
        "inline-flex items-center gap-3 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-text shadow-sm transition hover:bg-surface dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text",
        "flex-nowrap whitespace-nowrap",
        FOCUS_VISIBLE_RING,
        className
      )}
      role="button"
      aria-pressed={optimisticActive}
      aria-label={label}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }
        handleClick();
      }}
      onPointerEnter={prefetchNextUrl}
      onFocus={prefetchNextUrl}
      data-testid="skim-toggle"
    >
      <span aria-hidden className="whitespace-nowrap">
        {optimisticActive ? skim.buttonLabelOn : skim.buttonLabelOff}
      </span>
      <span
        aria-hidden
        className="flex items-center gap-1 rounded-full border border-border bg-surface/80 px-2 py-1 text-xs font-semibold text-text dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text whitespace-nowrap shrink-0"
        data-skim-status-group="true"
      >
        <span
          className={clsx(
            "rounded-full px-3 py-1 transition",
            !optimisticActive
              ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
              : "text-textMuted dark:text-dark-textMuted"
          )}
          data-active={!optimisticActive ? "true" : "false"}
        >
          {skim.statusOff}
        </span>
        <span
          className={clsx(
            "rounded-full px-3 py-1 transition",
            optimisticActive
              ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
              : "text-textMuted dark:text-dark-textMuted"
          )}
          data-active={optimisticActive ? "true" : "false"}
        >
          {skim.statusOn}
        </span>
      </span>
      <span className="sr-only">{label}</span>
    </Link>
  );
}
