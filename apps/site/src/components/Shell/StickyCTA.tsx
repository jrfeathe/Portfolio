import type { ReactNode } from "react";
import type { Route } from "next";
import clsx from "clsx";
import Link from "next/link";
import { Button, type ButtonVariant } from "@portfolio/ui";

export type StickyCTAProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  sticky?: boolean;
  topCta?: {
    label: ReactNode;
    href: string;
    variant?: ButtonVariant;
  };
};

export function StickyCTA({
  title,
  description,
  children,
  className,
  sticky = true,
  topCta
}: StickyCTAProps) {
  const stickyClassName = sticky ? "lg:sticky lg:top-24" : null;
  const isInternalTopCta =
    typeof topCta?.href === "string" &&
    topCta.href.startsWith("/") &&
    !topCta.href.startsWith("//");

  return (
    <div className={clsx("flex flex-col gap-4", stickyClassName)}>
      {topCta ? (
        isInternalTopCta ? (
          <Link href={topCta.href as Route} passHref legacyBehavior>
            <Button
              href={topCta.href}
              variant={topCta.variant ?? "primary"}
              className="w-full border border-border/70 dark:border-dark-border/70"
            >
              {topCta.label}
            </Button>
          </Link>
        ) : (
          <Button
            href={topCta.href}
            variant={topCta.variant ?? "primary"}
            className="w-full border border-border/70 dark:border-dark-border/70"
          >
            {topCta.label}
          </Button>
        )
      ) : null}
      <aside
        className={clsx(
          "shell-sticky-cta",
          "group flex flex-col gap-4 rounded-2xl border border-border bg-surface/95 p-6 shadow-lg backdrop-blur transition dark:border-dark-border dark:bg-dark-surface/95",
          className
        )}
      >
        {title ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text dark:text-dark-text">
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-relaxed text-textMuted dark:text-dark-textMuted">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {children}
        </div>
      </aside>
    </div>
  );
}
