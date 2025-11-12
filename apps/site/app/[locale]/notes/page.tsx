import Link from "next/link";
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import {
  getDictionary,
  type AppDictionary
} from "../../../src/utils/dictionaries";
import {
  locales,
  parseLocale,
  type Locale
} from "../../../src/utils/i18n";
import { getNoteSummaries } from "../../../src/lib/mdx";
import {
  ShellLayout,
  type ShellSection
} from "../../../src/components/Shell";
import { StructuredData } from "../../../src/components/seo/StructuredData";
import { buildNotesIndexJsonLd } from "../../../src/lib/seo/jsonld";
import { extractNonceFromHeaders } from "../../../src/utils/csp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function formatDate(input: string, locale: Locale) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}

function buildSections(
  dictionary: AppDictionary,
  locale: Locale,
  notes: Awaited<ReturnType<typeof getNoteSummaries>>
): ShellSection[] {
  return [
    {
      id: "notes",
      title: dictionary.notes.index.title,
      description: dictionary.notes.index.subtitle,
      content: notes.length ? (
        <ul className="space-y-6">
          {notes.map((note) => {
            const noteHref = (`/${locale}/notes/${note.slug}`) as Route;

            return (
              <li
                key={note.slug}
                className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-primary"
              >
                <Link
                  href={noteHref}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                    <time dateTime={note.frontmatter.publishedAt}>
                      {formatDate(note.frontmatter.publishedAt, locale)}
                    </time>
                    {note.frontmatter.tags?.length ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>
                          {note.frontmatter.tags.join(" · ")}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-text dark:text-dark-text">
                    {note.frontmatter.title}
                  </h2>
                  <p className="text-sm text-textMuted dark:text-dark-textMuted">
                    {note.frontmatter.summary}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-textMuted dark:text-dark-textMuted">
          {dictionary.notes.index.empty}
        </p>
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

  return {
    title: dictionary.notes.index.title,
    description: dictionary.notes.index.subtitle
  };
}

export default async function NotesIndexPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const notes = await getNoteSummaries();

  const sections = buildSections(dictionary, locale, notes);
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.notes.index.title
    }
  ];
  const structuredData = buildNotesIndexJsonLd({
    locale,
    dictionary
  });
  const nonce = extractNonceFromHeaders(headers());

  return (
    <>
      <StructuredData data={structuredData} nonce={nonce} />
      <ShellLayout
        title={dictionary.notes.index.title}
        subtitle={dictionary.notes.index.subtitle}
        breadcrumbs={breadcrumbs}
        sections={sections}
        locale={locale}
      />
    </>
  );
}
