import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary, type AppDictionary } from "../../src/utils/dictionaries";
import { isLocale, locales, type Locale } from "../../src/utils/i18n";
import { headers } from "next/headers";
import { StructuredData } from "../../src/components/seo/StructuredData";
import { getResumeProfile } from "../../src/lib/resume/profile";
import { buildHomePageJsonLd } from "../../src/lib/seo/jsonld";
import { extractNonceFromHeaders } from "../../src/utils/csp";
import { HomeClient } from "../../src/components/home/HomeClient";

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
  const breadcrumbs = resolveBreadcrumbs(dictionary, locale);
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
      <HomeClient
        dictionary={dictionary}
        locale={locale}
        skimModeEnabled={skimModeEnabled}
        resumeDownloadFilename={resumeDownloadFilename}
      />
    </>
  );
}
