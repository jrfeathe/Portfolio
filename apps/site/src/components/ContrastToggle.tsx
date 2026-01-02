"use client";

import { useEffect, useState } from "react";

import type { Locale } from "../utils/i18n";
import { getDictionary } from "../utils/dictionaries";
import { getNextContrast, type ContrastPreference } from "../utils/contrast";
import {
  SegmentedControl,
  type SegmentedControlOption
} from "./controls/SegmentedControl";

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

type ContrastToggleProps = {
  className?: string;
  locale: Locale;
};

export function ContrastToggle({ className, locale }: ContrastToggleProps) {
  const [contrast, setContrast] = useState<ContrastPreference>("system");
  const { contrastToggle } = getDictionary(locale);
  const { label: contrastLabel, options: contrastOptions, cycleLabel } = contrastToggle;
  const options: SegmentedControlOption<ContrastPreference>[] = [
    { value: "standard", label: contrastOptions.standard, testId: "contrast-standard" },
    { value: "system", label: contrastOptions.system, testId: "contrast-system" },
    { value: "high", label: contrastOptions.high, testId: "contrast-toggle" }
  ];

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

  const handleSelect = (next: ContrastPreference) => {
    window.__portfolioContrast?.set(next);
    setContrast(next);
  };

  const cycleContrast = () => {
    setContrast((current) => {
      const next = current === "standard" ? "high" : getNextContrast(current);
      window.__portfolioContrast?.set(next);
      return next;
    });
  };

  return (
    <>
      <SegmentedControl
        label={contrastLabel}
        value={contrast}
        options={options}
        onChange={handleSelect}
        onActiveSelect={cycleContrast}
        className={className}
      />
      <button
        type="button"
        data-testid="contrast-toggle-cycle"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onClick={cycleContrast}
      >
        {cycleLabel}
      </button>
    </>
  );
}
