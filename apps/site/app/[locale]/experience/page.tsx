import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getDictionary,
  type AppDictionary
} from "../../../src/utils/dictionaries";
import {
  locales,
  parseLocale,
  type Locale
} from "../../../src/utils/i18n";
import {
  ShellLayout,
  type ShellSection
} from "../../../src/components/Shell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageParams = {
  params: {
    locale: string;
  };
};

function ensureLocale(value: string): Locale {
  const locale = parseLocale(value);
  if (!locale) {
    notFound();
  }
  return locale;
}

function buildSections(dictionary: AppDictionary): ShellSection[] {
  return [
    {
      id: "experience",
      title: dictionary.experience.title,
      description: dictionary.experience.subtitle,
      content: (
        <div className="space-y-6">
          {dictionary.experience.entries.map((entry) => (
            <article
              key={`${entry.company}-${entry.role}`}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-accent"
            >
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                  {entry.timeframe}
                </p>
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                  {entry.role}
                </h2>
                <p className="text-sm text-textMuted dark:text-dark-textMuted">
                  {entry.company}
                </p>
              </div>
              <p className="mt-4 text-sm text-text dark:text-dark-text">
                {entry.summary}
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )
    }
  ];
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.experience.title,
    description: dictionary.experience.subtitle
  };
}

export default function ExperiencePage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.experience.title
    }
  ];

  return (
    <ShellLayout
      title={dictionary.experience.title}
      subtitle={dictionary.experience.subtitle}
      breadcrumbs={breadcrumbs}
      sections={sections}
      showSkimToggle={false}
      locale={locale}
    />
  );
}
