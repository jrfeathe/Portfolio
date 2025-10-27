import type { ReactNode } from "react";
import clsx from "clsx";

export type StickyCTAProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StickyCTA({
  title,
  description,
  children,
  className
}: StickyCTAProps) {
  return (
    <aside
      className={clsx(
        "shell-sticky-cta",
        "group flex flex-col gap-4 rounded-2xl border border-border bg-surface/95 p-6 shadow-lg backdrop-blur transition dark:border-dark-border dark:bg-dark-surface/95",
        "lg:sticky lg:top-24",
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {children}
      </div>
    </aside>
  );
}
