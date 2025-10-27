import type { ReactNode } from "react";
import clsx from "clsx";

import type { AnchorNavItem } from "./AnchorNav";
import { AnchorNav } from "./AnchorNav";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { Breadcrumbs } from "./Breadcrumbs";
import { ShellFooter } from "./Footer";
import { LanguageSwitcher } from "../LanguageSwitcher";

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
  className?: string;
};

export function ShellLayout({
  title,
  subtitle,
  breadcrumbs = [],
  sections,
  anchorItems,
  cta,
  footer,
  className
}: ShellLayoutProps) {
  const navItems =
    anchorItems ??
    sections.map((section) => ({
      label: typeof section.title === "string" ? section.title : section.id,
      href: `#${section.id}`
    }));

  return (
    <div className="bg-background text-text dark:bg-dark-background dark:text-dark-text">
      <header className="border-b border-border bg-surface pb-8 pt-10 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
          <div className="flex flex-wrap items-center gap-4">
            {breadcrumbs.length ? (
              <Breadcrumbs
                items={breadcrumbs}
                className="flex-1"
              />
            ) : null}
            <LanguageSwitcher className="ml-auto" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="max-w-3xl text-base leading-relaxed text-textMuted dark:text-dark-textMuted">
                {subtitle}
              </p>
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
        {navItems.length ? (
          <div className="hidden lg:block">
            <AnchorNav items={navItems} className="sticky top-24" />
          </div>
        ) : null}

        <main className="flex flex-col gap-16">
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

        <div className="shell-sidebar space-y-6">
          {cta}
        </div>
      </div>
      {footer ?? <ShellFooter />}
    </div>
  );
}
