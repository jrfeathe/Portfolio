"use client";

import { Button } from "@portfolio/ui";
import clsx from "clsx";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "../../utils/i18n";

type HCaptchaGlobal = {
  render: (
    container: HTMLElement,
    config: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark";
      size?: "normal" | "compact";
    }
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    hcaptcha?: HCaptchaGlobal;
  }
}

const HCAPTCHA_SCRIPT_SRC = "https://js.hcaptcha.com/1/api.js?render=explicit";

export type ChatbotCopy = {
  launcherLabel: string;
  panelTitle: string;
  panelSubtitle: string;
  inputPlaceholder: string;
  exampleQuestions: string[];
  inlineTitle: string;
  inlineBody: string;
  inlineCta: string;
  emptyState: string;
  loggingNotice: string;
  errorMessage: string;
  fallbackCtaLabel: string;
  captchaTitle: string;
  captchaPrompt: string;
  sendLabel: string;
};

type Reference = { title: string; href: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  references?: Reference[];
};

type ChatState = {
  isOpen: boolean;
  messages: ChatMessage[];
  pending: boolean;
  error?: string;
  notice?: string;
  usedFallback?: boolean;
  promptCount: number;
  rateLimitRemaining?: number;
  captchaSiteKey?: string;
  pendingMessage?: { id: string; text: string };
};

type ChatContextValue = {
  state: ChatState;
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (content: string, options?: { captchaToken?: string; reuseLast?: boolean }) => Promise<void>;
  solveCaptcha: (token: string) => Promise<void>;
  copy: ChatbotCopy;
  locale: Locale;
};

const STORAGE_KEY = "chatbot-session-v1";

const ChatbotContext = createContext<ChatContextValue | null>(null);

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function loadStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ChatState> & { sessionId?: string }) : null;
  } catch {
    return null;
  }
}

function persistSession(state: ChatState, sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload = {
      isOpen: state.isOpen,
      messages: state.messages,
      sessionId
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore persistence failures
  }
}

function buildHistory(messages: ChatMessage[]) {
  const trimmed = messages.slice(-6).filter((msg) => msg.role === "user" || msg.role === "assistant");
  return trimmed.map((msg) => ({ role: msg.role, content: msg.content }));
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return ctx;
}

