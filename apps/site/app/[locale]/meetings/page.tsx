import Image from "next/image";
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
          <figure className="rounded-3xl border border-border bg-surface p-4 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surface dark:text-dark-textMuted">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/meeting-avail.png"
                alt={dictionary.meetings.availability.alt}
                width={378}
                height={611}
                className="mx-auto h-auto w-full max-w-[320px]"
              />
            </div>
            <figcaption className="mt-3 text-center">
              {dictionary.meetings.availability.description}
              {dictionary.meetings.availability.timezoneHref ? (
                <>
                  {" "}
                  <a
                    href={dictionary.meetings.availability.timezoneHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-text underline underline-offset-4 hover:text-accent dark:text-dark-text dark:hover:text-dark-accent"
                  >
                    {dictionary.meetings.availability.timezoneLabel ??
                      dictionary.meetings.availability.timezoneHref}
                  </a>
                </>
              ) : null}
            </figcaption>
          </figure>
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
