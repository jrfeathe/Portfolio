"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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
import { HudPortal, ViewportHUDLayer } from "./ViewportHUDLayer";
import type {
  ImageDescriptor,
  ResponsiveImagePreset
} from "../../lib/images";
import type { Locale } from "../../utils/i18n";

export type MobileShellLayoutProps = ShellLayoutProps;

type MobileShellLayoutParams = {
  title: MobileShellLayoutProps["title"];
  subtitle?: MobileShellLayoutProps["subtitle"];
  subtitleClassName?: MobileShellLayoutProps["subtitleClassName"];
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
  mobileNavMaxHeightClassName?: string;
  mobileScrollContainer?: boolean;
  skimModeEnabled?: boolean;
  showSkimToggle?: boolean;
  shellCopy: MobileShellLayoutProps["shellCopy"];
  locale: Locale;
};

export function MobileShellLayout({
  title,
  subtitle,
  subtitleClassName,
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
  mobileNavMaxHeightClassName,
  mobileScrollContainer = false,
  skimModeEnabled,
  showSkimToggle = true,
  shellCopy,
  locale
}: MobileShellLayoutParams) {
  const hasSkimMode = typeof skimModeEnabled === "boolean";
  const skimActive = Boolean(skimModeEnabled);
  const buildFallbackNavItems = () =>
    sections
      .filter((section) => !section.hideFromNav)
      .map((section) => ({
      label:
        typeof section.title === "string" && section.title.trim().length > 0
          ? section.title
          : section.id,
      href: `#${section.id}`
    }));
  const rawNavItems: AnchorNavItem[] =
    anchorItems?.length
      ? anchorItems
      : skimActive && Array.isArray(anchorItems)
        ? buildFallbackNavItems()
        : anchorItems ?? buildFallbackNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const MENU_BUTTON_TOP = 16;
  const SOCIAL_LINKS_TOP_OFFSET = 6;
  const scrollLockRef = useRef<{
    scrollY: number;
    bodyOverflow: string;
    bodyPaddingRight: string;
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
    htmlOverflow: string;
  } | null>(null);
  const pendingHashRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerOverflowRef = useRef<string | null>(null);

  const isSkimSummaryOnly =
    skimActive &&
    rawNavItems.length === 1 &&
    rawNavItems[0]?.href === "#skim-summary" &&
    !rawNavItems[0]?.children?.length;
  const navItems = isSkimSummaryOnly ? [] : rawNavItems;
  const hasNestedAnchors = navItems.some((item) => item.children?.length);
  const hasNavItems = navItems.length > 0;
  const menuEnabled = hasNavItems || isSkimSummaryOnly;
  const shouldShowSkimToggle = showSkimToggle && (hasSkimMode ? (!skimActive || !menuEnabled) : true);
  const shouldShowNavSkimToggle = showSkimToggle && (hasSkimMode ? skimActive && menuEnabled : true);
  const shouldRenderHeaderCta = !!cta && !skimActive;
  const shouldRenderAfterContentCta = !!cta && skimActive;
  const showHeaderCta = hasSkimMode ? shouldRenderHeaderCta : Boolean(cta);
  const showAfterContentCta = hasSkimMode ? shouldRenderAfterContentCta : Boolean(cta);
  const headerCtaClassName = clsx(!hasSkimMode && "skim-hide");
  const afterContentCtaClassName = clsx(!hasSkimMode && "skim-only");
  const headerSkimToggleClassName = clsx(!hasSkimMode && "skim-hide");
  const navSkimToggleClassName = clsx(
    "w-full justify-center",
    !hasSkimMode && "skim-only"
  );

  const content = (
    <>
      <header className="border-b border-border bg-surface pb-2 pt-3 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto w-full max-w-6xl pb-1 px-4">
          <div className="pb-0">
            <div className="flex items-start justify-end gap-3">
              <div className="mt-1 h-8.5 min-w-[180px]">
                <LanguageSwitcher className="h-8.5 min-w-[180px]" />
              </div>
            </div>
            <ViewportHUDLayer />
            {breadcrumbs.length ? (
              <div className="mt-3">
                <Breadcrumbs
                  items={breadcrumbs}
                  ariaLabel={shellCopy.breadcrumbsLabel}
                  className="skim-hide"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1
                className={clsx(
                  "font-semibold tracking-tight skim-hide",
                  skimActive ? "text-base leading-snug" : "text-3xl"
                )}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  className={clsx(
                    "max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted skim-hide",
                    subtitleClassName
                  )}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
            {shouldShowSkimToggle ? (
              <div className={clsx("inline-flex flex-col items-start gap-3", headerSkimToggleClassName)}>
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
            {showHeaderCta ? (
              <div className={headerCtaClassName}>
                {cta}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={clsx(
          "mx-auto w-full max-w-6xl px-4",
          skimActive ? "pt-4 pb-4" : "py-4",
          className
        )}
      >
        <main className="flex flex-col gap-4">
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className={clsx("scroll-mt-16", section.className)}
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
        {showAfterContentCta ? (
          <div className={clsx("mt-6 space-y-4", afterContentCtaClassName)}>
            {cta}
          </div>
        ) : null}
      </div>

      {footer ?? (footerContent ? <ShellFooter content={footerContent} /> : null)}
    </>
  );

  const handleExpandAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-expand-all"));
  };

  const handleCollapseAllNav = () => {
    document.dispatchEvent(new Event("shell-anchor-collapse-all"));
  };

  const handleNavItemClick = (item: AnchorNavItem, event: MouseEvent<HTMLAnchorElement>) => {
    if (!item.href.startsWith("#")) {
      setMenuOpen(false);
      return;
    }
    event.preventDefault();
    pendingHashRef.current = item.href;
    setMenuOpen(false);
  };


  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollContainer = scrollContainerRef.current;

    if (menuOpen) {
      const scrollY = window.scrollY;
      scrollLockRef.current = {
        scrollY,
        bodyOverflow: body.style.overflow,
        bodyPaddingRight: body.style.paddingRight,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyWidth: body.style.width,
        htmlOverflow: html.style.overflow
      };

      const scrollbarGap = window.innerWidth - html.clientWidth;
      if (scrollbarGap > 0) {
        body.style.paddingRight = `${scrollbarGap}px`;
      }
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      if (mobileScrollContainer && scrollContainer) {
        scrollContainerOverflowRef.current = scrollContainer.style.overflowY;
        scrollContainer.style.overflowY = "hidden";
      }
      return;
    }

    const locked = scrollLockRef.current;
    if (locked) {
      body.style.overflow = locked.bodyOverflow;
      body.style.paddingRight = locked.bodyPaddingRight;
      body.style.position = locked.bodyPosition;
      body.style.top = locked.bodyTop;
      body.style.width = locked.bodyWidth;
      html.style.overflow = locked.htmlOverflow;
      window.scrollTo(0, locked.scrollY);
      scrollLockRef.current = null;
    }
    if (mobileScrollContainer && scrollContainer) {
      scrollContainer.style.overflowY = scrollContainerOverflowRef.current ?? "";
      scrollContainerOverflowRef.current = null;
    }

    const pending = pendingHashRef.current;
    if (pending) {
      pendingHashRef.current = null;
      const id = pending.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", pending);
      } else {
        window.location.hash = pending;
      }
    }
  }, [menuOpen, mobileScrollContainer]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleSkimToggle = () => {
      if (!menuOpen) {
        return;
      }
      const scrollContainer = scrollContainerRef.current;
      if (mobileScrollContainer && scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      const locked = scrollLockRef.current;
      if (locked) {
        locked.scrollY = 0;
      }
      document.body.style.top = "0px";
    };
    window.addEventListener("portfolio:skim-mode", handleSkimToggle);
    return () => {
      window.removeEventListener("portfolio:skim-mode", handleSkimToggle);
    };
  }, [menuOpen, mobileScrollContainer]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) {
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      window.scrollBy({ top: -18 });
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      id={mobileScrollContainer ? undefined : "top"}
      className={clsx(
        "bg-background text-text dark:bg-dark-background dark:text-dark-text",
        mobileScrollContainer ? "h-[100svh] overflow-hidden" : "min-h-[100dvh]"
      )}
    >
      {menuOpen && menuEnabled ? (
        <HudPortal slot="menu">
          <div
            data-menu-layer="true"
            className="absolute inset-0 z-50 flex overscroll-contain"
          >
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
              className="absolute z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border dark:border-dark-border dark:text-dark-text"
              style={{
                top: `calc(${MENU_BUTTON_TOP}px + var(--hud-safe-top))`,
                left: "calc(1rem + var(--hud-safe-left))"
              }}
              onClick={() => setMenuOpen(false)}
            >
              {shellCopy.menuCloseButtonLabel}
            </button>
            <aside
              id="mobile-preferences"
              className="relative z-10 mr-auto flex h-full w-72 max-w-[85vw] flex-col gap-6 overflow-hidden border-r border-border bg-surface px-5 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
              aria-label={shellCopy.menuPanelLabel}
              style={{
                paddingTop: "calc(3.5rem + var(--hud-safe-top))",
                paddingBottom: "calc(1.25rem + var(--hud-safe-bottom))"
              }}
            >
              {socialLinks ? (
                <div
                  className="absolute right-5 z-10 flex items-center [&_[data-social-links]]:gap-6"
                  style={{
                    top: `calc(${MENU_BUTTON_TOP + SOCIAL_LINKS_TOP_OFFSET}px + var(--hud-safe-top))`
                  }}
                >
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
                      data-mobile-action="true"
                      onClick={() => setMenuOpen(false)}
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
                        data-mobile-action="true"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                      >
                        {shellCopy.expandAllLabel}
                      </button>
                      <button
                        type="button"
                        onClick={handleCollapseAllNav}
                        data-mobile-action="true"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                      >
                        {shellCopy.collapseAllLabel}
                      </button>
                    </div>
                  ) : null}
                  {navItems.length ? (
                    <div
                      className={clsx(
                        "min-h-0 flex-1 overflow-y-auto overscroll-contain skim-hide",
                        mobileNavMaxHeightClassName
                      )}
                    >
                      <AnchorNav
                        items={navItems}
                        ariaLabel={shellCopy.anchorNavLabel}
                        orientation="vertical"
                        scrollable={false}
                        onItemClick={handleNavItemClick}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </aside>
          </div>
        </HudPortal>
      ) : null}

      <div
        data-floating-layer="true"
        className="pointer-events-none fixed left-0 top-0 z-40"
      >
        {!menuOpen && menuEnabled ? (
        <HudPortal slot="menu">
            <button
              type="button"
              aria-label={shellCopy.menuOpenLabel}
              aria-expanded="false"
              aria-controls="mobile-preferences"
              data-menu-toggle="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold text-text shadow-lg transition hover:border-accent hover:text-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
          </HudPortal>
        ) : null}
        {floatingWidget ? <HudPortal slot="widgets">{floatingWidget}</HudPortal> : null}
        <div id="chatbot-slot" data-chatbot-slot="true" />
      </div>
      {mobileScrollContainer ? (
        <div
          ref={scrollContainerRef}
          data-mobile-scroll-container="true"
          className="relative h-full overflow-y-auto overflow-x-hidden overscroll-contain"
        >
          <div id="top" />
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
}
