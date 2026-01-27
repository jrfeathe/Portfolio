"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

import type { ChatbotCopy, ChatbotProviderProps } from "./ChatbotProvider";
import type { Locale } from "../../utils/i18n";
import { HUD_LAYER_ID } from "../Shell/ViewportHUDLayer";

const ChatbotProvider = dynamic<ChatbotProviderProps>(
  () => import("./ChatbotProvider").then((mod) => mod.ChatbotProvider),
  { ssr: false, loading: () => null }
);

type ChatbotPortalMountProps = {
  enabled: boolean;
  copy: ChatbotCopy;
  locale: Locale;
};

const CHATBOT_SLOT_ID = "chatbot-slot";

export function ChatbotPortalMount({ enabled, copy, locale }: ChatbotPortalMountProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    const updateTarget = () => {
      const nextTarget =
        document.getElementById(HUD_LAYER_ID) ??
        document.getElementById(CHATBOT_SLOT_ID) ??
        document.body;
      setTarget((current) => (current === nextTarget ? current : nextTarget));
    };

    updateTarget();

    const observer = new MutationObserver(updateTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled || !target) {
    return null;
  }

  const label = copy.launcherLabel || copy.panelTitle;

  return createPortal(
    <>
      <button
        type="button"
        aria-label={label}
        className="chatbot-placeholder pointer-events-auto absolute bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accentOn shadow-lg transition hover:bg-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent dark:bg-dark-accent dark:text-dark-accentOn dark:hover:bg-dark-accentHover"
      >
        <span aria-hidden>&#128172;</span>
        <span className="hidden sm:inline">{label}</span>
      </button>
      <ChatbotProvider locale={locale} copy={copy} />
    </>,
    target
  );
}
