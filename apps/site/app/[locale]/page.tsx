import { Button } from "@portfolio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import dynamicImport from "next/dynamic";
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
import { headers } from "next/headers";
import { StructuredData } from "../../src/components/seo/StructuredData";
import { getResumeProfile } from "../../src/lib/resume/profile";
import { buildHomePageJsonLd } from "../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../src/lib/seo/opengraph-locale";
import { extractNonceFromHeaders } from "../../src/utils/csp";
import { TechStackCarousel } from "../../src/components/TechStackCarousel";
import { DesktopSkimLayout } from "../../src/components/DesktopSkimLayout";
import { MobileSkimLayout } from "../../src/components/MobileSkimLayout";
import { SocialLinks } from "../../src/components/SocialLinks";

const ResponsiveAudioPlayer = dynamicImport(
  () => import("../../src/components/AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

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
          <TechStackCarousel items={techStackItems} labels={sections.techStack.carousel} />
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

function buildSkimSections(
  dictionary: AppDictionary,
  locale: Locale,
  layout: "desktop" | "mobile"
) {
  const {
    home: { sections, skim },
    experience
  } = dictionary;
  const techDetailMap = new Map(
    experience.techStack.map((entry) => [entry.title.toLowerCase(), entry.id])
  );

  const techStackItems = sections.techStack.items.map((item) => ({
    ...item,
    href: `/${locale}/experience#${techDetailMap.get(item.name.toLowerCase()) ?? item.assetId}`
  }));

  const leadershipValue = (
    <>
      <Link
        href={`/${locale}/experience#rollodex`}
        className="inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
      >
        {skim.leadershipRollodexLinkText}
      </Link>
      <span>{skim.leadershipRollodexSuffix}</span>
      <Link
        href={`/${locale}/experience#ser321`}
        className="inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
      >
        {skim.leadershipTeachingAssistantLinkText}
      </Link>
      <span>{skim.leadershipTeachingAssistantSuffix}</span>
    </>
  );

  const timezoneLinkText = skim.timezoneLinkText;
  const timezoneHref = `/${locale}/meetings`;
  const timezonePrefix = timezoneLinkText
    ? skim.timezone.replace(timezoneLinkText, "").trim()
    : skim.timezone;
  const timezoneValue = (
    <>
      {timezonePrefix ? <span>{timezonePrefix} </span> : null}
      <Link
        href={toUrlObject(timezoneHref)}
        className="inline-flex text-base font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
      >
        {timezoneLinkText ?? skim.timezone}
      </Link>
    </>
  );

  const summaryItems = [
    {
      id: "project-management",
      label: skim.projectManagementLabel,
      value: skim.projectManagement
    },
    {
      id: "leadership",
      label: skim.leadershipLabel,
      value: leadershipValue
    },
    {
      id: "timezone",
      label: skim.timezoneLabel,
      value: timezoneValue
    }
  ];
  const skimLayoutProps = {
    columnTitle: skim.columnTitle,
    summaryItems,
    techStackTitle: skim.techStackTitle,
    techStackItems,
    techStackCarouselLabels: sections.techStack.carousel,
    availabilityLabel: skim.availabilityLabel,
    availability: skim.availability
  };

  return [
    {
      id: "skim-summary",
      title: "",
      content: (
        layout === "mobile"
          ? <MobileSkimLayout {...skimLayoutProps} />
          : <DesktopSkimLayout {...skimLayoutProps} />
      )
    }
  ];
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params, searchParams }: PageProps): Metadata {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const skimModeEnabled = resolveSkimMode(searchParams);
  const openGraphImage = skimModeEnabled
    ? `/${locale}/opengraph-skim`
    : `/${locale}/opengraph-image`;
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}`])
  );

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    alternates: {
      canonical: `/${locale}`,
      languages
    },
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [openGraphImage]
    }
  };
}

export default function HomePage({ params, searchParams }: PageProps) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const skimModeEnabled = resolveSkimMode(searchParams);
  const sections = skimModeEnabled
    ? buildSkimSections(dictionary, locale, "desktop")
    : buildSections(dictionary, locale);
  const mobileSections = skimModeEnabled
    ? buildSkimSections(dictionary, locale, "mobile")
    : sections;
  const breadcrumbs = skimModeEnabled ? [] : resolveBreadcrumbs(dictionary, locale);
  const {
    hero: { title, subtitle, cta, media }
  } = dictionary.home;
  const resumeProfile = getResumeProfile(locale);
  const resumeDownloadFilename = `jack-featherstone-resume-${resumeProfile.resumeVersion}.pdf`;
  const structuredData = buildHomePageJsonLd({
    locale,
    dictionary,
    profile: resumeProfile
  });
  const nonce = extractNonceFromHeaders(headers());
  const pageTitle = skimModeEnabled ? undefined : title;
  const pageSubtitle = skimModeEnabled ? undefined : subtitle;
  const heroMedia = skimModeEnabled ? undefined : media;
  const anchorItems = skimModeEnabled ? [] : undefined;
  const emailValue = dictionary.home.skim.emailValue;
  const emailHref = dictionary.home.skim.emailHref;

  return (
    <>
      <StructuredData data={structuredData} nonce={nonce} />
      <div data-skim-mode={skimModeEnabled ? "true" : "false"}>
        <ResponsiveShellLayout
          title={pageTitle}
          subtitle={pageSubtitle}
          heroMedia={heroMedia}
          breadcrumbs={breadcrumbs}
          sections={sections}
          mobileSections={mobileSections}
          anchorItems={anchorItems}
          skimModeEnabled={skimModeEnabled}
          socialLinks={<SocialLinks />}
          shellCopy={dictionary.shell}
          locale={locale}
          footerContent={dictionary.home.footer}
          floatingWidget={
            !skimModeEnabled ? (
              <ResponsiveAudioPlayer
                src={dictionary.home.audioPlayer.src}
                title={dictionary.home.audioPlayer.title}
                description={dictionary.home.audioPlayer.description}
                playLabel={dictionary.home.audioPlayer.playLabel}
                pauseLabel={dictionary.home.audioPlayer.pauseLabel}
                downloadLabel={dictionary.home.audioPlayer.downloadLabel}
                closeLabel={dictionary.home.audioPlayer.closeLabel}
                reopenLabel={dictionary.home.audioPlayer.reopenLabel}
                volumeLabel={dictionary.home.audioPlayer.volumeLabel}
                volumeShowLabel={dictionary.home.audioPlayer.volumeShowLabel}
                volumeHideLabel={dictionary.home.audioPlayer.volumeHideLabel}
                locale={locale}
                trackId={dictionary.home.audioPlayer.trackId}
              />
            ) : null
          }
          cta={
            <div
              className="shell-stacked-sidebar space-y-4 lg:sticky lg:top-24"
            >
              <StickyCTA
                title={cta.title}
                description={cta.description}
                sticky={false}
                className={skimModeEnabled ? "pl-6 pr-6 py-6" : undefined}
              >
                {cta.actions.map((action) =>
                  action.href ? (
                    <Button
                      key={`${action.label}-${action.variant}`}
                      variant={action.variant}
                      href={action.href}
                      className="w-full"
                      data-variant={action.variant}
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
                    >
                      {action.label}
                    </Button>
                  )
                )}
              </StickyCTA>
              {skimModeEnabled ? (
                <div className="skim-card skim-email-card rounded-2xl border border-border bg-surface/95 px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/95">
                  <p className="font-semibold text-text dark:text-dark-text">
                    {dictionary.home.skim.emailLabel}
                  </p>
                  <a
                    className="mt-1 inline-flex text-text underline underline-offset-2 transition hover:text-accent dark:text-dark-text dark:hover:text-dark-accent"
                    href={emailHref}
                  >
                    {emailValue}
                  </a>
                </div>
              ) : null}
            </div>
          }
        />
      </div>
    </>
  );
}
