"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export type AnchorNavItem = {
  label: string;
  href: string;
};

export type AnchorNavProps = {
  items: AnchorNavItem[];
  className?: string;
  orientation?: "vertical" | "horizontal";
};

const DEFAULT_ROOT_MARGIN = "-45% 0px -45% 0px";

export function AnchorNav({
  items,
  className,
  orientation = "vertical"
}: AnchorNavProps) {
  const [activeHref, setActiveHref] = useState<string>(
    items[0]?.href ?? ""
  );
  const scrollRaf = useRef<number | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const targets = items
      .map((item) => {
        if (!item.href?.startsWith("#")) return null;
        const id = item.href.slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean) as HTMLElement[];

    if (!targets.length) return;

    const updateActiveFromViewport = () => {
      scrollRaf.current = null;
      const viewportCenter = window.innerHeight / 2;
      setActiveHref((previous) => {
        let nextHref = previous;

        for (const target of targets) {
          const rect = target.getBoundingClientRect();
          if (
            rect.top <= viewportCenter &&
            rect.bottom >= viewportCenter * 0.35
          ) {
            nextHref = `#${target.id}`;
            break;
          }
          if (rect.top > viewportCenter) {
            break;
          }
          nextHref = `#${target.id}`;
        }

        return nextHref;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matchingItem = items.find((item) => {
              if (!item.href.startsWith("#")) return false;
              return entry.target.id === item.href.slice(1);
            });
            if (matchingItem) {
              setActiveHref(matchingItem.href);
            }
          }
        });
      },
      { rootMargin: DEFAULT_ROOT_MARGIN, threshold: [0.25, 0.5, 0.75] }
    );

    targets.forEach((target) => observer.observe(target));

    const scheduleUpdate = () => {
      if (scrollRaf.current !== null) {
        cancelAnimationFrame(scrollRaf.current);
      }
      scrollRaf.current = requestAnimationFrame(updateActiveFromViewport);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      observer.disconnect();
      if (scrollRaf.current !== null) {
        cancelAnimationFrame(scrollRaf.current);
        scrollRaf.current = null;
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  if (!items.length) {
    return null;
  }

  const orientationClasses =
    orientation === "vertical"
      ? "flex-col gap-1"
      : "flex-row gap-2 overflow-x-auto";

  return (
    <nav
      className={clsx(
        "shell-anchor-nav",
        "rounded-2xl border border-border bg-surface/80 p-3 shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/80",
        orientation === "horizontal" && "flex",
        className
      )}
      aria-label="On-page navigation"
    >
      <ol className={clsx("flex", orientationClasses)}>
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                className={clsx(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-border dark:focus-visible:outline-dark-border",
                  isActive
                    ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
                    : "text-textMuted hover:bg-surfaceMuted dark:text-dark-textMuted dark:hover:bg-dark-surfaceMuted"
                )}
                aria-current={isActive ? "location" : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
