import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { UrlObject } from "url";

import type { AppDictionary } from "../utils/dictionaries";
import { TechStackCarousel } from "./TechStackCarousel";

type TechStackItems = AppDictionary["home"]["sections"]["techStack"]["items"];
type TechStackCarouselLabels = AppDictionary["home"]["sections"]["techStack"]["carousel"];

export type SkimSummaryItem = {
  id: string;
  label: string;
  value: ReactNode;
  href?: string;
};

function toUrlObject(href: string): UrlObject {
  const [pathname, hash] = href.split("#");
  return hash
    ? { pathname, hash: `#${hash}` }
    : { pathname };
}

type DesktopSkimLayoutProps = {
  columnTitle: string;
  summaryItems: SkimSummaryItem[];
  techStackTitle: string;
  techStackItems: TechStackItems;
  techStackCarouselLabels: TechStackCarouselLabels;
  availabilityLabel: string;
  availability: ReactNode;
};

export function DesktopSkimLayout({
  columnTitle,
  summaryItems,
  techStackTitle,
  techStackItems,
  techStackCarouselLabels,
  availabilityLabel,
  availability
}: DesktopSkimLayoutProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="grid gap-3">
        <h1 className="pl-4 pt-0 text-2xl font-semibold leading-tight tracking-tight text-text dark:text-dark-text md:text-3xl">
          {columnTitle}
        </h1>
        {summaryItems.map((item, index) => (
          <div
            key={item.id}
            className={clsx(
              "skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface",
              index === 0 && "-mt-0"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              {item.label}
            </p>
            {item.href ? (
              item.href.startsWith("http") || item.href.startsWith("mailto:") ? (
                <a
                  href={item.href}
                  className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                >
                  {item.value}
                </a>
              ) : (
                <Link
                  href={toUrlObject(item.href)}
                  className="mt-1 inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                >
                  {item.value}
                </Link>
              )
            ) : (
              <p className="mt-1 text-base leading-relaxed">{item.value}</p>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
          <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            {techStackTitle}
          </p>
          <TechStackCarousel items={techStackItems} labels={techStackCarouselLabels} />
        </div>
        <div className="skim-card rounded-xl border border-border/70 bg-surface px-4 py-3 dark:border-dark-border/70 dark:bg-dark-surface">
          <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            {availabilityLabel}
          </p>
          <p className="mt-1 text-base leading-relaxed">{availability}</p>
        </div>
      </div>
    </div>
  );
}
