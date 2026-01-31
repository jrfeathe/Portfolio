import { Button } from "@portfolio/ui";
import type { Metadata, Route } from "next";
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
  StickyCTA,
  type ShellSection
} from "../../src/components/Shell";
import { StructuredData } from "../../src/components/seo/StructuredData";
import { getResumeProfile } from "../../src/lib/resume/profile";
import { buildHomePageJsonLd, PORTFOLIO_SITE_NAME } from "../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../src/lib/seo/opengraph-locale";
import { TechStackCarousel } from "../../src/components/TechStackCarousel";
import { DesktopSkimLayout } from "../../src/components/DesktopSkimLayout";
import { MobileSkimLayout } from "../../src/components/MobileSkimLayout";
import { SocialLinks } from "../../src/components/SocialLinks";
import { SkimModeWrapper } from "../../src/components/SkimModeWrapper";
import { SkimAwareAudioPlayer } from "../../src/components/SkimAwareAudioPlayer";

export const dynamic = "force-static";
export const revalidate = false;

type PageParams = {
  params: {
    locale: string;
  };
};

type PageProps = PageParams;

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

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function buildSections(dictionary: AppDictionary, locale: Locale): ShellSection[] {
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
): ShellSection[] {
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
      {skim.leadershipRollodexPrefix ? (
        <span>{skim.leadershipRollodexPrefix}</span>
      ) : null}
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

function buildPrintSkimSection(dictionary: AppDictionary): ShellSection {
  const {
    home: { skim, sections }
  } = dictionary;
  const summaryItems = [
    { label: skim.projectManagementLabel, value: skim.projectManagement },
    { label: skim.leadershipLabel, value: skim.leadership },
    { label: skim.timezoneLabel, value: skim.timezone },
    { label: skim.availabilityLabel, value: skim.availability },
    { label: skim.emailLabel, value: skim.emailValue }
  ].filter((entry) => entry.label && entry.value);
  const techStackNames = sections.techStack.items
    .map((item) => item.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: "print-skim-summary",
    title: skim.columnTitle,
    className: "print-skim-section",
    hideFromNav: true,
    content: (
      <div className="space-y-4">
        <dl className="space-y-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                {item.label}
              </dt>
              <dd className="text-base leading-relaxed text-text dark:text-dark-text">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            {skim.techStackTitle}
          </h3>
          <ul className="print-tech-list list-disc pl-5 text-base leading-relaxed text-text dark:text-dark-text">
            {techStackNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const openGraphImage = `/${locale}/opengraph-image`;
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
      siteName: PORTFOLIO_SITE_NAME,
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [openGraphImage]
    }
  };
}

export default function HomePage({ params }: PageProps) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const fullSections = buildSections(dictionary, locale);
  const printSkimSection = buildPrintSkimSection(dictionary);
  const skimDesktopSections = buildSkimSections(dictionary, locale, "desktop").map((section) => ({
    ...section,
    className: "skim-only",
    hideFromNav: true
  }));
  const skimMobileSections = buildSkimSections(dictionary, locale, "mobile").map((section) => ({
    ...section,
    className: "skim-only",
    hideFromNav: true
  }));
  const fullSectionsWithClasses = fullSections.map((section) => ({
    ...section,
    className: section.className ? `${section.className} skim-hide` : "skim-hide"
  }));
  const sections = [printSkimSection, ...skimDesktopSections, ...fullSectionsWithClasses];
  const mobileSections = [printSkimSection, ...skimMobileSections, ...fullSectionsWithClasses];
  const breadcrumbs = resolveBreadcrumbs(dictionary, locale);
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
  const pageTitle = title;
  const pageSubtitle = subtitle;
  const heroMedia =
    !media
      ? undefined
      : {
          ...media,
          caption:
            locale === "en" && media.caption
              ? <em>{media.caption}</em>
              : media.caption
        };
  const anchorItems = undefined;
  const emailValue = dictionary.home.skim.emailValue;
  const emailHref = dictionary.home.skim.emailHref;
  const audioSources = [
    {
      src: dictionary.home.audioPlayer.src,
      type: "audio/ogg; codecs=opus"
    },
    ...(dictionary.home.audioPlayer.fallbackSrc
      ? [
          {
            src: dictionary.home.audioPlayer.fallbackSrc,
            type: "audio/mpeg"
          }
        ]
      : [])
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <SkimModeWrapper>
        <ResponsiveShellLayout
          title={pageTitle}
          subtitle={pageSubtitle}
          heroMedia={heroMedia}
          breadcrumbs={breadcrumbs}
          sections={sections}
          mobileSections={mobileSections}
          anchorItems={anchorItems}
          socialLinks={<SocialLinks />}
          shellCopy={dictionary.shell}
          locale={locale}
          footerContent={dictionary.home.footer}
          floatingWidget={
            <SkimAwareAudioPlayer
              sources={audioSources}
              downloadSrc={
                dictionary.home.audioPlayer.fallbackSrc ??
                dictionary.home.audioPlayer.src
              }
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
          }
          cta={
            <div
              className="shell-stacked-sidebar space-y-4 lg:sticky lg:top-24"
            >
              <StickyCTA
                title={cta.title}
                description={cta.description}
                sticky={false}
                className="home-cta-card"
              >
                {cta.actions.map((action) =>
                  action.href ? (
                    isInternalHref(action.href) && !action.download ? (
                      <Link
                        key={`${action.label}-${action.variant}`}
                        href={action.href as Route}
                        passHref
                        legacyBehavior
                      >
                        <Button
                          variant={action.variant}
                          href={action.href}
                          className="w-full"
                          data-variant={action.variant}
                        >
                          {action.label}
                        </Button>
                      </Link>
                    ) : (
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
                    )
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
              <div className="skim-only skim-card skim-email-card rounded-2xl border border-border bg-surface/95 px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur dark:border-dark-border dark:bg-dark-surface/95">
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
            </div>
          }
        />
      </SkimModeWrapper>
    </>
  );
}
