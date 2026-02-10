import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getDictionary } from "../../src/utils/dictionaries";
import { isLocale } from "../../src/utils/i18n";
import { ChatbotPortalMount } from "../../src/components/chat/ChatbotPortalMount";
import { SkimModeRouteGuard } from "../../src/components/SkimModeRouteGuard";

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
      <ChatbotPortalMount
        enabled={chatbotEnabled}
        copy={chatbotCopy}
        locale={locale}
      />
      <SkimModeRouteGuard locale={locale} />
      {children}
    </>
  );
}
