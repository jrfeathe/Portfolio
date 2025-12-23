"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import type { Route } from "next";
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

type SkimToggleButtonProps = {
  active: boolean;
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
  const [optimisticActive, setOptimisticActive] = useState(active);

  const label = useMemo(
    () => (optimisticActive ? skim.ariaDisable : skim.ariaEnable),
    [optimisticActive, skim.ariaDisable, skim.ariaEnable]
  );

  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

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
    () => buildNextUrl(active),
    [active, buildNextUrl]
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
    router.push(targetUrl as Route, { scroll: false });
    scheduleFallbackNavigation(targetUrl);
  };

  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center gap-3 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-text shadow-sm transition hover:bg-surface dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text",
        FOCUS_VISIBLE_RING,
        className
      )}
      aria-pressed={optimisticActive}
      aria-label={label}
      onClick={handleClick}
      onPointerEnter={prefetchNextUrl}
      onFocus={prefetchNextUrl}
      data-testid="skim-toggle"
    >
      <span aria-hidden>{optimisticActive ? skim.buttonLabelOn : skim.buttonLabelOff}</span>
      <span
        aria-hidden
        className="flex items-center gap-1 rounded-full border border-border bg-surface/80 px-2 py-1 text-xs font-semibold text-text dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text"
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
    </button>
  );
}
