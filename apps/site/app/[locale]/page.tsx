import { Button } from "@portfolio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getDictionary,
  type AppDictionary
} from "../../src/utils/dictionaries";
import { isLocale, locales, type Locale } from "../../src/utils/i18n";
import {
  ShellLayout,
  StickyCTA
} from "../../src/components/Shell";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type PageParams = {
  params: {
    locale: string;
  };
};

type PageProps = PageParams & {
  searchParams?: Record<string, string | string[] | undefined>;
};

function isTruthySkimValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes"
  );
}

function resolveSkimMode(
  searchParams?: Record<string, string | string[] | undefined>
) {
  if (!searchParams) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(searchParams, "skim")) {
    return false;
  }

  const raw = searchParams.skim;

  if (Array.isArray(raw)) {
    return raw.some((entry) => typeof entry === "string" && isTruthySkimValue(entry));
  }

  if (typeof raw === "string") {
    return isTruthySkimValue(raw);
  }

  return true;
}

function ensureLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

function resolveBreadcrumbs(dictionary: AppDictionary, locale: Locale) {
  const {
    home: { breadcrumbs }
  } = dictionary;

  return [
    { label: breadcrumbs.home, href: `/${locale}` },
    { label: breadcrumbs.workspace }
  ];
}

function buildSections(dictionary: AppDictionary) {
  const {
    home: { sections }
  } = dictionary;

  return [
    {
      id: "mission",
      eyebrow: sections.mission.eyebrow,
      title: sections.mission.title,
      description: sections.mission.description,
      content: (
        <>
          <p>{sections.mission.overview}</p>
          <ul className="list-disc space-y-2 pl-5">
            {sections.mission.bulletPoints.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "proof",
      eyebrow: sections.proof.eyebrow,
      title: sections.proof.title,
      description: sections.proof.description,
      content: (
        <>
          <p>{sections.proof.overview}</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            {sections.proof.proofChips.map((chip) => (
              <div
                key={chip.title}
                className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface"
              >
                <dt className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                  {chip.title}
                </dt>
                <dd className="mt-2 text-sm">
                  {chip.details}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )
    },
    {
      id: "roadmap",
      eyebrow: sections.roadmap.eyebrow,
      title: sections.roadmap.title,
      description: sections.roadmap.description,
      content: (
        <>
          <p>{sections.roadmap.overview}</p>
          <ol className="list-decimal space-y-2 pl-5">
            {sections.roadmap.nextSteps.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </>
      )
    }
  ];
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description
  };
}

export default function HomePage({ params, searchParams }: PageProps) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary);
  const breadcrumbs = resolveBreadcrumbs(dictionary, locale);
  const {
    hero: { title, subtitle, cta }
  } = dictionary.home;
  const skimModeEnabled = resolveSkimMode(searchParams);

  return (
    <div data-skim-mode={skimModeEnabled ? "true" : "false"}>
      <ShellLayout
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        sections={sections}
        cta={
          <StickyCTA title={cta.title} description={cta.description}>
            {cta.actions.map((action) => (
              <Button key={action.label} variant={action.variant}>
                {action.label}
              </Button>
            ))}
          </StickyCTA>
        }
      />
    </div>
  );
}
