"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label="Breadcrumbs"
      className={clsx("text-sm text-textMuted dark:text-dark-textMuted", className)}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const content =
            item.href && !isLast ? (
              <a
                href={item.href}
                className="transition hover:text-text dark:hover:text-dark-text"
              >
                {item.label}
              </a>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            );

          return (
            <li key={`${String(item.label)}-${index}`} className="flex items-center gap-2">
              {content}
              {!isLast ? (
                <span aria-hidden className="text-xs text-border dark:text-dark-border">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
