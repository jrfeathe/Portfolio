import type { Metadata } from "next";
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
import {
  ResponsiveShellLayout,
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

function buildSections(
  dictionary: AppDictionary
): ShellSection[] {
  return [
    {
      id: "notes",
      title: dictionary.notes.index.title,
      description: dictionary.notes.index.subtitle,
      content: (
        <div className="space-y-6 text-base leading-relaxed text-text dark:text-dark-text">
          <p>{dictionary.notes.index.body}</p>
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

  return {
    title: dictionary.notes.index.title,
    description: dictionary.notes.index.subtitle,
    alternates: {
      canonical: `/${locale}/notes`
    },
    robots: {
      index: false,
      follow: true
    }
  };
}

export default async function NotesIndexPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary);
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
      <ResponsiveShellLayout
        title={dictionary.notes.index.title}
        subtitle={dictionary.notes.index.subtitle}
        breadcrumbs={breadcrumbs}
        sections={sections}
        shellCopy={dictionary.shell}
        footerContent={dictionary.home.footer}
        locale={locale}
      />
    </>
  );
}
