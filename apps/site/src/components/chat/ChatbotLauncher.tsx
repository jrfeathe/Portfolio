"use client";

import dynamic from "next/dynamic";

import type { ChatbotCopy } from "./ChatbotProvider";
import type { Locale } from "../../utils/i18n";

const LazyChatbotProvider = dynamic(
  () => import("./ChatbotProvider").then((mod) => mod.ChatbotProvider),
  {
    ssr: false,
    loading: ({ locale, copy }: { locale?: Locale; copy?: ChatbotCopy }) => (
      <button
        type="button"
        aria-label={copy?.launcherLabel ?? "Open chat"}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accentOn shadow-lg transition hover:bg-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover"
      >
        <span aria-hidden>💬</span>
        <span className="hidden sm:inline">{copy?.launcherLabel ?? "Chat"}</span>
      </button>
    )
  }
);

type ChatbotLauncherProps = {
  locale: Locale;
  copy: ChatbotCopy;
};

export function ChatbotLauncher({ locale, copy }: ChatbotLauncherProps) {
  return <LazyChatbotProvider locale={locale} copy={copy} />;
}
