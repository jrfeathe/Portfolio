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
      id: "formats",
      title: dictionary.meetings.title,
      description: dictionary.meetings.subtitle,
      content: (
        <div className="space-y-6">
          <p>{dictionary.meetings.intro}</p>
          <ul className="space-y-4">
            {dictionary.meetings.slots.map((slot) => (
              <li
                key={slot.title}
                className="rounded-2xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface"
              >
                <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                  {slot.title}
                </h2>
                <p className="mt-2 text-sm text-textMuted dark:text-dark-textMuted">
                  {slot.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "contact",
      title: dictionary.meetings.contactLabel,
      content: (
        <div className="space-y-3">
          <a
            href={dictionary.meetings.contactHref}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          >
            {dictionary.meetings.contactHref.replace(/^mailto:/, "")}
          </a>
          <p className="text-sm text-textMuted dark:text-dark-textMuted">
            {dictionary.meetings.contactNote}
          </p>
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
    title: dictionary.meetings.title,
    description: dictionary.meetings.subtitle
  };
}

export default function MeetingsPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.meetings.title
    }
  ];

  return (
    <ShellLayout
      title={dictionary.meetings.title}
      subtitle={dictionary.meetings.subtitle}
      breadcrumbs={breadcrumbs}
      sections={sections}
      showSkimToggle={false}
      locale={locale}
    />
  );
}
