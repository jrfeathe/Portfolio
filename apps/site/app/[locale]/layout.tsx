import type { ReactNode } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import type { AppDictionary } from "../../src/utils/dictionaries";
import { getDictionary } from "../../src/utils/dictionaries";
import { isLocale } from "../../src/utils/i18n";
import type { ChatbotProviderProps } from "../../src/components/chat/ChatbotProvider";

const chatbotLoadingFallback = (copy: AppDictionary["chatbot"]) => {
  const label = copy.launcherLabel || copy.panelTitle;
  return (
    <button
      type="button"
      aria-label={label}
      className="chatbot-placeholder fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accentOn shadow-lg transition hover:bg-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover"
    >
      <span aria-hidden>💬</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const ChatbotProvider = dynamic<ChatbotProviderProps>(
  () =>
    import("../../src/components/chat/ChatbotProvider").then(
      (mod) => mod.ChatbotProvider
    ),
  { ssr: false, suspense: true }
);

type LocaleLayoutProps = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale;
  const dictionary = getDictionary(locale);
  const chatbotCopy = dictionary.chatbot;
  const chatbotEnabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT !== "0";

  return (
    <>
      {chatbotEnabled ? chatbotLoadingFallback(chatbotCopy) : null}
      {chatbotEnabled ? (
        <Suspense fallback={null}>
          <ChatbotProvider locale={locale} copy={chatbotCopy} />
        </Suspense>
      ) : null}
      {children}
    </>
  );
}
