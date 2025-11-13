"use client";

import { FOCUS_VISIBLE_RING } from "@portfolio/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type AnchorNavItem = {
  label: string;
  href: string;
  children?: AnchorNavItem[];
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
  const enableNested = orientation === "vertical";
  const flattenedItems = useMemo(() => {
    const collect = (input: AnchorNavItem[]): AnchorNavItem[] => {
      return input.flatMap((entry) =>
        entry.children && entry.children.length
          ? [entry, ...collect(entry.children)]
          : [entry]
      );
    };

    return enableNested ? collect(items) : items;
  }, [items, enableNested]);

  const [activeHref, setActiveHref] = useState<string>(flattenedItems[0]?.href ?? "");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollRaf = useRef<number | null>(null);
  const nestedParents = useMemo(
    () => (enableNested ? items.filter((item) => item.children?.length) : []),
    [items, enableNested]
  );

  useEffect(() => {
    if (!flattenedItems.length) return;

    const targets = flattenedItems
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
  }, [flattenedItems, items]);

  useEffect(() => {
    if (!flattenedItems.length) {
      setActiveHref("");
      return;
    }

    setActiveHref((previous) => {
      const stillValid = flattenedItems.some((item) => item.href === previous);
      if (stillValid) {
        return previous;
      }
      return flattenedItems[0]?.href ?? "";
    });
  }, [flattenedItems]);

  useEffect(() => {
    if (!enableNested) {
      return;
    }

    const parentWithActiveChild = items.find((entry) =>
      entry.children?.some((child) => child.href === activeHref)
    );

    if (parentWithActiveChild && !expandedSections[parentWithActiveChild.href]) {
      setExpandedSections((prev) => ({
        ...prev,
        [parentWithActiveChild.href]: true
      }));
    }
  }, [activeHref, items, enableNested, expandedSections]);

  const handleExpandAll = useCallback(() => {
    if (!nestedParents.length) {
      return;
    }
    setExpandedSections(
      nestedParents.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.href] = true;
        return acc;
      }, {})
    );
  }, [nestedParents]);

  const handleCollapseAll = useCallback(() => {
    if (!nestedParents.length) {
      return;
    }
    setExpandedSections({});
  }, [nestedParents]);

  useEffect(() => {
    if (!enableNested || !nestedParents.length) {
      return;
    }

    const expandListener = () => handleExpandAll();
    const collapseListener = () => handleCollapseAll();
    document.addEventListener("shell-anchor-expand-all", expandListener);
    document.addEventListener("shell-anchor-collapse-all", collapseListener);

    return () => {
      document.removeEventListener("shell-anchor-expand-all", expandListener);
      document.removeEventListener("shell-anchor-collapse-all", collapseListener);
    };
  }, [enableNested, nestedParents.length, handleExpandAll, handleCollapseAll]);

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
        orientation === "horizontal" ? "flex overflow-x-auto" : "max-h-[70vh] overflow-y-auto pr-1",
        className
      )}
      aria-label="On-page navigation"
    >
      <ol className={clsx("flex", orientationClasses)}>
        {items.map((item) => {
          const isActive = activeHref === item.href;
          const hasChildren = enableNested && item.children?.length;
          const childListId = hasChildren
            ? `${item.href.replace(/[^a-zA-Z0-9_-]/g, "")}-children`
            : undefined;
          const isExpanded = hasChildren ? !!expandedSections[item.href] : false;
          return (
            <li key={item.href} className="flex flex-col">
              <div className="flex items-center gap-2">
                <a
                  href={item.href}
                  className={clsx(
                    "inline-flex flex-1 items-center rounded-full px-3 py-1.5 text-sm font-medium transition",
                    FOCUS_VISIBLE_RING,
                    isActive
                      ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
                      : "text-textMuted hover:bg-surfaceMuted dark:text-dark-textMuted dark:hover:bg-dark-surfaceMuted"
                  )}
                  aria-current={isActive ? "location" : undefined}
                >
                  {item.label}
                </a>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        [item.href]: !prev[item.href]
                      }))
                    }
                    aria-expanded={isExpanded}
                    aria-controls={childListId}
                    className={clsx(
                      "rounded-full p-1 text-xs transition",
                      FOCUS_VISIBLE_RING,
                      "text-textMuted hover:text-text dark:text-dark-textMuted dark:hover:text-dark-text"
                    )}
                    aria-label={isExpanded ? `Hide ${item.label} items` : `Show ${item.label} items`}
                  >
                    <span aria-hidden>{isExpanded ? "▴" : "▾"}</span>
                  </button>
                ) : null}
              </div>
              {hasChildren ? (
                <ol
                  id={childListId}
                  className={clsx(
                    "ml-4 mt-1 space-y-1 border-l border-border/40 pl-3 dark:border-dark-border/40",
                    !isExpanded && "hidden"
                  )}
                >
                  {item.children?.map((child) => {
                    const childActive = activeHref === child.href;
                    return (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className={clsx(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition",
                            FOCUS_VISIBLE_RING,
                            childActive
                              ? "bg-accent text-accentOn dark:bg-dark-accent dark:text-dark-accentOn"
                              : "text-textMuted hover:bg-surfaceMuted dark:text-dark-textMuted dark:hover:bg-dark-surfaceMuted"
                          )}
                          aria-current={childActive ? "location" : undefined}
                        >
                          {child.label}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
