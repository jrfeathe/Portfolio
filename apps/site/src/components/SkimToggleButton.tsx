"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";
import {
  usePathname,
  useSearchParams
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type { Locale } from "../utils/i18n";
import { getDictionary } from "../utils/dictionaries";
import { buildSkimToggleUrl, setSkimMode, useSkimMode } from "../utils/skim-mode";

const TOGGLE_COOLDOWN_MS = 300;

type SkimToggleButtonProps = {
  active?: boolean;
  className?: string;
  locale: Locale;
};

export function SkimToggleButton({ active, className, locale }: SkimToggleButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skim = getDictionary(locale).skimToggle;
  const skimActive = useSkimMode();
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const resolvedActive =
    typeof active === "boolean" ? active : (hydrated ? skimActive : false);
  const [optimisticActive, setOptimisticActive] = useState(resolvedActive);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

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
      if (cooldownTimerRef.current !== null) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, []);

  const targetUrl = useMemo(
    () => buildSkimToggleUrl(optimisticActive, pathname || "/", searchParams?.toString()),
    [optimisticActive, pathname, searchParams]
  );

  const handleClick = () => {
    if (isCoolingDown) {
      return;
    }
    const nextActive = !optimisticActive;
    setOptimisticActive(nextActive);
    setSkimMode(nextActive);
    setIsCoolingDown(true);
    if (cooldownTimerRef.current !== null) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setTimeout(() => {
      setIsCoolingDown(false);
      cooldownTimerRef.current = null;
    }, TOGGLE_COOLDOWN_MS);
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
      aria-disabled={isCoolingDown}
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
        event.preventDefault();
        if (isCoolingDown) {
          return;
        }
        handleClick();
      }}
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
