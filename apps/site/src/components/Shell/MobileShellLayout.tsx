"use client";

import { useState } from "react";
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
  const hasNestedAnchors = navItems.some((item) => item.children?.length);

  const handleExpandAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-expand-all"));
  };

  const handleCollapseAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-collapse-all"));
  };

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
                className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
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
          className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold text-text shadow-lg transition hover:border-accent hover:text-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      ) : null}

      <header className="border-b border-border bg-surface pb-8 pt-8 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-3">
              <LanguageSwitcher className="min-w-[180px]" />
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
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-surface/40 via-surface/10 to-surface/50 shadow-xl ring-1 ring-border/20 backdrop-blur-sm dark:border-dark-border/30 dark:from-dark-surface/40 dark:via-dark-surface/10 dark:to-dark-surface/50 dark:ring-dark-border/20"
                data-hero-portrait="true"
              >
                <div className="relative aspect-[4/3]">
                  <ResponsiveImage
                    image={heroMedia.image}
                    preset={heroMedia.preset ?? "hero"}
                    priority
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>
                {heroMedia.caption ? (
                  <figcaption className="border-t border-border/30 bg-surface/70 px-4 py-2 text-xs font-medium text-textMuted backdrop-blur-sm dark:border-dark-border/30 dark:bg-dark-surface/70 dark:text-dark-textMuted">
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
          "mx-auto w-full max-w-6xl px-4 pb-20 pt-10 space-y-12",
          className
        )}
      >
        <main className="flex flex-col gap-16">
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
