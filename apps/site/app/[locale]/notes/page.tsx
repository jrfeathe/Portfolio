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
  type ShellSection,
  type AnchorNavItem
} from "../../../src/components/Shell";
import { getNote, type Note } from "../../../src/lib/mdx";
import { PORTFOLIO_SITE_NAME } from "../../../src/lib/seo/jsonld";
import { resolveOpenGraphLocale } from "../../../src/lib/seo/opengraph-locale";

const ResponsiveAudioPlayer = dynamicImport(
  () => import("../../../src/components/AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

export const runtime = "nodejs";
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
  locale: Locale,
  note: Note | null
): ShellSection[] {
  const contentClassName =
    "mx-auto w-full max-w-[8.5in] space-y-6 text-base leading-relaxed text-text dark:text-dark-text";
  const englishOnlyNoticeByLocale: Partial<Record<Locale, string>> = {
    ja: "申し訳ありませんが、この文章は現在英語のみです。後日手作業でローカライズする予定です。",
    zh: "抱歉，这篇写作目前只有英文版本。我会在之后手动进行本地化。"
  };

  if (locale === "en" && note) {
    return [
      {
        id: "notes",
        title: "",
        description: null,
        content: (
        <article className={contentClassName} data-mdx-content="true">
          {note.content}
        </article>
        )
      }
    ];
  }

  const englishOnlyNotice =
    locale === "en"
      ? dictionary.notes.index.empty
      : englishOnlyNoticeByLocale[locale] ??
        "Sorry, this writeup is only available in English for now. I plan to localize it by hand later.";

  return [
    {
      id: "notes",
      title: "",
      description: null,
      content: (
        <div className={contentClassName} data-mdx-content="true">
          <p>{englishOnlyNotice}</p>
        </div>
      )
    }
  ];
}

function buildAnchorItems(locale: Locale, note: Note | null): AnchorNavItem[] {
  if (locale !== "en" || !note) {
    return [];
  }

  return [
    {
      label: "Preamble",
      href: "#preamble"
    },
    {
      label: "Building the site",
      href: "#building",
      children: [
        { label: "Epic 0", href: "#epic0" },
        { label: "Epic 1", href: "#epic1" },
        { label: "Epic 2", href: "#epic2" },
        { label: "Epic 3", href: "#epic3" },
        { label: "Epic 4", href: "#epic4" },
        { label: "Epic 5", href: "#epic5" },
        { label: "Epic 6", href: "#epic6" },
        { label: "Epic 7", href: "#epic7" },
        { label: "Epic 8", href: "#epic8" },
        { label: "Epic 9", href: "#epic9" },
        { label: "Epic 10a.0-3", href: "#epic10a_0-3" },
        { label: "Epic 10a.KING", href: "#epic10a_KING" }
      ]
    },
    {
      label: "Launch pivot",
      href: "#launch-pivot",
      children: [
        { label: "Epic F1", href: "#epicf1" },
        { label: "Epic F2", href: "#epicf2" },
        { label: "Task F3.4", href: "#taskf3_4" },
        { label: "Task F3.2", href: "#taskf3_2" },
        { label: "Epic F4", href: "#epicf4" },
        { label: "Epic F3", href: "#epicf3" }
      ]
    },
    {
      label: "Writeup",
      href: "#writeup"
    },
    {
      label: "Release 1.0.0 / 1.0.1",
      href: "#release_1-0-0_1-0-1"
    },
    {
      label: "Epilogue",
      href: "#epilogue"
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
    title: dictionary.notes.index.metadataTitle,
    description: dictionary.notes.index.subtitle,
    alternates: {
      canonical: `/${locale}/notes`
    },
    openGraph: {
      siteName: PORTFOLIO_SITE_NAME,
      title: dictionary.notes.index.metadataTitle,
      description: dictionary.notes.index.subtitle,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/notes/opengraph-image`]
    },
    robots: {
      index: false,
      follow: true
    }
  };
}

async function loadNoteOrNull(slug: string) {
  try {
    return await getNote(slug);
  } catch {
    return null;
  }
}

export default async function NotesIndexPage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const note = locale === "en" ? await loadNoteOrNull("portfolio-writeup") : null;
  const sections = buildSections(dictionary, locale, note);
  const anchorItems = buildAnchorItems(locale, note);
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
  const layoutClassName =
    "!max-w-[80.3rem] lg:!grid-cols-[200px_minmax(0,1fr)_220px] lg:!px-4";

  return (
    <ResponsiveShellLayout
      title={dictionary.notes.index.title}
      subtitle={dictionary.notes.index.subtitle}
      breadcrumbs={breadcrumbs}
      sections={sections}
      anchorItems={anchorItems}
      mobileNavMaxHeightClassName="max-h-[45vh]"
      mobileScrollContainer
      showSkimToggle={false}
      className={layoutClassName}
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
