import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { getDictionary } from "../../../../src/utils/dictionaries";
import {
  locales,
  parseLocale,
  type Locale
} from "../../../../src/utils/i18n";
import {
  getNote,
  getNoteSummaries
} from "../../../../src/lib/mdx";
import { NoteHeader, TableOfContents } from "../../../../src/components/mdx";
import { StructuredData } from "../../../../src/components/seo/StructuredData";
import { getResumeProfile } from "../../../../src/lib/resume/profile";
import { buildNoteDetailJsonLd } from "../../../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../../../src/lib/seo/opengraph-locale";
import { extractNonceFromHeaders } from "../../../../src/utils/csp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageParams = {
  params: {
    locale: string;
    slug: string;
  };
};

function ensureLocale(value: string): Locale {
  const locale = parseLocale(value);
  if (!locale) {
    notFound();
  }
  return locale;
}

async function loadNoteOrNull(slug: string) {
  try {
    return await getNote(slug);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const summaries = await getNoteSummaries();

  return locales.flatMap((locale) =>
    summaries.map((note) => ({
      locale,
      slug: note.slug
    }))
  );
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = ensureLocale(params.locale);
  const note = await loadNoteOrNull(params.slug);

  if (!note) {
    notFound();
  }

  return {
    title: note.frontmatter.title,
    description: note.frontmatter.summary,
    alternates: {
      canonical: `/${locale}/notes/${note.slug}`
    },
    robots: {
      index: false,
      follow: true
    },
    openGraph: {
      title: note.frontmatter.title,
      description: note.frontmatter.summary,
      locale: resolveOpenGraphLocale(locale)
    }
  };
}

export default async function NoteDetailPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const note = await loadNoteOrNull(params.slug);

  if (!note || note.frontmatter.draft) {
    notFound();
  }

  const notesIndexHref = `/${locale}/notes` as Route;
  const resumeProfile = getResumeProfile();
  const structuredData = buildNoteDetailJsonLd({
    locale,
    dictionary,
    profile: resumeProfile,
    note
  });
  const nonce = extractNonceFromHeaders(headers());

  return (
    <>
      <StructuredData data={structuredData} nonce={nonce} />
      <div className="bg-background text-text dark:bg-dark-background dark:text-dark-text">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 lg:flex-row">
          <div className="flex-1 space-y-10">
            <div>
              <Link
                href={notesIndexHref}
                className="text-sm font-medium text-primary transition hover:underline dark:text-dark-primary"
              >
                ← {dictionary.notes.detail.backLabel}
              </Link>
            </div>
            <NoteHeader frontmatter={note.frontmatter} locale={locale} />
            <article className="space-y-6 text-base leading-relaxed text-text dark:text-dark-text">
              {note.content}
            </article>
          </div>
          <aside className="lg:w-64 lg:flex-none lg:sticky lg:top-24 lg:h-fit">
            <TableOfContents
              items={note.toc}
              title={dictionary.notes.detail.tocLabel}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
