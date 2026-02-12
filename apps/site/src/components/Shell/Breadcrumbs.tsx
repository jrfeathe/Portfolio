"use client";

import type { ReactNode } from "react";
import type { Route } from "next";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "@portfolio/ui";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  ariaLabel: string;
  className?: string;
};

export function Breadcrumbs({ items, ariaLabel, className }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  const lastIndex = items.length - 1;
  const hasSingleItem = items.length === 1;
  const homeItem = items[0];
  const homeLabel = (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="relative -top-[1px]">
        ◀
      </span>
      <span>{homeItem.label}</span>
    </span>
  );
  const isInternalHomeHref =
    typeof homeItem?.href === "string" &&
    homeItem.href.startsWith("/") &&
    !homeItem.href.startsWith("//");
  const navClassName = clsx(
    hasSingleItem
      ? "text-sm text-textMuted dark:text-dark-textMuted"
      : "flex items-center",
    className
  );

  if (!hasSingleItem) {
    return (
      <nav aria-label={ariaLabel} className={navClassName}>
        {homeItem?.href ? (
          isInternalHomeHref ? (
            <Link href={homeItem.href as Route} className="inline-flex">
              <Button
                variant="primary"
                className="text-xs border border-border/70 dark:border-dark-border/70"
              >
                {homeLabel}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              href={homeItem.href}
              className="text-xs border border-border/70 dark:border-dark-border/70"
            >
              {homeLabel}
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            className="px-2.5 py-1 text-xs border border-border/70 dark:border-dark-border/70"
          >
            {homeLabel}
          </Button>
        )}
      </nav>
    );
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={navClassName}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const isInternalHref =
            typeof item.href === "string" &&
            item.href.startsWith("/") &&
            !item.href.startsWith("//");
          const content =
            item.href && !isLast ? (
              isInternalHref ? (
                <Link
                  href={item.href as Route}
                  className="transition hover:text-text dark:hover:text-dark-text"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="transition hover:text-text dark:hover:text-dark-text"
                >
                  {item.label}
                </a>
              )
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
