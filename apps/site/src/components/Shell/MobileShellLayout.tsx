"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import type { ShellLayoutProps } from "./Layout";
import type { AnchorNavItem } from "./AnchorNav";
import { AnchorNav } from "./AnchorNav";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { Breadcrumbs } from "./Breadcrumbs";
import { ShellFooter, type ShellFooterContent } from "./Footer";
import { ResponsiveImage } from "../ResponsiveImage";
import { ThemeToggle } from "../ThemeToggle";
import { ContrastToggle } from "../ContrastToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { SkimToggleButton } from "../SkimToggleButton";
import type {
  ImageDescriptor,
  ResponsiveImagePreset
} from "../../lib/images";
import type { Locale } from "../../utils/i18n";

export type MobileShellLayoutProps = ShellLayoutProps;

type MobileShellLayoutParams = {
  title: MobileShellLayoutProps["title"];
  subtitle?: MobileShellLayoutProps["subtitle"];
  breadcrumbs?: BreadcrumbItem[];
  sections: MobileShellLayoutProps["sections"];
  anchorItems?: AnchorNavItem[];
  cta?: MobileShellLayoutProps["cta"];
  footer?: MobileShellLayoutProps["footer"];
  footerContent?: ShellFooterContent;
  className?: string;
  heroMedia?: {
    image: ImageDescriptor;
    preset?: ResponsiveImagePreset;
    caption?: MobileShellLayoutProps["subtitle"];
  };
  skimModeEnabled?: boolean;
  showSkimToggle?: boolean;
  locale: Locale;
};

export function MobileShellLayout({
  title,
  subtitle,
  breadcrumbs = [],
  sections,
  anchorItems,
  cta,
  footer,
  footerContent,
  className,
  heroMedia,
  skimModeEnabled = false,
  showSkimToggle = true,
  locale
}: MobileShellLayoutParams) {
  const navItems: AnchorNavItem[] =
    anchorItems ??
    sections.map((section) => ({
      label: typeof section.title === "string" ? section.title : section.id,
      href: `#${section.id}`
    }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuButtonTop, setMenuButtonTop] = useState<number | undefined>(undefined);
  const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
  const hasNestedAnchors = navItems.some((item) => item.children?.length);

  const handleExpandAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-expand-all"));
  };

  const handleCollapseAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-collapse-all"));
  };

  useEffect(() => {
    const updateMenuButtonTop = () => {
      const target = languageSwitcherRef.current;
      if (!target) {
        return;
      }
      const { top } = target.getBoundingClientRect();
      setMenuButtonTop(top);
    };

    updateMenuButtonTop();
    window.addEventListener("resize", updateMenuButtonTop);

    return () => {
      window.removeEventListener("resize", updateMenuButtonTop);
    };
  }, [languageSwitcherRef]);

  return (
    <div
      id="top"
      className="bg-background text-text dark:bg-dark-background dark:text-dark-text"
    >
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="mobile-preferences"
            className="relative z-10 mr-auto flex h-full w-72 max-w-[85vw] flex-col gap-6 border-r border-border bg-surface p-5 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
            aria-label="Navigation and display options"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text dark:text-dark-text">
                Menu
              </p>
              <button
                type="button"
                className="rounded-full border border-border h-6 w-6 text-xs font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                onClick={() => setMenuOpen(false)}
              >
                X
              </button>
            </div>
            {navItems.length ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="space-y-4">
                  <ThemeToggle locale={locale} />
                  <ContrastToggle locale={locale} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#top"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                  >
                    Return to top
                  </a>
                </div>
                {hasNestedAnchors ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExpandAllNav}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                    >
                      Expand all
                    </button>
                    <button
                      type="button"
                      onClick={handleCollapseAllNav}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                    >
                      Collapse all
                    </button>
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <AnchorNav
                    items={navItems}
                    orientation="vertical"
                    scrollable={false}
                  />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      {!menuOpen ? (
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mobile-preferences"
          className="fixed left-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold text-text shadow-lg transition hover:border-accent hover:text-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          style={{ top: menuButtonTop ?? 16 }}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      ) : null}

      <header className="border-b border-border bg-surface pb-2 pt-4 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto w-full max-w-6xl pb-2 px-4">
          <div className="space-y-4 pb-2">
            <div className="flex items-center justify-end gap-3">
              <div ref={languageSwitcherRef} className="h-8.5 min-w-[180px]">
                <LanguageSwitcher className="h-8.5 min-w-[180px]" />
              </div>
            </div>
            {breadcrumbs.length ? (
              <Breadcrumbs items={breadcrumbs} />
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {showSkimToggle ? (
              <SkimToggleButton active={skimModeEnabled} locale={locale} />
            ) : null}
            {heroMedia ? (
              <figure
                className="group relative rounded-2xl border border-border/40 bg-gradient-to-br from-surface/40 via-surface/10 to-surface/50 shadow-xl ring-1 ring-border/20 backdrop-blur-sm dark:border-dark-border/30 dark:from-dark-surface/40 dark:via-dark-surface/10 dark:to-dark-surface/50 dark:ring-dark-border/20"
                data-hero-portrait="true"
              >
                <div className="relative aspect-[4/3]">
                  <ResponsiveImage
                    image={heroMedia.image}
                    preset={heroMedia.preset ?? "hero"}
                    priority
                    fill
                    className="h-full w-full"
                  />
                </div>
                {heroMedia.caption ? (
                  <figcaption className="rounded-b-2xl border-border/30 bg-surface/70 px-4 py-2 text-xs font-medium text-textMuted backdrop-blur-sm dark:border-dark-border/30 dark:bg-dark-surface/70 dark:text-dark-textMuted">
                    {heroMedia.caption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            {cta ? (
              <>
                {cta}
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={clsx(
          "mx-auto w-full max-w-6xl px-4 py-4",
          className
        )}
      >
        <main className="flex flex-col gap-4">
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-24"
            >
              <div className="space-y-3">
                {section.eyebrow ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                    {section.eyebrow}
                  </span>
                ) : null}
                <h2 className="text-2xl font-semibold leading-tight">
                  {section.title}
                </h2>
                {section.description ? (
                  <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                    {section.description}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 space-y-6 text-base leading-relaxed text-text dark:text-dark-text">
                {section.content}
              </div>
            </section>
          ))}
        </main>
      </div>

      {footer ?? <ShellFooter content={footerContent} />}
    </div>
  );
}
