import type { AppDictionary } from "../../utils/dictionaries";
import type { Locale } from "../../utils/i18n";
import type { ResumeProfile } from "../resume/profile";

const SCHEMA_CONTEXT = "https://schema.org";
export const PORTFOLIO_BASE_URL = "https://jrfeathe.com";
const PERSON_ID = `${PORTFOLIO_BASE_URL}/#person`;
const WEBSITE_ID = `${PORTFOLIO_BASE_URL}/#website`;

type JsonLdNode = Record<string, unknown>;

export type JsonLdPayload = {
  "@context": typeof SCHEMA_CONTEXT;
  "@graph": JsonLdNode[];
};

type Breadcrumb = {
  name: string;
  path?: string;
};

function absoluteUrl(path: string) {
  return new URL(path, PORTFOLIO_BASE_URL).toString();
}

function localePath(locale: Locale, pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const suffix = normalizedPath === "/" ? "" : normalizedPath;
  return `/${locale}${suffix}`;
}

function canonicalUrl(locale: Locale, pathname = "/") {
  return absoluteUrl(localePath(locale, pathname));
}

function wrapGraph(nodes: JsonLdNode[]): JsonLdPayload {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": nodes
  };
}

function buildBreadcrumbNode(pageUrl: string, entries: Breadcrumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumbs`,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(entry.path
        ? {
            item: absoluteUrl(entry.path)
          }
        : {})
    }))
  };
}

function buildPersonNode(profile: ResumeProfile): JsonLdNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    jobTitle: profile.headline,
    url: PORTFOLIO_BASE_URL,
    sameAs: profile.sameAs,
    knowsLanguage: profile.languages,
    homeLocation: {
      "@type": "AdministrativeArea",
      name: profile.location.region,
      addressCountry: profile.location.countryCode
    },
    availableLocation: profile.location.availableLocations.map((entry) => ({
      "@type": "City",
      name: entry.name,
      description: entry.availability
    }))
  };
}

function buildWebsiteNode(locale: Locale, dictionary: AppDictionary): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: PORTFOLIO_BASE_URL,
    name: dictionary.metadata.title,
    description: dictionary.metadata.description,
    inLanguage: locale,
    publisher: {
      "@id": PERSON_ID
    }
  };
}

function buildWebPageNode(options: {
  url: string;
  locale: Locale;
  name: string;
  description: string;
  breadcrumbId: string;
  pageType?: string | string[];
}): JsonLdNode {
  const pageType = options.pageType ?? "WebPage";
  return {
    "@type": pageType,
    "@id": `${options.url}#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: options.locale,
    isPartOf: {
      "@id": WEBSITE_ID
    },
    about: {
      "@id": PERSON_ID
    },
    breadcrumb: {
      "@id": options.breadcrumbId
    }
  };
}

export function buildHomePageJsonLd(options: {
  locale: Locale;
  dictionary: AppDictionary;
  profile: ResumeProfile;
}): JsonLdPayload {
  const pageUrl = canonicalUrl(options.locale);
  const breadcrumbs = buildBreadcrumbNode(pageUrl, [
    { name: options.dictionary.home.breadcrumbs.home, path: localePath(options.locale) },
    { name: options.dictionary.home.breadcrumbs.workspace }
  ]);

  return wrapGraph([
    buildPersonNode(options.profile),
    buildWebsiteNode(options.locale, options.dictionary),
    breadcrumbs,
    buildWebPageNode({
      url: pageUrl,
      locale: options.locale,
      name: options.dictionary.metadata.title,
      description: options.dictionary.metadata.description,
      breadcrumbId: `${pageUrl}#breadcrumbs`
    })
  ]);
}
