import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";

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

const ResponsiveAudioPlayer = dynamicImport(
  () => import("../../../src/components/AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

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
      title={dictionary.notes.index.title}
      subtitle={dictionary.notes.index.subtitle}
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
      shellCopy={dictionary.shell}
      footerContent={dictionary.home.footer}
      locale={locale}
    />
  );
}
