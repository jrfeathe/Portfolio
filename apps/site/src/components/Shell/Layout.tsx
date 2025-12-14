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
  locale: Locale;
};

export function ShellLayout({
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
}: ShellLayoutProps) {
  const navItems: AnchorNavItem[] =
    anchorItems ??
    sections.map((section): AnchorNavItem => ({
      label: typeof section.title === "string" ? section.title : section.id,
      href: `#${section.id}`
    }));
  const hasNestedAnchors = navItems.some((item) => item.children?.length);

  return (
    <div
      id="top"
      className="bg-background text-text dark:bg-dark-background dark:text-dark-text"
    >
      <header className="border-b border-border bg-surface pb-8 pt-10 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
          <div className="flex flex-wrap items-center gap-4">
            {breadcrumbs.length ? (
              <Breadcrumbs
                items={breadcrumbs}
                className="flex-1"
              />
            ) : null}
            <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-3 md:flex-none">
              <ThemeToggle className="min-w-[180px] flex-1 md:flex-none" locale={locale} />
              <ContrastToggle className="min-w-[200px] flex-1 md:flex-none" locale={locale} />
              <LanguageSwitcher className="min-w-[250px] flex-1 md:flex-none" />
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                  {subtitle}
                </p>
              ) : null}
              {showSkimToggle ? (
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
              orientation="horizontal"
              className="flex lg:hidden"
            />
          ) : null}
        </div>
      </header>
      <div
        className={clsx(
          "shell-layout-grid mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-10 lg:grid-cols-[220px_minmax(0,1fr)_260px]",
          className
        )}
      >
        <main className="flex flex-col gap-16 lg:col-start-2">
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

        <div className="shell-sidebar space-y-6 lg:col-start-3">
          {cta}
        </div>

        {navItems.length ? (
          <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
            <div className="sticky top-24 space-y-3">
              <AnchorControlPanel enabled={hasNestedAnchors} />
              <AnchorNav items={navItems} />
              <a
                href="#top"
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              >
                Return to top
              </a>
            </div>
          </div>
        ) : null}
      </div>
      {footer ?? <ShellFooter content={footerContent} />}
    </div>
  );
}
