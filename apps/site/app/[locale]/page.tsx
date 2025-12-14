import { Button } from "@portfolio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { UrlObject } from "url";

import {
  getDictionary,
  type AppDictionary
} from "../../src/utils/dictionaries";
import { isLocale, locales, type Locale } from "../../src/utils/i18n";
import {
  ResponsiveShellLayout,
  StickyCTA
} from "../../src/components/Shell";
import { ResponsiveAudioPlayer } from "../../src/components/AudioPlayer";
import { headers } from "next/headers";
import { StructuredData } from "../../src/components/seo/StructuredData";
import { getResumeProfile } from "../../src/lib/resume/profile";
import { buildHomePageJsonLd } from "../../src/lib/seo/jsonld";
import { extractNonceFromHeaders } from "../../src/utils/csp";
import { TechStackCarousel } from "../../src/components/TechStackCarousel";

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

  return [{ label: breadcrumbs.home, href: `/${locale}` }];
}

function toUrlObject(href: string): UrlObject {
  const [pathname, hash] = href.split("#");
  return hash
    ? { pathname, hash: `#${hash}` }
    : { pathname };
}

function buildSections(dictionary: AppDictionary, locale: Locale) {
  const {
    home: { sections }
  } = dictionary;
  const techDetailMap = new Map(
    dictionary.experience.techStack.map((entry) => [entry.title.toLowerCase(), entry.id])
  );

  const techStackItems = sections.techStack.items.map((item) => ({
    ...item,
    href: `/${locale}/experience#${techDetailMap.get(item.name.toLowerCase()) ?? item.assetId}`
  }));

  return [
    {
      id: "tech-stack",
      eyebrow: sections.techStack.eyebrow,
      title: sections.techStack.title,
      description: sections.techStack.description,
      content: (
        <>
          <p>{sections.techStack.overview}</p>
          <TechStackCarousel items={techStackItems} />
        </>
      )
    },
    {
      id: "past-achievements",
      eyebrow: sections.proof.eyebrow,
      title: sections.proof.title,
      description: sections.proof.description,
      content: (
        <>
          <p>{sections.proof.overview}</p>
          <ul className="grid list-none gap-4 sm:grid-cols-2">
            {sections.proof.proofChips.map((chip) => (
              <li key={chip.title}>
                <Link
                  href={toUrlObject(chip.href)}
                  className="block rounded-xl border border-border bg-surface px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-dark-border dark:bg-dark-surface dark:focus-visible:ring-dark-accent"
                >
                  <span className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                    {chip.title}
                  </span>
                  <p className="mt-2 text-sm">
                    {chip.details}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: "current-projects",
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
  const sections = buildSections(dictionary, locale);
  const breadcrumbs = resolveBreadcrumbs(dictionary, locale);
  const {
    hero: { title, subtitle, cta, media }
  } = dictionary.home;
  const skimModeEnabled = resolveSkimMode(searchParams);
  const resumeProfile = getResumeProfile();
  const resumeDownloadFilename = `jack-featherstone-resume-${resumeProfile.resumeVersion}.pdf`;
  const structuredData = buildHomePageJsonLd({
    locale,
    dictionary,
    profile: resumeProfile
  });
  const nonce = extractNonceFromHeaders(headers());

  return (
    <>
      <StructuredData data={structuredData} nonce={nonce} />
      <div data-skim-mode={skimModeEnabled ? "true" : "false"}>
        <ResponsiveShellLayout
          title={title}
          subtitle={subtitle}
          heroMedia={media}
          breadcrumbs={breadcrumbs}
          sections={sections}
          skimModeEnabled={skimModeEnabled}
          locale={locale}
          footerContent={dictionary.home.footer}
          cta={
            <div className="space-y-4">
              <StickyCTA title={cta.title} description={cta.description}>
                {cta.actions.map((action, index) =>
                  action.href ? (
                    <Button
                      key={`${action.label}-${action.variant}`}
                      variant={action.variant}
                      href={action.href}
                      className="w-full"
                      data-variant={action.variant}
                      tabIndex={index === 0 ? 1 : undefined}
                      download={
                        action.download ? resumeDownloadFilename : undefined
                      }
                      rel={
                        action.href.startsWith("http")
                          ? "noreferrer noopener"
                          : undefined
                      }
                    >
                      {action.label}
                    </Button>
                  ) : (
                    <Button
                      key={`${action.label}-${action.variant}`}
                      variant={action.variant}
                      className="w-full"
                      data-variant={action.variant}
                      tabIndex={index === 0 ? 1 : undefined}
                    >
                      {action.label}
                    </Button>
                  )
                )}
              </StickyCTA>
            </div>
          }
        />
        <ResponsiveAudioPlayer
          src={dictionary.home.audioPlayer.src}
          title={dictionary.home.audioPlayer.title}
          description={dictionary.home.audioPlayer.description}
          playLabel={dictionary.home.audioPlayer.playLabel}
          pauseLabel={dictionary.home.audioPlayer.pauseLabel}
          downloadLabel={dictionary.home.audioPlayer.downloadLabel}
          closeLabel={dictionary.home.audioPlayer.closeLabel}
          reopenLabel={dictionary.home.audioPlayer.reopenLabel}
          locale={locale}
          trackId={dictionary.home.audioPlayer.trackId}
        />
      </div>
    </>
  );
}
