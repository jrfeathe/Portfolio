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
  floatingWidget?: MobileShellLayoutProps["floatingWidget"];
  footer?: MobileShellLayoutProps["footer"];
  footerContent?: ShellFooterContent;
  className?: string;
  socialLinks?: MobileShellLayoutProps["socialLinks"];
  heroMedia?: {
    image: ImageDescriptor;
    preset?: ResponsiveImagePreset;
    caption?: MobileShellLayoutProps["subtitle"];
  };
  skimModeEnabled?: boolean;
  showSkimToggle?: boolean;
  shellCopy: MobileShellLayoutProps["shellCopy"];
  locale: Locale;
};

export function MobileShellLayout({
  title,
  subtitle,
  breadcrumbs = [],
  sections,
  anchorItems,
  cta,
  floatingWidget,
  footer,
  footerContent,
  className,
  socialLinks,
  heroMedia,
  skimModeEnabled = false,
  showSkimToggle = true,
  shellCopy,
  locale
}: MobileShellLayoutParams) {
  const buildFallbackNavItems = () =>
    sections.map((section) => ({
      label:
        typeof section.title === "string" && section.title.trim().length > 0
          ? section.title
          : section.id,
      href: `#${section.id}`
    }));
  const rawNavItems: AnchorNavItem[] =
    anchorItems?.length
      ? anchorItems
      : skimModeEnabled && Array.isArray(anchorItems)
        ? buildFallbackNavItems()
        : anchorItems ?? buildFallbackNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuButtonTop, setMenuButtonTop] = useState<number | undefined>(undefined);
  const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
  const isSkimSummaryOnly =
    skimModeEnabled &&
    rawNavItems.length === 1 &&
    rawNavItems[0]?.href === "#skim-summary" &&
    !rawNavItems[0]?.children?.length;
  const navItems = isSkimSummaryOnly ? [] : rawNavItems;
  const hasNestedAnchors = navItems.some((item) => item.children?.length);
  const hasNavItems = navItems.length > 0;
  const menuEnabled = hasNavItems || isSkimSummaryOnly;
  const shouldShowSkimToggle = showSkimToggle && (!skimModeEnabled || !menuEnabled);
  const shouldShowNavSkimToggle = showSkimToggle && skimModeEnabled && menuEnabled;
  const shouldRenderHeaderCta = !!cta && !skimModeEnabled;
  const shouldRenderAfterContentCta = !!cta && skimModeEnabled;
  const navSkimToggleClassName = "w-full justify-center";

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
      {menuOpen && menuEnabled ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-text/30 dark:bg-dark-background/30"
            aria-label={shellCopy.menuCloseLabel}
            onClick={() => setMenuOpen(false)}
          />
          <button
            type="button"
            aria-label={shellCopy.menuCloseLabel}
            aria-expanded="true"
            aria-controls="mobile-preferences"
            className="fixed left-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border dark:border-dark-border dark:text-dark-text"
            style={{ top: menuButtonTop ?? 16 }}
            onClick={() => setMenuOpen(false)}
          >
            {shellCopy.menuCloseButtonLabel}
          </button>
          <aside
            id="mobile-preferences"
            className="relative z-10 mr-auto flex h-full w-72 max-w-[85vw] flex-col gap-6 border-r border-border bg-surface p-5 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
            aria-label={shellCopy.menuPanelLabel}
          >
            {socialLinks ? (
              <div className="mr-2 flex items-center justify-end [&_[data-social-links]]:gap-8">
                {socialLinks}
              </div>
            ) : null}
            {menuEnabled ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="space-y-4">
                  <ThemeToggle locale={locale} />
                  <ContrastToggle locale={locale} />
                  {shouldShowNavSkimToggle ? (
                    <div className="flex flex-col gap-2">
                      <SkimToggleButton
                        active={skimModeEnabled}
                        locale={locale}
                        className={navSkimToggleClassName}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#top"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                  >
                    {shellCopy.returnToTopLabel}
                  </a>
                </div>
                {hasNestedAnchors ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExpandAllNav}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                    >
                      {shellCopy.expandAllLabel}
                    </button>
                    <button
                      type="button"
                      onClick={handleCollapseAllNav}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                    >
                      {shellCopy.collapseAllLabel}
                    </button>
                  </div>
                ) : null}
                {navItems.length ? (
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <AnchorNav
                      items={navItems}
                      ariaLabel={shellCopy.anchorNavLabel}
                      orientation="vertical"
                      scrollable={false}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      {!menuOpen && menuEnabled ? (
        <button
          type="button"
          aria-label={shellCopy.menuOpenLabel}
          aria-expanded="false"
          aria-controls="mobile-preferences"
          className="fixed left-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold text-text shadow-lg transition hover:border-accent hover:text-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          style={{ top: menuButtonTop ?? 16 }}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      ) : null}

      <header className="border-b border-border bg-surface pb-2 pt-3 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto w-full max-w-6xl pb-1 px-4">
          <div className="space-y-3 pb-0">
            <div className="flex items-start justify-end gap-3">
              <div ref={languageSwitcherRef} className="h-8.5 min-w-[180px]">
                <LanguageSwitcher className="h-8.5 min-w-[180px]" />
              </div>
            </div>
            {breadcrumbs.length ? (
              <Breadcrumbs items={breadcrumbs} ariaLabel={shellCopy.breadcrumbsLabel} />
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1
                className={clsx(
                  "font-semibold tracking-tight",
                  skimModeEnabled ? "text-base leading-snug" : "text-3xl"
                )}
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {shouldShowSkimToggle ? (
              <div className="inline-flex flex-col items-start gap-3">
                <SkimToggleButton active={skimModeEnabled} locale={locale} />
              </div>
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
            {shouldRenderHeaderCta ? (
              <>
                {cta}
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div id="chatbot-slot" data-chatbot-slot="true" />
      {floatingWidget}

      <div
        className={clsx(
          "mx-auto w-full max-w-6xl px-4",
          skimModeEnabled ? "pt-4 pb-4" : "py-4",
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
                {typeof section.title === "string"
                  ? section.title.trim()
                    ? (
                      <h2 className="text-2xl font-semibold leading-tight">
                        {section.title}
                      </h2>
                    )
                    : null
                  : section.title ? (
                    <h2 className="text-2xl font-semibold leading-tight">
                      {section.title}
                    </h2>
                  ) : null}
                {section.description ? (
                  <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                    {section.description}
                  </p>
                ) : null}
              </div>
              <div className="mt-0 space-y-6 text-base leading-relaxed text-text dark:text-dark-text">
                {section.content}
              </div>
            </section>
          ))}
        </main>
        {shouldRenderAfterContentCta ? (
          <div className="mt-6 space-y-4">
            {cta}
          </div>
        ) : null}
      </div>

      {footer ?? (footerContent ? <ShellFooter content={footerContent} /> : null)}
    </div>
  );
}
