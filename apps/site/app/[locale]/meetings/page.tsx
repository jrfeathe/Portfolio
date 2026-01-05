import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@portfolio/ui";

import {
  getDictionary,
  type AppDictionary
} from "../../../src/utils/dictionaries";
import {
  locales,
  parseLocale,
  type Locale
} from "../../../src/utils/i18n";
import { getResumeProfile } from "../../../src/lib/resume/profile";
import { resolveOpenGraphLocale } from "../../../src/lib/seo/opengraph-locale";
import {
  ResponsiveShellLayout,
  StickyCTA,
  type ShellSection
} from "../../../src/components/Shell";
import { AvailabilitySection } from "../../../src/components/meetings/AvailabilitySection";

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

function buildSections(dictionary: AppDictionary, locale: Locale): ShellSection[] {
  return [
    {
      id: "formats",
      title: dictionary.meetings.section1title,
      description: dictionary.meetings.section1subtitle,
      content: (
        <div className="space-y-6">
          <p>{dictionary.meetings.intro}</p>
          <AvailabilitySection copy={dictionary.meetings.availability} locale={locale} />
          <ul className="space-y-4">
            {dictionary.meetings.slots.map((slot) => (
              <li
                key={slot.title}
                className="rounded-2xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface"
                data-meeting-slot="true"
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
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}/meetings`])
  );

  return {
    title: dictionary.meetings.metadataTitle,
    description: dictionary.meetings.subtitle,
    alternates: {
      canonical: `/${locale}/meetings`,
      languages
    },
    openGraph: {
      title: dictionary.meetings.metadataTitle,
      description: dictionary.meetings.subtitle,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/meetings/opengraph-image`]
    }
  };
}

export default function MeetingsPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary, locale);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.meetings.title
    }
  ];
  const resumeProfile = getResumeProfile(locale);
  const resumeDownloadFilename = `jack-featherstone-resume-${resumeProfile.resumeVersion}.pdf`;
  const homeCta = dictionary.home.hero.cta;
  const filteredActions = homeCta.actions.filter(
    (action) => !action.href || !action.href.startsWith(`/${locale}/meetings`)
  );

  return (
    <ResponsiveShellLayout
      title={dictionary.meetings.title}
      subtitle={dictionary.meetings.subtitle}
      breadcrumbs={breadcrumbs}
      sections={sections}
      cta={
        <div className="shell-stacked-sidebar space-y-4 lg:sticky lg:top-24">
          <StickyCTA
            title={homeCta.title}
            description={homeCta.description}
            sticky={false}
          >
            {filteredActions.map((action) =>
              action.href ? (
                <Button
                  key={`${action.label}-${action.variant}`}
                  variant={action.variant}
                  href={action.href}
                  className="w-full"
                  data-variant={action.variant}
                  download={action.download ? resumeDownloadFilename : undefined}
                  rel={action.href.startsWith("http") ? "noreferrer noopener" : undefined}
                >
                  {action.label}
                </Button>
              ) : (
                <Button
                  key={`${action.label}-${action.variant}`}
                  variant={action.variant}
                  className="w-full"
                  data-variant={action.variant}
                >
                  {action.label}
                </Button>
              )
            )}
          </StickyCTA>
        </div>
      }
      showSkimToggle={false}
      shellCopy={dictionary.shell}
      footerContent={dictionary.home.footer}
      locale={locale}
    />
  );
}
