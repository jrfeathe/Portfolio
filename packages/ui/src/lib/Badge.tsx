import type { ReactNode } from "react";
import { forwardRef } from "react";
import clsx from "clsx";

type BadgeVariant = "neutral" | "accent" | "danger";

export type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral:
    "bg-surfaceMuted text-text border border-border dark:bg-dark-surfaceMuted dark:text-dark-text dark:border-dark-border",
  accent:
    "bg-accent text-accentOn border border-accent dark:bg-dark-accent dark:text-dark-accentOn dark:border-dark-accent",
  danger:
    "bg-danger text-surface border border-danger dark:bg-dark-danger dark:text-dark-surface dark:border-dark-danger"
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, className, variant = "neutral", ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
