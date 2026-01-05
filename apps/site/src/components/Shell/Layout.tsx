import type { ReactNode } from "react";
import clsx from "clsx";

import type { AnchorNavItem } from "./AnchorNav";
import { AnchorNav } from "./AnchorNav";
import { AnchorControlPanel } from "./AnchorControlPanel";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { Breadcrumbs } from "./Breadcrumbs";
import { ShellFooter, type ShellFooterContent } from "./Footer";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ContrastToggle } from "../ContrastToggle";
import { ThemeToggle } from "../ThemeToggle";
import { SkimToggleButton } from "../SkimToggleButton";
import { ResponsiveImage } from "../ResponsiveImage";
import type {
  ImageDescriptor,
  ResponsiveImagePreset
} from "../../lib/images";
import type { Locale } from "../../utils/i18n";
import type { AppDictionary } from "../../utils/dictionaries";

type ShellCopy = AppDictionary["shell"];

export type ShellSection = {
  id: string;
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  content: ReactNode;
};

export type ShellLayoutProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  sections: ShellSection[];
  anchorItems?: AnchorNavItem[];
  cta?: ReactNode;
  floatingWidget?: ReactNode;
  footer?: ReactNode;
  footerContent?: ShellFooterContent;
  className?: string;
  heroMedia?: {
    image: ImageDescriptor;
    preset?: ResponsiveImagePreset;
    caption?: ReactNode;
  };
  skimModeEnabled?: boolean;
  showSkimToggle?: boolean;
  shellCopy: ShellCopy;
  locale: Locale;
};

export function ShellLayout({
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
  heroMedia,
  skimModeEnabled = false,
  showSkimToggle = true,
  shellCopy,
  locale
}: ShellLayoutProps) {
  const navItems: AnchorNavItem[] =
    anchorItems ??
    sections.map((section): AnchorNavItem => ({
      label: typeof section.title === "string" ? section.title : section.id,
      href: `#${section.id}`
    }));
  const hasNestedAnchors = navItems.some((item) => item.children?.length);
  const containerWidth = navItems.length ? "max-w-6xl" : "max-w-none";
  const hasNavItems = navItems.length > 0;
  const showHeaderSkimToggle = showSkimToggle && skimModeEnabled;
  const showHeroSkimToggle = showSkimToggle && !skimModeEnabled;
  const headerClassName = clsx(
    "border-b border-border bg-surface dark:border-dark-border dark:bg-dark-surface",
    skimModeEnabled ? "pb-2 pt-4" : "pb-8 pt-10"
  );
  const headerInnerClassName = clsx(
    "mx-auto flex w-full max-w-6xl flex-col px-4",
    skimModeEnabled ? "gap-3" : "gap-6"
  );
  const headerRowClassName = clsx(
    "flex flex-wrap",
    skimModeEnabled ? "items-start gap-2" : "items-center gap-4"
  );
  const preferenceControlsClassName = clsx(
    "ml-auto flex flex-1 flex-wrap justify-end md:flex-none",
    skimModeEnabled ? "items-start gap-2" : "items-center gap-3"
  );
  const heroGridClassName = skimModeEnabled
    ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
    : "grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start";
  const titleStackClassName = skimModeEnabled ? "space-y-3" : "space-y-4";
  const contentGridClassName = skimModeEnabled
    ? clsx(
        "shell-layout-grid mx-auto grid w-full grid-cols-1 gap-6 px-4 pb-16 pt-0",
        navItems.length
          ? `lg:grid-cols-[220px_minmax(0,1fr)_260px] ${containerWidth}`
          : "lg:grid-cols-[minmax(0,1fr)_260px] max-w-none",
        className
      )
    : clsx(
        "shell-layout-grid mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-10 lg:grid-cols-[220px_minmax(0,1fr)_260px]",
        className
      );
  const ctaContainerClassName = clsx(
    "shell-sidebar space-y-6",
    hasNavItems ? "lg:col-start-3" : "lg:col-start-2",
    "lg:row-start-1",
    skimModeEnabled ? "pt-6" : null
  );
  const mainClassName = clsx(
    "flex flex-col gap-16",
    hasNavItems ? "lg:col-start-2" : "lg:col-start-1",
    "lg:row-start-1"
  );

  return (
    <div
      id="top"
      className="bg-background text-text dark:bg-dark-background dark:text-dark-text"
    >
      <header className={headerClassName}>
        <div className={headerInnerClassName}>
          <div className={headerRowClassName}>
            <div className="flex flex-1 items-center gap-3">
              {showHeaderSkimToggle ? (
                <div className="min-w-[150px] flex-1 md:flex-none">
                  <SkimToggleButton active={skimModeEnabled} locale={locale} />
                </div>
              ) : null}
              {breadcrumbs.length ? (
                <Breadcrumbs
                  items={breadcrumbs}
                  ariaLabel={shellCopy.breadcrumbsLabel}
                  className="flex-1"
                />
              ) : null}
            </div>
            <div className={preferenceControlsClassName}>
              <ThemeToggle className="min-w-[180px] flex-1 md:flex-none" locale={locale} />
              <ContrastToggle className="min-w-[200px] flex-1 md:flex-none" locale={locale} />
              <LanguageSwitcher className="min-w-[250px] flex-1 md:flex-none" />
            </div>
          </div>
          <div className={heroGridClassName}>
            <div className={titleStackClassName}>
              {title ? (
                <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
              ) : null}
              {subtitle ? (
                <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                  {subtitle}
                </p>
              ) : null}
              {showHeroSkimToggle ? (
                <SkimToggleButton active={skimModeEnabled} locale={locale} />
              ) : null}
            </div>
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
          </div>
          {navItems.length ? (
            <AnchorNav
              items={navItems}
              ariaLabel={shellCopy.anchorNavLabel}
              orientation="horizontal"
              className="flex lg:hidden"
            />
          ) : null}
        </div>
      </header>
      <div id="chatbot-slot" data-chatbot-slot="true" />
      <div className={contentGridClassName}>
        <div className={ctaContainerClassName}>
          {cta}
          {floatingWidget}
        </div>

        {navItems.length ? (
          <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
            <div className="sticky top-24 space-y-3">
              <AnchorControlPanel
                enabled={hasNestedAnchors}
                expandLabel={shellCopy.expandAllLabel}
                collapseLabel={shellCopy.collapseAllLabel}
              />
              <AnchorNav items={navItems} ariaLabel={shellCopy.anchorNavLabel} />
              <a
                href="#top"
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              >
                {shellCopy.returnToTopLabel}
              </a>
            </div>
          </div>
        ) : null}

        <main className={mainClassName}>
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-28"
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
              <div className="mt-6 space-y-6 text-base leading-relaxed text-text dark:text-dark-text">
                {section.content}
              </div>
            </section>
          ))}
        </main>
      </div>
      {footer ?? (footerContent ? <ShellFooter content={footerContent} /> : null)}
    </div>
  );
}
