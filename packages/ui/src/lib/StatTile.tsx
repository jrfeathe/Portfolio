import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import clsx from "clsx";

type TrendDirection = "up" | "down" | "neutral";

export type StatTileTrend = {
  direction: TrendDirection;
  label: string;
};

export type StatTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  trend?: StatTileTrend;
  icon?: ReactNode;
  footer?: ReactNode;
};

const TREND_ICONS: Record<TrendDirection, JSX.Element> = {
  up: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      focusable="false"
      className="h-4 w-4 stroke-current"
    >
      <path
        d="M4 12.5 8.586 8 12 11.414 17 6.5"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6.5h3v3"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  down: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      focusable="false"
      className="h-4 w-4 stroke-current"
    >
      <path
        d="M4 7.5 8.586 12 12 8.586 17 13.5"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 13.5h3v-3"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  neutral: (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      focusable="false"
      className="h-4 w-4 stroke-current"
    >
      <path
        d="M4 10h12"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
};

export function StatTile({
  label,
  value,
  trend,
  description,
  icon,
  footer,
  className,
  ...props
}: StatTileProps) {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={clsx(
        "flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md dark:border-dark-border dark:bg-dark-surface",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            id={labelId}
            className="text-sm font-medium text-textMuted dark:text-dark-textMuted"
          >
            {label}
          </p>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-text dark:text-dark-text">
            {value}
          </div>
        </div>
        {icon ? (
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surfaceMuted text-text dark:bg-dark-surfaceMuted dark:text-dark-text"
          >
            {icon}
          </span>
        ) : null}
      </div>
      {trend ? (
        <div
          className={clsx(
            "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            trend.direction === "up" &&
              "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn",
            trend.direction === "down" &&
              "bg-danger text-surface dark:bg-dark-danger dark:text-dark-surface",
            trend.direction === "neutral" &&
              "bg-surfaceMuted text-text dark:bg-dark-surfaceMuted dark:text-dark-text"
          )}
        >
          <span aria-hidden className="h-4 w-4 text-current">
            {TREND_ICONS[trend.direction]}
          </span>
          <span>{trend.label}</span>
        </div>
      ) : null}
      {description ? (
        <p className="mt-3 text-sm text-textMuted dark:text-dark-textMuted">
          {description}
        </p>
      ) : null}
      {footer ? (
        <div className="mt-4 border-t border-border pt-3 text-sm text-textMuted dark:border-dark-border dark:text-dark-textMuted">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
