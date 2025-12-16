"use client";

import { Button } from "@portfolio/ui";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { ResponsiveShellLayout, StickyCTA } from "../Shell";
import { TechStackCarousel } from "../TechStackCarousel";
import type { AppDictionary } from "../../utils/dictionaries";
import type { Locale } from "../../utils/i18n";

const ResponsiveAudioPlayer = dynamic(
  () => import("../AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

import { ChatbotLauncher } from "../chat/ChatbotLauncher";

type HomeClientProps = {
  dictionary: AppDictionary;
  locale: Locale;
  skimModeEnabled: boolean;
  resumeDownloadFilename: string;
};

export function HomeClient({
  dictionary,
  locale,
  skimModeEnabled,
  resumeDownloadFilename
}: HomeClientProps) {
  const [audioReady, setAudioReady] = useState(false);
  const chatbotEnabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT !== "0";

  const sections = useMemo(() => {
    const {
      home: { sections }
    } = dictionary;
    const techDetailMap = new Map(
      dictionary.experience.techStack.map((entry) => [entry.title.toLowerCase(), entry.id])
    );
    const techStackItems = sections.techStack.items.map((item) => ({
      ...item,
      href: `/${locale}/experience#${techDetailMap.get(item.name.toLowerCase()) ?? item.assetId}`
    }));

    return [
      {
        id: "tech-stack",
        eyebrow: sections.techStack.eyebrow,
        title: sections.techStack.title,
        description: sections.techStack.description,
        content: (
          <>
            <p>{sections.techStack.overview}</p>
            <TechStackCarousel items={techStackItems} iconsReady />
          </>
        )
      },
      {
        id: "past-achievements",
        eyebrow: sections.proof.eyebrow,
        title: sections.proof.title,
        description: sections.proof.description,
        content: (
          <>
            <p>{sections.proof.overview}</p>
            <ul className="grid list-none gap-4 sm:grid-cols-2">
              {sections.proof.proofChips.map((chip) => (
                <li key={chip.title}>
                  <Link
                    href={chip.href}
                    className="block rounded-xl border border-border bg-surface px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-dark-border dark:bg-dark-surface dark:focus-visible:ring-dark-accent"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                      {chip.title}
                    </span>
                    <p className="mt-2 text-sm">{chip.details}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )
      },
      {
        id: "current-projects",
        eyebrow: sections.roadmap.eyebrow,
        title: sections.roadmap.title,
        description: sections.roadmap.description,
        content: (
          <>
            <p>{sections.roadmap.overview}</p>
            <ol className="list-decimal space-y-2 pl-5">
              {sections.roadmap.nextSteps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </>
        )
      }
    ];
  }, [dictionary, locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAudioReady(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const {
    home: {
      hero: { title, subtitle, cta, media },
      footer,
      breadcrumbs
    }
  } = dictionary;

  return (
    <div data-skim-mode={skimModeEnabled ? "true" : "false"}>
      <ResponsiveShellLayout
        title={title}
        subtitle={subtitle}
        heroMedia={media}
        breadcrumbs={[{ label: breadcrumbs.home, href: `/${locale}` }]}
        sections={sections}
        skimModeEnabled={skimModeEnabled}
        locale={locale}
        footerContent={footer}
        cta={
          <div className="space-y-4">
            <StickyCTA title={cta.title} description={cta.description}>
              {cta.actions.map((action, index) =>
                action.href ? (
                  <Button
                    key={`${action.label}-${action.variant}`}
                    variant={action.variant}
                    href={action.href}
                    className="w-full"
                    data-variant={action.variant}
                    tabIndex={index === 0 ? 1 : undefined}
                    download={action.download ? resumeDownloadFilename : undefined}
                    rel={action.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  >
                    {action.label}
                  </Button>
                ) : (
                  <Button
                    key={`${action.label}-${action.variant}`}
                    variant={action.variant}
                    className="w-full"
                    data-variant={action.variant}
                    tabIndex={index === 0 ? 1 : undefined}
                  >
                    {action.label}
                  </Button>
                )
              )}
            </StickyCTA>
          </div>
        }
      />
      {audioReady ? (
        <ResponsiveAudioPlayer
          src={dictionary.home.audioPlayer.src}
          title={dictionary.home.audioPlayer.title}
          description={dictionary.home.audioPlayer.description}
          playLabel={dictionary.home.audioPlayer.playLabel}
          pauseLabel={dictionary.home.audioPlayer.pauseLabel}
          downloadLabel={dictionary.home.audioPlayer.downloadLabel}
          closeLabel={dictionary.home.audioPlayer.closeLabel}
          reopenLabel={dictionary.home.audioPlayer.reopenLabel}
          locale={locale}
          trackId={dictionary.home.audioPlayer.trackId}
        />
      ) : null}
      {chatbotEnabled ? (
        <ChatbotLauncher locale={locale} copy={dictionary.chatbot} />
      ) : null}
    </div>
  );
}
