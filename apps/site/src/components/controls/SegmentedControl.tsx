"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
  ariaLabel?: string;
  hint?: ReactNode;
  testId?: string;
};

export type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: SegmentedControlOption<Value>[];
  onChange: (value: Value) => void;
  onActiveSelect?: (value: Value) => void;
  className?: string;
  disabled?: boolean;
};

export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  onActiveSelect,
  className,
  disabled
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx(
        "flex items-center gap-1 rounded-full border border-border bg-surface/80 p-1 text-xs font-semibold text-textMuted dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-textMuted",
        className
      )}
      data-segmented="true"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.ariaLabel ?? option.label}
            disabled={disabled}
            data-testid={option.testId}
            className={clsx(
              "relative flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1 text-xs transition whitespace-nowrap",
              isActive
                ? "bg-accent text-accentOn shadow-sm dark:bg-dark-accent dark:text-dark-accentOn"
                : "text-textMuted hover:text-text dark:text-dark-textMuted dark:hover:text-dark-text",
              FOCUS_VISIBLE_RING
            )}
            onClick={() => {
              if (!isActive) {
                onChange(option.value);
              } else {
                onActiveSelect?.(option.value);
              }
            }}
            data-active={isActive ? "true" : "false"}
          >
            <span aria-hidden>{option.label}</span>
            {option.hint ? (
              <span aria-hidden className="text-[10px] font-normal uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
