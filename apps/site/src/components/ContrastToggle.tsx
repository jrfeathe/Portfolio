"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import {
  getNextContrast,
  type ContrastPreference
} from "../utils/contrast";

const CONTRAST_LABELS: Record<ContrastPreference, string> = {
  system: "System",
  high: "High",
  standard: "Standard"
};

const CONTRAST_ICONS: Record<ContrastPreference, string> = {
  system: "🎚️",
  high: "✨",
  standard: "◻️"
};

function readContrast(): ContrastPreference {
  if (typeof window === "undefined") {
    return "system";
  }
  const api = window.__portfolioContrast;
  if (!api) {
    return "system";
  }
  const value = api.get();
  return value === "high" || value === "standard" ? value : "system";
}

export function ContrastToggle({ className }: { className?: string }) {
  const [contrast, setContrast] = useState<ContrastPreference>("system");

  useEffect(() => {
    setContrast(readContrast());

    const media = window.matchMedia("(prefers-contrast: more)");
    const handleChange = () => {
      const stored = window.__portfolioContrast?.get();
      if (!stored || stored === "system") {
        setContrast("system");
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
    () => `Switch contrast mode (currently ${CONTRAST_LABELS[contrast]})`,
    [contrast]
  );

  const handleClick = () => {
    const next = getNextContrast(contrast);
    window.__portfolioContrast?.set(next);
    setContrast(next);
  };

  return (
    <button
      type="button"
      data-testid="contrast-toggle"
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
        {CONTRAST_ICONS[contrast]}
      </span>
      <span aria-hidden>{CONTRAST_LABELS[contrast]}</span>
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
