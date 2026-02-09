import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
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
import {
  resolveServicesAvailability,
  type ResolvedServicesAvailability
} from "../../../src/utils/servicesAvailability";
import { PORTFOLIO_SITE_NAME } from "../../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../../src/lib/seo/opengraph-locale";
import {
  ResponsiveShellLayout,
  StickyCTA,
  type ShellSection
} from "../../../src/components/Shell";

const ResponsiveAudioPlayer = dynamicImport(
  () => import("../../../src/components/AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

export const dynamic = "force-static";
export const revalidate = false;

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

function buildSections(
  dictionary: AppDictionary,
  availability: ResolvedServicesAvailability
): ShellSection[] {
  const { contractsFixes } = dictionary;
  const cardClassName =
    "rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-accent";
  const cardTitleClassName = "text-lg font-semibold text-text dark:text-dark-text";
  const cardTaglineClassName =
    "mt-2 text-sm text-textMuted dark:text-dark-textMuted";
  const bulletListClassName =
    "mt-4 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text";
  const scopeSummaryLabel = contractsFixes.scopeTitle;
  const maintenanceSummaryLabel = contractsFixes.maintenanceTitle;
  const scopeBlocks = contractsFixes.scopeBlocks;
  const waitlistTagLabel = contractsFixes.waitlistTagLabel;
  const waitlistCtaSuffix = contractsFixes.waitlistCtaSuffix;
  const { services, bannerMessage } = availability;
  const visiblePackages = contractsFixes.packages.filter(
    (pkg) => services[pkg.id]?.status !== "closed"
  );

  return [
    {
      id: "packages",
      title: contractsFixes.packagesTitle,
      content: (
        <div className="space-y-6">
          {bannerMessage ? (
            <div className="rounded-2xl border-4 border-danger/60 bg-danger/10 px-4 py-3 text-sm text-text dark:border-dark-danger/60 dark:bg-dark-danger/10 dark:text-dark-text">
              {bannerMessage}
            </div>
          ) : null}
          {visiblePackages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/70 px-6 py-6 text-sm text-textMuted shadow-sm dark:border-dark-border dark:bg-dark-surface/70 dark:text-dark-textMuted">
              {contractsFixes.packagesEmptyMessage}
            </div>
          ) : (
            <div className="grid gap-4">
              {visiblePackages.map((pkg) => {
                const service = services[pkg.id] ?? { status: "open" };
                const scopeBlock = scopeBlocks.find(
                  (block) => block.serviceId === pkg.id
                );
                const isMaintenance = pkg.id === "maintenance";
                const isWaitlist = service.status === "waitlist";
                const waitlistCount = service.waitlistCount ?? 0;
                return (
                  <article
                    key={pkg.title}
                    className={cardClassName}
                    data-contract-package="true"
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className={cardTitleClassName}>{pkg.title}</h2>
                          {isWaitlist ? (
                            <span className="rounded-full border border-accent/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent dark:border-dark-accent/30 dark:text-dark-accent">
                              {waitlistTagLabel} {waitlistCount}
                            </span>
                          ) : null}
                        </div>
                        <p className={cardTaglineClassName}>{pkg.tagline}</p>
                        <ul className={bulletListClassName}>
                          {pkg.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                        {scopeBlock ? (
                          <details className="mt-4 rounded-2xl border border-border bg-surface/80 px-4 py-3 text-sm text-text shadow-sm transition dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text">
                            <summary className="cursor-pointer select-none font-semibold text-text dark:text-dark-text">
                              {scopeSummaryLabel}
                            </summary>
                            <div className="mt-3 space-y-4">
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                                  {scopeBlock.includedTitle}
                                </h3>
                                <ul className={bulletListClassName}>
                                  {scopeBlock.included.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                                  {scopeBlock.notIncludedTitle}
                                </h3>
                                <ul className={bulletListClassName}>
                                  {scopeBlock.notIncluded.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                                  {scopeBlock.changePolicyTitle}
                                </h3>
                                <p className="mt-2 text-sm text-text dark:text-dark-text">
                                  {scopeBlock.changePolicy}
                                </p>
                              </div>
                            </div>
                          </details>
                        ) : null}
                        {isMaintenance ? (
                          <details className="mt-4 rounded-2xl border border-border bg-surface/80 px-4 py-3 text-sm text-text shadow-sm transition dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text">
                            <summary className="cursor-pointer select-none font-semibold text-text dark:text-dark-text">
                              {maintenanceSummaryLabel}
                            </summary>
                            <div className="mt-3 space-y-4">
                              <div className="grid gap-4 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border dark:md:divide-dark-border">
                                {contractsFixes.maintenanceTiers.map(
                                  (tier, tierIndex) => (
                                    <div
                                      key={tier.title}
                                      className={
                                        tierIndex === 0 ? "md:pr-4" : "md:pl-4"
                                      }
                                    >
                                      <h3 className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                                        {tier.title}
                                      </h3>
                                      <ul className={bulletListClassName}>
                                        {tier.bullets.map((bullet) => (
                                          <li key={bullet}>{bullet}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )
                                )}
                              </div>
                              <p className="text-sm text-textMuted dark:text-dark-textMuted">
                                {contractsFixes.maintenanceNote}
                              </p>
                            </div>
                          </details>
                        ) : null}
                      </div>
                      <div className="mt-auto space-y-3">
                        {pkg.priceLine ? (
                          <p className="text-sm font-semibold text-text dark:text-dark-text">
                            {pkg.priceLine}
                          </p>
                        ) : null}
                        <Button
                          variant="primary"
                          href={pkg.cta.href}
                          className="w-full"
                          data-variant="primary"
                        >
                          {isWaitlist
                            ? `${pkg.cta.label} (${waitlistCtaSuffix})`
                            : pkg.cta.label}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )
    },
    {
      id: "how-it-works",
      title: contractsFixes.howItWorksTitle,
      content: (
        <ol className="list-decimal space-y-3 pl-5 text-sm text-text dark:text-dark-text">
          {contractsFixes.howItWorksSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )
    },
    {
      id: "deliverables",
      title: contractsFixes.deliverablesTitle,
      content: (
        <ul className="list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text">
          {contractsFixes.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    },
    {
      id: "common-fixes",
      title: contractsFixes.commonFixesTitle,
      content: (
        <div className="grid gap-4">
          {contractsFixes.commonFixesGroups.map((group) => (
            <article
              key={group.title}
              className={cardClassName}
              data-contract-fix-group="true"
            >
              <h2 className={cardTitleClassName}>{group.title}</h2>
              <ul className={bulletListClassName}>
                {group.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )
    },
    {
      id: "faq",
      title: contractsFixes.faqTitle,
      content: (
        <div className="space-y-3">
          {contractsFixes.faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-border bg-surface/80 px-5 py-4 text-sm text-text shadow-sm transition dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-text"
              data-contract-faq="true"
            >
              <summary className="cursor-pointer select-none text-base font-semibold text-text dark:text-dark-text">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-textMuted dark:text-dark-textMuted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      )
    },
  ];
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}/services`])
  );

  return {
    title: dictionary.contractsFixes.metadataTitle,
    description: dictionary.contractsFixes.subtitle,
    alternates: {
      canonical: `/${locale}/services`,
      languages
    },
    openGraph: {
      siteName: PORTFOLIO_SITE_NAME,
      title: dictionary.contractsFixes.metadataTitle,
      description: dictionary.contractsFixes.subtitle,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/services/opengraph-image`]
    }
  };
}

export default function ServicesPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const availability = resolveServicesAvailability();
  const sections = buildSections(dictionary, availability);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.contractsFixes.title
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
  const heroCtas = dictionary.contractsFixes.primaryCtas.filter((cta) => {
    if (!cta.serviceId) {
      return true;
    }
    return availability.services[cta.serviceId]?.status !== "closed";
  });

  return (
    <ResponsiveShellLayout
      title={dictionary.contractsFixes.title}
      subtitle={
        <>
          <span>{dictionary.contractsFixes.subtitle}</span>
          <span className="mt-2 block text-sm text-textMuted dark:text-dark-textMuted">
            {dictionary.contractsFixes.helperLine}
          </span>
          <span className="mt-2 block text-sm text-textMuted dark:text-dark-textMuted">
            <a
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
              href={`/${locale}/services/terms`}
            >
              {dictionary.contractsFixes.termsLinkLabel}
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
            {heroCtas.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                href={action.href}
                className="w-full"
                data-variant={action.variant}
              >
                {action.label}
              </Button>
            ))}
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
