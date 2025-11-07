import type { AppDictionary } from "../../utils/dictionaries";
import type { Locale } from "../../utils/i18n";
import type { Note } from "../mdx";
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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

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
  const primaryRole = profile.roles[0];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.description,
    url: PORTFOLIO_BASE_URL,
    identifier: profile.resumeVersion,
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
    })),
    ...(primaryRole
      ? {
          hasOccupation: {
            "@type": "Occupation",
            name: primaryRole.role,
            occupationLocation: {
              "@type": "AdministrativeArea",
              name: primaryRole.location ?? profile.location.region
            }
          },
          worksFor: {
            "@type": "Organization",
            name: primaryRole.company
          }
        }
      : {})
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

function buildAuthorEntries(
  authors: string[] | undefined,
  primaryName: string
) {
  const resolvedAuthors = authors?.length ? authors : [primaryName];

  return resolvedAuthors.map((name) =>
    name === primaryName
      ? {
          "@type": "Person",
          "@id": PERSON_ID,
          name
        }
      : {
          "@type": "Person",
          "@id": `${PERSON_ID}#${slugify(name)}`,
          name
        }
  );
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

export function buildNotesIndexJsonLd(options: {
  locale: Locale;
  dictionary: AppDictionary;
}): JsonLdPayload {
  const pageUrl = canonicalUrl(options.locale, "/notes");
  const breadcrumbs = buildBreadcrumbNode(pageUrl, [
    { name: options.dictionary.home.breadcrumbs.home, path: localePath(options.locale) },
    { name: options.dictionary.notes.index.title, path: localePath(options.locale, "/notes") }
  ]);

  return wrapGraph([
    { "@type": "Person", "@id": PERSON_ID },
    { "@type": "WebSite", "@id": WEBSITE_ID },
    breadcrumbs,
    buildWebPageNode({
      url: pageUrl,
      locale: options.locale,
      name: options.dictionary.notes.index.title,
      description: options.dictionary.notes.index.subtitle,
      breadcrumbId: `${pageUrl}#breadcrumbs`,
      pageType: ["CollectionPage", "WebPage"]
    })
  ]);
}

export function buildNoteDetailJsonLd(options: {
  locale: Locale;
  dictionary: AppDictionary;
  profile: ResumeProfile;
  note: Pick<Note, "slug" | "frontmatter">;
}): JsonLdPayload {
  const pagePath = `/notes/${options.note.slug}`;
  const pageUrl = canonicalUrl(options.locale, pagePath);
  const breadcrumbs = buildBreadcrumbNode(pageUrl, [
    { name: options.dictionary.home.breadcrumbs.home, path: localePath(options.locale) },
    { name: options.dictionary.notes.index.title, path: localePath(options.locale, "/notes") },
    { name: options.note.frontmatter.title, path: localePath(options.locale, pagePath) }
  ]);

  const authors = buildAuthorEntries(options.note.frontmatter.authors, options.profile.name);
  const keywords = options.note.frontmatter.tags ?? [];

  const articleNode: JsonLdNode = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: options.note.frontmatter.title,
    description: options.note.frontmatter.summary,
    datePublished: options.note.frontmatter.publishedAt,
    dateModified: options.note.frontmatter.publishedAt,
    inLanguage: options.locale,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`
    },
    isPartOf: {
      "@id": WEBSITE_ID
    },
    about: {
      "@id": PERSON_ID
    },
    author: authors,
    publisher: {
      "@id": PERSON_ID
    },
    keywords: keywords.length ? keywords : undefined,
    articleSection: options.dictionary.notes.index.title
  };

  return wrapGraph([
    { "@type": "Person", "@id": PERSON_ID },
    { "@type": "WebSite", "@id": WEBSITE_ID },
    breadcrumbs,
    buildWebPageNode({
      url: pageUrl,
      locale: options.locale,
      name: options.note.frontmatter.title,
      description: options.note.frontmatter.summary,
      breadcrumbId: `${pageUrl}#breadcrumbs`
    }),
    articleNode
  ]);
}