export function ChatbotProvider({
  children,
  locale,
  copy
}: {
  children: React.ReactNode;
  locale: Locale;
  copy: ChatbotCopy;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [sessionId, setSessionId] = useState<string>(randomId);
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    pending: false,
    promptCount: 0
  });

  useEffect(() => {
    if (hydrated) {
      return;
    }
    const stored = loadStoredSession();
    setHydrated(true);
    setSessionId(stored?.sessionId ?? randomId());
    setState((prev) => ({
      ...prev,
      isOpen: stored?.isOpen ?? false,
      messages: stored?.messages ?? []
    }));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    persistSession(state, sessionId);
  }, [state, sessionId, hydrated]);

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const sendMessage = useCallback(
    async (content: string, options?: { captchaToken?: string; reuseLast?: boolean }) => {
      const text = content.trim();
      if (!text || state.pending || !hydrated) {
        return;
      }

      const messageId = options?.reuseLast
        ? state.pendingMessage?.id ?? randomId()
        : randomId();

      if (!options?.reuseLast) {
        const userMessage: ChatMessage = {
          id: messageId,
          role: "user",
          content: text,
          createdAt: Date.now()
        };
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
          error: undefined
        }));
      }

      setState((prev) => ({
        ...prev,
        pending: true,
        error: undefined,
        pendingMessage: { id: messageId, text }
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            locale,
            sessionId,
            history: buildHistory(state.messages),
            captchaToken: options?.captchaToken
          })
        });

        const payload = await response.json().catch(() => ({}));

        if (response.status === 403 && payload?.captchaRequired) {
          setState((prev) => ({
            ...prev,
            pending: false,
            captchaSiteKey: typeof payload?.captchaSiteKey === "string" ? payload.captchaSiteKey : undefined,
            error: payload?.message ?? copy.captchaPrompt
          }));
          return;
        }

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            pending: false,
            error: payload?.message ?? copy.errorMessage,
            pendingMessage: undefined
          }));
          return;
        }

        const assistantMessage: ChatMessage = {
          id: randomId(),
          role: "assistant",
          content: payload.reply ?? "",
          references: payload.references ?? [],
          createdAt: Date.now()
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          pending: false,
          error: undefined,
          notice: payload.notice ?? prev.notice,
          usedFallback: payload.usedFallback ?? prev.usedFallback,
          rateLimitRemaining: payload.rateLimitRemaining ?? prev.rateLimitRemaining,
          promptCount: payload.promptCount ?? prev.promptCount,
          captchaSiteKey: undefined,
          pendingMessage: undefined
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          pending: false,
          error: copy.errorMessage,
          pendingMessage: undefined
        }));
      }
    },
    [
      copy.errorMessage,
      copy.captchaPrompt,
      hydrated,
      locale,
      sessionId,
      state.messages,
      state.pending,
      state.pendingMessage
    ]
  );

  const solveCaptcha = useCallback(
    async (token: string) => {
      if (!token.trim() || !state.pendingMessage) {
        return;
      }
      await sendMessage(state.pendingMessage.text, { captchaToken: token.trim(), reuseLast: true });
    },
    [sendMessage, state.pendingMessage]
  );

  const value = useMemo(
    () => ({
      state,
      open,
      close,
      toggle,
      sendMessage,
      solveCaptcha,
      copy,
      locale
    }),
    [close, copy, locale, open, sendMessage, solveCaptcha, state, toggle]
  );

  return (
    <ChatbotContext.Provider value={value}>
      {children}
      <ChatFloatingWidget />
    </ChatbotContext.Provider>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={clsx(
        "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm shadow-sm",
        isUser
          ? "self-end bg-accent text-accentOn"
          : "self-start bg-surface text-text dark:bg-dark-surface dark:text-dark-text"
      )}
    >
      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      {message.references?.length ? (
        <div className="mt-1 space-y-1 text-xs text-textMuted dark:text-dark-textMuted">
          {message.references.map((ref) => (
            <a
              key={`${message.id}-${ref.href}`}
              href={ref.href}
              className="underline-offset-2 hover:underline"
            >
              {ref.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function loadHCaptchaScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.hcaptcha) {
    return Promise.resolve();
  }

  let script = document.querySelector<HTMLScriptElement>('script[data-hcaptcha-script="true"]');
  if (!script) {
    script = document.createElement("script");
    script.src = HCAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.hcaptchaScript = "true";
    document.body.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Failed to load hCaptcha script"));
    };
    const cleanup = () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (window.hcaptcha) {
      cleanup();
      resolve();
    }
  });
}

function HCaptchaWidget({
  siteKey,
  onVerify,
  disabled
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      if (!siteKey || typeof window === "undefined") {
        return;
      }

      try {
        await loadHCaptchaScript();
      } catch (error) {
        console.error("[chatbot] Failed to load hCaptcha script:", error);
        return;
      }

      if (!mounted || !containerRef.current) {
        return;
      }

      const hcaptcha = window.hcaptcha;
      if (!hcaptcha) {
        return;
      }

      if (widgetIdRef.current !== null) {
        hcaptcha.reset(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      widgetIdRef.current = hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
          if (window.hcaptcha && widgetIdRef.current !== null) {
            window.hcaptcha.reset(widgetIdRef.current);
          }
        },
        "expired-callback": () => {
          if (widgetIdRef.current !== null) {
            hcaptcha.reset(widgetIdRef.current);
          }
        },
        "error-callback": () => {
          if (widgetIdRef.current !== null) {
            hcaptcha.reset(widgetIdRef.current);
          }
        }
      });
    }

    setup();

    return () => {
      mounted = false;
      if (window.hcaptcha && widgetIdRef.current !== null) {
        window.hcaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onVerify]);

  return (
    <div className="mt-2">
      <div
        ref={containerRef}
        className={clsx(disabled && "pointer-events-none opacity-60")}
      />
    </div>
  );
}

function ChatFloatingWidget() {
  const { state, toggle, sendMessage, copy, solveCaptcha } = useChatbot();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state.isOpen]);

  const handleSend = useCallback(
    async (value?: string) => {
      const text = (value ?? input).trim();
      if (!text) {
        return;
      }
      await sendMessage(text);
      setInput("");
    },
    [input, sendMessage]
  );

  const handleCaptchaVerify = useCallback(
    async (token: string) => {
      await solveCaptcha(token);
    },
    [solveCaptcha]
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {state.isOpen ? (
        <div className="w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border/50 dark:border-dark-border dark:bg-dark-background dark:ring-dark-border/50">
          <div className="flex items-start gap-3 border-b border-border bg-surface px-4 py-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surfaceMuted dark:bg-dark-surfaceMuted">
              <Image
                src="/ai_bubble_icon.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8"
                priority={false}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{copy.panelTitle}</p>
              <p className="text-xs text-textMuted dark:text-dark-textMuted">
                {copy.panelSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="rounded-full p-2 text-textMuted transition hover:bg-surfaceMuted hover:text-text dark:hover:bg-dark-surfaceMuted"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-4 py-3">
            {state.messages.length === 0 ? (
              <div className="space-y-3 rounded-xl border border-border bg-surfaceMuted/50 p-4 text-sm text-textMuted dark:border-dark-border dark:bg-dark-surfaceMuted/50 dark:text-dark-textMuted">
                <p>{copy.emptyState}</p>
                <div className="flex flex-wrap gap-2">
                  {copy.exampleQuestions.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleSend(example)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {state.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
            {state.notice ? (
              <p className="text-xs text-textMuted dark:text-dark-textMuted">
                {state.notice}
              </p>
            ) : null}
            {state.error ? (
              <div className="rounded-lg border border-danger/70 bg-danger/10 px-3 py-2 text-xs text-danger">
                <p>{state.error}</p>
                <a
                  href="/resume.pdf"
                  className="mt-1 inline-block font-semibold underline underline-offset-4"
                >
                  {copy.fallbackCtaLabel}
                </a>
              </div>
            ) : null}
            {state.captchaSiteKey ? (
              <div className="rounded-lg border border-border bg-surface px-3 py-3 text-sm dark:border-dark-border dark:bg-dark-surface">
                <p className="text-sm font-semibold">{copy.captchaTitle}</p>
                <p className="mt-1 text-xs text-textMuted dark:text-dark-textMuted">
                  {copy.captchaPrompt}
                </p>
                <HCaptchaWidget
                  siteKey={state.captchaSiteKey}
                  onVerify={handleCaptchaVerify}
                  disabled={state.pending}
                />
              </div>
            ) : null}
          </div>
          <div className="border-t border-border bg-surface px-4 py-3 dark:border-dark-border dark:bg-dark-surface">
            <label className="sr-only" htmlFor="chatbot-input">
              {copy.sendLabel}
            </label>
            <textarea
              id="chatbot-input"
              ref={inputRef}
              rows={state.isOpen ? 2 : 1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.inputPlaceholder}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-dark-border dark:bg-dark-background"
              disabled={state.pending || Boolean(state.captchaSiteKey)}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-textMuted dark:text-dark-textMuted">
                {copy.loggingNotice}
              </p>
              <Button
                variant="primary"
                onClick={() => handleSend()}
                disabled={state.pending || Boolean(state.captchaSiteKey) || !input.trim()}
              >
                {state.pending ? "Sending…" : copy.sendLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accentOn shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label={copy.launcherLabel}
      >
        <Image
          src="/ai_bubble_icon.svg"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8"
          priority={false}
        />
      </button>
    </div>
  );
}

export function ChatInlineCard() {
  const { copy, state, open, sendMessage } = useChatbot();
  const [preset, setPreset] = useState(copy.exampleQuestions[0] ?? "");
  const statusLabel = state.promptCount >= 2 ? copy.captchaTitle : copy.inlineCta;

  const handleAsk = useCallback(async () => {
    if (preset) {
      await sendMessage(preset);
    }
    open();
  }, [open, preset, sendMessage]);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text dark:text-dark-text">
            {copy.inlineTitle}
          </p>
          <p className="mt-1 text-xs text-textMuted dark:text-dark-textMuted">
            {copy.inlineBody}
          </p>
        </div>
        <span className="rounded-full bg-surfaceMuted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textMuted dark:bg-dark-surfaceMuted dark:text-dark-textMuted">
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-background"
          value={preset}
          onChange={(event) => setPreset(event.target.value)}
        >
          {copy.exampleQuestions.map((question) => (
            <option key={question} value={question}>
              {question}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={handleAsk} className="whitespace-nowrap">
          {copy.inlineCta}
        </Button>
      </div>
    </div>
  );
}
