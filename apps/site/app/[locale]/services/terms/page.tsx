import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { Button } from "@portfolio/ui";

import { getDictionary, type AppDictionary } from "../../../../src/utils/dictionaries";
import { locales, parseLocale, type Locale } from "../../../../src/utils/i18n";
import { PORTFOLIO_SITE_NAME } from "../../../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../../../src/lib/seo/opengraph-locale";
import {
  ResponsiveShellLayout,
  StickyCTA,
  type ShellSection
} from "../../../../src/components/Shell";

const ResponsiveAudioPlayer = dynamicImport(
  () => import("../../../../src/components/AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

export const dynamic = "force-static";
export const revalidate = false;

const bulletListClassName =
  "list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text";
const paragraphClassName = "text-sm text-text dark:text-dark-text";
const mutedParagraphClassName =
  "text-sm text-textMuted dark:text-dark-textMuted";
const calloutClassName =
  "rounded-2xl border border-border bg-surface/80 px-4 py-3 text-sm text-text shadow-sm dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text";

const nestedBulletListClassName =
  "mt-2 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text";

type PageParams = {
  params: {
    locale: string;
  };
};

type ServicesTermsCopy = AppDictionary["servicesTerms"];

function ensureLocale(value: string): Locale {
  const locale = parseLocale(value);
  if (!locale) {
    notFound();
  }
  return locale;
}

function buildSections(terms: ServicesTermsCopy): ShellSection[] {
  const sections = terms.sections;

  return [
    {
      id: "what-these-terms-apply-to",
      title: sections.applyTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.applyBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={mutedParagraphClassName}>{sections.applyNote}</p>
        </div>
      )
    },
    {
      id: "scope-deliverables",
      title: sections.scopeTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.scopeBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className={calloutClassName}>{sections.scopeCallout}</div>
        </div>
      )
    },
    {
      id: "change-orders",
      title: sections.changeOrdersTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.changeOrdersBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li>
              {sections.changeOrdersOutOfScopeIntro}
              <ul className={nestedBulletListClassName}>
                {sections.changeOrdersOutOfScopeOptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          </ul>
          <p className={paragraphClassName}>{sections.changeOrdersPromise}</p>
        </div>
      )
    },
    {
      id: "scheduling-communication",
      title: sections.schedulingTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.schedulingBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className={calloutClassName}>{terms.travelNotice}</div>
        </div>
      )
    },
    {
      id: "access-credentials",
      title: sections.accessTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.accessBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={mutedParagraphClassName}>{sections.accessNote}</p>
        </div>
      )
    },
    {
      id: "payment",
      title: sections.paymentTitle,
      content: (
        <ul className={bulletListClassName}>
          {sections.paymentBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    },
    {
      id: "timelines-estimates",
      title: sections.timelinesTitle,
      content: (
        <div className="space-y-3">
          <ul className={bulletListClassName}>
            {sections.timelinesBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={mutedParagraphClassName}>{sections.timelinesNote}</p>
        </div>
      )
    },
    {
      id: "support-window",
      title: sections.supportTitle,
      content: (
        <ul className={bulletListClassName}>
          {sections.supportBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    },
    {
      id: "client-responsibilities",
      title: sections.responsibilitiesTitle,
      content: (
        <ul className={bulletListClassName}>
          {sections.responsibilitiesBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    },
    {
      id: "limitations",
      title: sections.limitationsTitle,
      content: (
        <ul className={bulletListClassName}>
          {sections.limitationsBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    },
    {
      id: "final-cta",
      title: sections.finalCtaTitle,
      content: (
        <div className="space-y-4">
          <p className={paragraphClassName}>{sections.finalCtaBody}</p>
          <Button variant="primary" href={sections.finalCtaButtonHref}>
            {sections.finalCtaButtonLabel}
          </Button>
          <p className="text-xs text-textMuted dark:text-dark-textMuted">
            {terms.lastUpdatedLabel}
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
  const terms = dictionary.servicesTerms;
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}/services/terms`])
  );

  return {
    title: terms.metadataTitle,
    description: terms.metadataDescription,
    alternates: {
      canonical: `/${locale}/services/terms`,
      languages
    },
    openGraph: {
      siteName: PORTFOLIO_SITE_NAME,
      title: terms.metadataTitle,
      description: terms.metadataDescription,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/services/terms/opengraph-image`]
    }
  };
}

export default function ServicesTermsPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const terms = dictionary.servicesTerms;
  const sections = buildSections(terms);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: terms.title
    }
  ];
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
    <ResponsiveShellLayout
      title={terms.title}
      subtitle={
        <>
          <a
            className="block text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
            href={`/${locale}/services`}
          >
            {terms.backLinkLabel}
          </a>
          <span className="mt-2 block">{terms.subtitle}</span>
          <span className="mt-2 block text-sm text-textMuted dark:text-dark-textMuted">
            <a
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
              href={terms.questionCtaHref}
            >
              {terms.helperLine}
            </a>
          </span>
        </>
      }
      breadcrumbs={breadcrumbs}
      sections={sections}
      floatingWidget={
        <ResponsiveAudioPlayer
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
        <div className="shell-stacked-sidebar space-y-4 lg:sticky lg:top-24">
          <StickyCTA sticky={false}>
            <Button
              variant="primary"
              href={terms.questionCtaHref}
              className="w-full"
              data-variant="primary"
            >
              {terms.questionCtaLabel}
            </Button>
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
