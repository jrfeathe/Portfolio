import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@portfolio/ui";

import { serviceProofItems } from "../../../../../../content/serviceProofItems";
import { serviceTestimonials } from "../../../../../../content/serviceTestimonials";
import {
  getDictionary,
  type AppDictionary
} from "../../../../src/utils/dictionaries";
import {
  locales,
  parseLocale,
  type Locale
} from "../../../../src/utils/i18n";
import { resolveServicesAvailability } from "../../../../src/utils/servicesAvailability";
import { PORTFOLIO_SITE_NAME } from "../../../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../../../src/lib/seo/opengraph-locale";
import {
  ResponsiveShellLayout,
  StickyCTA,
  type ShellSection
} from "../../../../src/components/Shell";
import { ServiceProofFilterBar } from "../../../../src/components/serviceProof/ServiceProofFilterBar";
import { ServiceProofItemsSection } from "../../../../src/components/serviceProof/ServiceProofItemsSection";
import { ServiceProofTestimonialsSection } from "../../../../src/components/serviceProof/ServiceProofTestimonialsSection";

const ResponsiveAudioPlayer = dynamicImport(
  () =>
    import("../../../../src/components/AudioPlayer").then(
      (mod) => mod.ResponsiveAudioPlayer
    ),
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
  locale: Locale
): ShellSection[] {
  const { serviceProof } = dictionary;
  const mobileSectionSpacingClassName = "[&>div.mt-0]:mt-2";

  return [
    {
      id: "before-after",
      title: serviceProof.sections.proofTitle,
      description: serviceProof.sections.proofDescription,
      content: (
        <ServiceProofItemsSection
          items={serviceProofItems}
          testimonials={serviceTestimonials}
          locale={locale}
          copy={serviceProof}
          requestEmail={dictionary.home.footer.email}
        />
      )
    },
    {
      id: "testimonials",
      title: serviceProof.sections.testimonialsTitle,
      description: serviceProof.sections.testimonialsDescription,
      content: (
        <ServiceProofTestimonialsSection
          testimonials={serviceTestimonials}
          locale={locale}
          copy={serviceProof}
        />
      )
    },
    {
      id: "trust-notes",
      title: serviceProof.sections.trustTitle,
      className: "[&>div.mt-6]:mt-2",
      content: (
        <div className="space-y-2">
          <ul className="list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text">
            {serviceProof.sections.trustNotes.map((note, index) => {
              const isTermsLink = note === serviceProof.sections.trustLinkLabel;
              return (
                <li key={`${note}-${index}`}>
                  {isTermsLink ? (
                    <Link
                      className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                      href={`/${locale}/services/terms`}
                    >
                      {note}
                    </Link>
                  ) : (
                    note
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )
    }
  ].map((section) => ({
    ...section,
    className: [section.className, mobileSectionSpacingClassName]
      .filter(Boolean)
      .join(" ")
  }));
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}/services/proof`])
  );

  return {
    title: dictionary.serviceProof.metadataTitle,
    description: dictionary.serviceProof.subtitle,
    alternates: {
      canonical: `/${locale}/services/proof`,
      languages
    },
    openGraph: {
      siteName: PORTFOLIO_SITE_NAME,
      title: dictionary.serviceProof.metadataTitle,
      description: dictionary.serviceProof.subtitle,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/services/proof/opengraph-image`]
    }
  };
}

export default function ServiceProofPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const availability = resolveServicesAvailability();
  const sections = buildSections(dictionary, locale);
  const heroCtas = dictionary.contractsFixes.primaryCtas.filter((cta) => {
    if (!cta.serviceId) {
      return true;
    }
    return availability.services[cta.serviceId]?.status !== "closed";
  });
  const heroAddon = (
    <div className="w-full px-0 pt-4 pb-0">
      <ServiceProofFilterBar copy={dictionary.serviceProof.filters} locale={locale} />
    </div>
  );
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.contractsFixes.title,
      href: `/${locale}/services`
    },
    {
      label: dictionary.serviceProof.title
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
      title={dictionary.serviceProof.title}
      subtitle={
        <>
          <span>{dictionary.serviceProof.subtitle}</span>
          <span className="mt-3 flex flex-wrap items-center gap-3 text-sm text-textMuted dark:text-dark-textMuted">
            <Link
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
              href={`/${locale}/services`}
            >
              {dictionary.serviceProof.backToServicesLabel}
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
              href={`/${locale}/services/terms`}
            >
              {dictionary.serviceProof.termsLinkLabel}
            </Link>
          </span>
        </>
      }
      subtitleClassName="max-w-5xl"
      breadcrumbs={breadcrumbs}
      sections={sections}
      heroAddon={heroAddon}
      className="pt-4 lg:pt-6"
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
