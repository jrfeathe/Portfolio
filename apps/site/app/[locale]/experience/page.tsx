import type { Metadata } from "next";
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
import { resolveOpenGraphLocale } from "../../../src/lib/seo/opengraph-locale";
import {
  ResponsiveShellLayout,
  type ShellSection,
  type AnchorNavItem
} from "../../../src/components/Shell";

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

function buildSections(dictionary: AppDictionary): ShellSection[] {
  const sections: ShellSection[] = [
    {
      id: "projects",
      title: dictionary.experience.section1title,
      description: dictionary.experience.section1subtitle,
      content: (
        <div className="space-y-6">
          {dictionary.experience.entries.map((entry) => (
            <article
              key={`${entry.company}-${entry.role}`}
              id={entry.id}
              data-experience-card="project"
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-accent"
            >
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                  {entry.timeframe}
                </p>
                <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                  {entry.role}
                </h2>
                <p className="text-sm text-textMuted dark:text-dark-textMuted">
                  {entry.company}
                </p>
              </div>
              <p className="mt-4 text-sm text-text dark:text-dark-text">
                {entry.summary}
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )
    },
    {
      id: "tech-stack",
      title: dictionary.experience.section2title,
      description: dictionary.experience.section2subtitle,
      content: dictionary.experience.techStack.length ? (
        <div className="space-y-6">
          {dictionary.experience.techStack.map((tech) => (
            <article
              key={tech.id}
              id={tech.id}
              data-experience-card="tech"
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-accent"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-text dark:text-dark-text">
                  {tech.title}
                </h3>
                <p className="text-sm text-textMuted dark:text-dark-textMuted">
                  {tech.context}
                </p>
              </div>
              <p className="mt-4 text-sm text-text dark:text-dark-text">
                {tech.summary}
              </p>
              {tech.highlights.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text">
                  {tech.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-textMuted dark:text-dark-textMuted">
          {dictionary.experience.section2empty}
        </p>
      )
    }
  ];

  return sections;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const languages = Object.fromEntries(
    locales.map((entry) => [entry, `/${entry}/experience`])
  );

  return {
    title: dictionary.experience.metadataTitle,
    description: dictionary.experience.subtitle,
    alternates: {
      canonical: `/${locale}/experience`,
      languages
    },
    openGraph: {
      title: dictionary.experience.metadataTitle,
      description: dictionary.experience.subtitle,
      type: "website",
      locale: resolveOpenGraphLocale(locale),
      images: [`/${locale}/experience/opengraph-image`]
    }
  };
}

export default function ExperiencePage({ params }: PageParams) {
  const locale = ensureLocale(params.locale);
  const dictionary = getDictionary(locale);
  const sections = buildSections(dictionary);
  const projectAnchors: AnchorNavItem[] = dictionary.experience.entries.map((entry) => ({
    label: entry.company,
    href: `#${entry.id}`
  }));
  const techStackAnchors: AnchorNavItem[] = dictionary.experience.techStack.map((tech) => ({
    label: tech.title,
    href: `#${tech.id}`
  }));
  const anchorItems: AnchorNavItem[] = [
    {
      label: dictionary.experience.section1title,
      href: "#projects",
      children: projectAnchors
    },
    {
      label: dictionary.experience.section2title,
      href: "#tech-stack",
      children: techStackAnchors
    }
  ];
  const breadcrumbs = [
    {
      label: dictionary.home.breadcrumbs.home,
      href: `/${locale}`
    },
    {
      label: dictionary.experience.title
    }
  ];

  return (
    <ResponsiveShellLayout
      title={dictionary.experience.title}
      subtitle={dictionary.experience.subtitle}
      breadcrumbs={breadcrumbs}
      sections={sections}
      anchorItems={anchorItems}
      showSkimToggle={false}
      shellCopy={dictionary.shell}
      footerContent={dictionary.home.footer}
      locale={locale}
    />
  );
}
