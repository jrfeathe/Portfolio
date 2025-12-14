"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import type { Route } from "next";
import {
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";
import { useMemo, useTransition } from "react";

import type { Locale } from "../utils/i18n";
import { getTopBarCopy } from "../utils/i18n";

type SkimToggleButtonProps = {
  active: boolean;
  className?: string;
  locale: Locale;
};

export function SkimToggleButton({ active, className, locale }: SkimToggleButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { skim } = getTopBarCopy(locale);

  const label = useMemo(
    () => (active ? skim.ariaDisable : skim.ariaEnable),
    [active, skim.ariaDisable, skim.ariaEnable]
  );

  const handleClick = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (active) {
        params.delete("skim");
      } else {
        params.set("skim", "1");
      }
      const nextSearch = params.toString();
      const basePath = pathname || "/";
      const nextUrl = (nextSearch ? `${basePath}?${nextSearch}` : basePath) as Route;
      router.replace(nextUrl, { scroll: false });
    });
  };

  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center gap-3 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-text shadow-sm transition hover:bg-surface dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text",
        FOCUS_VISIBLE_RING,
        className
      )}
      aria-pressed={active}
      aria-label={label}
      onClick={handleClick}
      disabled={isPending}
      data-testid="skim-toggle"
    >
      <span aria-hidden>{active ? skim.buttonLabelOn : skim.buttonLabelOff}</span>
      <span
        aria-hidden
        className="flex items-center gap-1 rounded-full border border-border bg-surface/80 px-2 py-1 text-xs font-semibold text-text dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text"
        data-skim-status-group="true"
      >
        <span
          className={clsx(
            "rounded-full px-3 py-1 transition",
            !active
              ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
              : "text-textMuted dark:text-dark-textMuted"
          )}
          data-active={!active ? "true" : "false"}
        >
          {skim.statusOff}
        </span>
        <span
          className={clsx(
            "rounded-full px-3 py-1 transition",
            active
              ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
              : "text-textMuted dark:text-dark-textMuted"
          )}
          data-active={active ? "true" : "false"}
        >
          {skim.statusOn}
        </span>
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
