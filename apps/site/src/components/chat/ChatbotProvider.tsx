"use client";

import { Button, colors as designColors } from "@portfolio/ui";
import clsx from "clsx";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

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
const CONTRAST_PRIMARY = designColors["light-hc"]?.accent;
const CONTRAST_PRIMARY_DARK = designColors["dark-hc"]?.accent;
const CONTRAST_ON_PRIMARY = designColors["light-hc"]?.accentOn;
const CONTRAST_ON_PRIMARY_DARK = designColors["dark-hc"]?.accentOn;
const CONTRAST_ON_PRIMARY_STRONG = designColors["dark-hc"]?.accentOn ?? CONTRAST_ON_PRIMARY_DARK;
const ATTENTION_SURFACE = designColors.light.attention;

export type ChatbotCopy = {
  launcherLabel: string;
  panelTitle: string;
  panelSubtitle: string;
  inputPlaceholder: string;
  exampleQuestions: string[];
  emptyState: string;
  loggingNotice: string;
  errorMessage: string;
  fallbackCtaLabel: string;
  captchaTitle: string;
  captchaPrompt: string;
  rateLimitTitle: string;
  rateLimitMessage: string;
  rateLimitTryAfter: string;
  thinkingLabel: string;
  moderationTitle: string;
  moderationBody: string;
  sendLabel: string;
};

type Reference = { title: string; href: string };
type ContextFact = { title: string; detail: string; href: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  references?: Reference[];
  contextFacts?: ContextFact[];
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
  rateLimit?: { message?: string; retryAfterMs?: number; retryAt?: number; remaining?: number };
  captchaSiteKey?: string;
  pendingMessage?: { id: string; text: string };
  moderation?: "unprofessional";
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

function isRateLimitActive(rateLimit?: { retryAt?: number }) {
  if (!rateLimit) {
    return false;
  }
  if (typeof rateLimit.retryAt !== "number") {
    return true;
  }
  return rateLimit.retryAt > Date.now();
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
    promptCount: 0,
    moderation: undefined
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

  useEffect(() => {
    const retryAt = state.rateLimit?.retryAt;
    if (!retryAt) {
      return;
    }
    const now = Date.now();
    if (retryAt <= now) {
      setState((prev) => ({ ...prev, rateLimit: undefined }));
      return;
    }
    const timeout = setTimeout(() => {
      setState((prev) => ({ ...prev, rateLimit: undefined }));
    }, retryAt - now);
    return () => clearTimeout(timeout);
  }, [state.rateLimit?.retryAt]);

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
      const rateLimited = isRateLimitActive(state.rateLimit);
      if (!text || state.pending || !hydrated || rateLimited) {
        if (rateLimited) {
          setState((prev) => ({
            ...prev,
            error: prev.rateLimit?.message ?? copy.rateLimitMessage
          }));
        }
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
          error: undefined,
          moderation: undefined
        }));
      }

      setState((prev) => ({
        ...prev,
        pending: true,
        error: undefined,
        moderation: undefined,
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

        if (response.status === 429) {
          const retryAfterSeconds = Number(response.headers.get("Retry-After"));
          const retryAfterMs =
            typeof payload?.retryAfterMs === "number"
              ? payload.retryAfterMs
              : Number.isFinite(retryAfterSeconds)
                ? retryAfterSeconds * 1000
                : undefined;

          setState((prev) => ({
            ...prev,
            pending: false,
            rateLimit: {
              message: payload?.message ?? copy.rateLimitMessage,
              retryAfterMs,
              retryAt: retryAfterMs ? Date.now() + retryAfterMs : undefined,
              remaining:
                typeof payload?.rateLimitRemaining === "number" ? payload.rateLimitRemaining : undefined
            },
            pendingMessage: undefined,
            captchaSiteKey: undefined,
            error: undefined,
            moderation: undefined
          }));
          return;
        }

        if (response.status === 403 && payload?.captchaRequired) {
          setState((prev) => ({
            ...prev,
            pending: false,
            captchaSiteKey: typeof payload?.captchaSiteKey === "string" ? payload.captchaSiteKey : undefined,
            error: payload?.message ?? copy.captchaPrompt,
            moderation: undefined
          }));
          return;
        }

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            pending: false,
            error: payload?.message ?? copy.errorMessage,
            rateLimit: undefined,
            pendingMessage: undefined,
            moderation: undefined
          }));
          return;
        }

        const assistantMessage: ChatMessage = {
          id: randomId(),
          role: "assistant",
          content: payload.reply ?? "",
          references: payload.references ?? [],
        contextFacts: Array.isArray(payload.contextFacts) ? payload.contextFacts : [],
        createdAt: Date.now()
      };

      if (payload.unprofessional) {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((msg) => msg.id !== messageId),
          pending: false,
          error: undefined,
          notice: payload.notice ?? prev.notice,
          usedFallback: payload.usedFallback ?? prev.usedFallback,
          rateLimitRemaining: payload.rateLimitRemaining ?? prev.rateLimitRemaining,
            promptCount: payload.promptCount ?? prev.promptCount,
            captchaSiteKey: undefined,
            pendingMessage: undefined,
            rateLimit: undefined,
            moderation: "unprofessional"
          }));
          return;
        }

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
          pendingMessage: undefined,
          rateLimit: undefined,
          moderation: payload.unprofessional ? "unprofessional" : undefined
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          pending: false,
          error: copy.errorMessage,
          rateLimit: undefined,
          pendingMessage: undefined,
          moderation: undefined
        }));
      }
    },
    [
      copy.errorMessage,
      copy.captchaPrompt,
      copy.rateLimitMessage,
      hydrated,
      locale,
      sessionId,
      state.messages,
      state.pending,
      state.pendingMessage,
      state.rateLimit
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

function MarkdownMessage({
  text,
  className,
  style,
  contentStyle
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}) {
  return (
    <div className={clsx("space-y-2 break-words text-sm leading-relaxed", className)} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          p: ({ children }) => (
            <p className="whitespace-pre-wrap leading-relaxed" style={contentStyle}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="ml-4 list-disc space-y-1" style={contentStyle}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-4 list-decimal space-y-1" style={contentStyle}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed" style={contentStyle}>
              {children}
            </li>
          ),
          a: ({ children }) => <>{children}</>
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function ContextFactsPanel({ facts }: { facts: ContextFact[] }) {
  if (!facts.length) {
    return null;
  }

  return (
    <details className="mt-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs text-text shadow-sm transition dark:border-slate-700 dark:bg-dark-surface dark:text-dark-text">
      <summary className="cursor-pointer select-none font-semibold text-text dark:text-dark-text">
        Context facts ({facts.length})
      </summary>
      <div className="mt-2 space-y-2">
        {facts.map((fact, index) => (
          <a
            key={`${fact.title}-${index}`}
            href={fact.href}
            className="flex items-start justify-between gap-3 rounded-md px-2 py-1 text-text transition hover:bg-slate-100 hover:no-underline dark:text-dark-text dark:hover:bg-slate-800"
          >
            <span className="font-semibold">{fact.title}</span>
            <span className="text-[11px] text-textMuted dark:text-dark-textMuted">{fact.detail}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

function MessageBubble({
  message,
  forcedColors,
  highContrast,
  isDark
}: {
  message: ChatMessage;
  forcedColors?: boolean;
  highContrast?: boolean;
  isDark?: boolean;
}) {
  const isUser = message.role === "user";
  const hcBg = isDark ? CONTRAST_PRIMARY_DARK : CONTRAST_PRIMARY;
  const hcText = isDark ? CONTRAST_ON_PRIMARY_STRONG : CONTRAST_ON_PRIMARY;
  const userForcedStyle =
    (forcedColors || highContrast) && isUser
      ? {
          backgroundColor: hcBg,
          color: hcText,
          borderColor: hcBg,
          forcedColorAdjust: "none" as const,
          msHighContrastAdjust: "none" as const
        }
      : undefined;
  const userForcedTextStyle =
    (forcedColors || highContrast) && isUser
      ? { color: hcText, forcedColorAdjust: "none" as const, msHighContrastAdjust: "none" as const }
      : undefined;
  return (
    <div
        className={clsx(
          "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
          ? "self-end bg-accent text-accentOn contrast-more:bg-[var(--light-hc-accent)] contrast-more:text-[var(--light-hc-accentOn)] dark:bg-dark-accent dark:text-dark-accentOn dark:contrast-more:bg-[var(--dark-hc-accent)] dark:contrast-more:text-[var(--dark-hc-accentOn)]"
            : "self-start bg-surface text-text dark:bg-dark-surface dark:text-dark-text"
        )}
      style={userForcedStyle}
      data-user-bubble={isUser ? "true" : undefined}
    >
      <MarkdownMessage
        text={message.content}
        className={clsx(
          isUser
            ? "text-accentOn contrast-more:text-[var(--light-hc-accentOn)] dark:text-dark-accentOn dark:contrast-more:text-[var(--dark-hc-accentOn)]"
            : "text-text dark:text-dark-text"
        )}
        style={userForcedTextStyle}
        contentStyle={userForcedTextStyle}
      />
      {!isUser && message.contextFacts?.length ? <ContextFactsPanel facts={message.contextFacts} /> : null}
      {message.references?.length ? (
        <div className="mt-2 space-y-1 text-xs text-textMuted dark:text-dark-textMuted">
          <div className="font-semibold text-text dark:text-dark-text">References</div>
          <ul className="ml-3 list-disc space-y-1">
            {message.references.map((ref) => (
              <li key={`${message.id}-${ref.href}`}>
                <a href={ref.href} className="underline-offset-2 hover:underline">
                  {ref.title}
                </a>
              </li>
            ))}
          </ul>
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const resolveTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    setTheme(resolveTheme());

    const observer = new MutationObserver(() => {
      const next = resolveTheme();
      setTheme((prev) => (prev === next ? prev : next));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"]
    });

    return () => observer.disconnect();
  }, []);

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
        theme,
        callback: (token: string) => {
          onVerify(token);
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
  }, [siteKey, onVerify, theme]);

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
  const [chatSize, setChatSize] = useState<{ width: number; height: number }>({ width: 420, height: 520 });
  const chatSizeRef = useRef(chatSize);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const dragHandlersRef = useRef<{ onMove: (event: MouseEvent) => void; onEnd: () => void } | null>(null);
  const [isDraggingResize, setIsDraggingResize] = useState(false);
  const [isCloseHover, setIsCloseHover] = useState(false);
  const [isForcedColors, setIsForcedColors] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const closeButtonStyle = useMemo(() => {
    if (isForcedColors) {
      const hoverStyle = isCloseHover
        ? {
            backgroundColor: "Highlight",
            color: "HighlightText",
            borderColor: "Highlight",
            boxShadow: "inset 0 0 0 999px Highlight"
          }
        : {
            backgroundColor: "Canvas",
            color: "ButtonText",
            borderColor: "ButtonText",
            boxShadow: "inset 0 0 0 1px ButtonText"
          };
      return { ...hoverStyle, forcedColorAdjust: "none" as const };
    }

    const baseColor = ATTENTION_SURFACE;
    const hover = isCloseHover;
    return {
      backgroundColor: hover ? baseColor : "transparent",
      color: hover ? CONTRAST_ON_PRIMARY : baseColor,
      borderColor: baseColor,
      boxShadow: hover ? `inset 0 0 0 999px ${baseColor}` : undefined,
      forcedColorAdjust: "none" as const
    };
  }, [isCloseHover, isForcedColors]);
  const MIN_CHAT_WIDTH = 320;
  const MIN_CHAT_HEIGHT = 360;
  const rateLimitActive = isRateLimitActive(state.rateLimit);
  const retryAfterMinutes = state.rateLimit?.retryAfterMs
    ? Math.max(1, Math.ceil(state.rateLimit.retryAfterMs / 60000))
    : null;
  const rateLimitHint =
    retryAfterMinutes && copy.rateLimitTryAfter.includes("{minutes}")
      ? copy.rateLimitTryAfter.replace("{minutes}", String(retryAfterMinutes))
      : retryAfterMinutes
        ? `${copy.rateLimitTryAfter} ${retryAfterMinutes}m`
        : null;

  useEffect(() => {
    chatSizeRef.current = chatSize;
  }, [chatSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const prefersContrast = window.matchMedia("(prefers-contrast: more)");
    const root = document.documentElement;
    const readClassContrast = () => root.classList.contains("contrast-high");
    const readDarkMode = () => root.classList.contains("dark");
    const handleForced = () => setIsForcedColors(forcedColors.matches);
    const handleContrast = () => setIsHighContrast(prefersContrast.matches || readClassContrast());
    const handleDark = () => setIsDarkMode(readDarkMode());
    handleForced();
    handleContrast();
    handleDark();
    forcedColors.addEventListener("change", handleForced);
    prefersContrast.addEventListener("change", handleContrast);
    const observer = new MutationObserver(() => {
      handleContrast();
      handleDark();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-contrast"] });

    const clampSize = (width: number, height: number) => {
      const maxWidth = Math.max(MIN_CHAT_WIDTH, window.innerWidth - 48); // leave margins around the widget
      const maxHeight = Math.max(MIN_CHAT_HEIGHT, window.innerHeight - 96); // avoid covering the whole viewport
      return {
        width: Math.min(Math.max(width, MIN_CHAT_WIDTH), maxWidth),
        height: Math.min(Math.max(height, MIN_CHAT_HEIGHT), maxHeight)
      };
    };

    setChatSize((prev) => clampSize(prev.width, prev.height));

    const handleResize = () => {
      setChatSize((prev) => clampSize(prev.width, prev.height));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      forcedColors.removeEventListener("change", handleForced);
      prefersContrast.removeEventListener("change", handleContrast);
        observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const effectiveHighContrast =
    isForcedColors ||
    isHighContrast ||
    (typeof document !== "undefined" && document.documentElement.classList.contains("contrast-high"));

  useEffect(() => {
    return () => {
      const handlers = dragHandlersRef.current;
      if (handlers) {
        window.removeEventListener("mousemove", handlers.onMove);
        window.removeEventListener("mouseup", handlers.onEnd);
        window.removeEventListener("mouseleave", handlers.onEnd);
      }
    };
  }, []);

  useEffect(() => {
    if (state.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state.isOpen]);

  const handleSend = useCallback(
    async (value?: string) => {
      const text = (value ?? input).trim();
      if (!text || rateLimitActive) {
        return;
      }
      await sendMessage(text);
      setInput("");
    },
    [input, rateLimitActive, sendMessage]
  );

  const handleCaptchaVerify = useCallback(
    async (token: string) => {
      await solveCaptcha(token);
    },
    [solveCaptcha]
  );

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingResize(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: chatSizeRef.current.width,
      startHeight: chatSizeRef.current.height
    };

    const onMove = (moveEvent: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const deltaX = drag.startX - moveEvent.clientX;
      const deltaY = drag.startY - moveEvent.clientY; // invert vertical drag: pulling down shrinks, up expands
      const nextWidth = drag.startWidth + deltaX;
      const nextHeight = drag.startHeight + deltaY;

      if (typeof window !== "undefined") {
        const maxWidth = Math.max(MIN_CHAT_WIDTH, window.innerWidth - 48);
        const maxHeight = Math.max(MIN_CHAT_HEIGHT, window.innerHeight - 96);
        setChatSize({
          width: Math.min(Math.max(nextWidth, MIN_CHAT_WIDTH), maxWidth),
          height: Math.min(Math.max(nextHeight, MIN_CHAT_HEIGHT), maxHeight)
        });
      } else {
        setChatSize({
          width: Math.max(nextWidth, MIN_CHAT_WIDTH),
          height: Math.max(nextHeight, MIN_CHAT_HEIGHT)
        });
      }
    };

    const onEnd = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("mouseleave", onEnd);
      dragHandlersRef.current = null;
      setIsDraggingResize(false);
    };

    dragHandlersRef.current = { onMove, onEnd };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("mouseleave", onEnd);
  }, []);

  const moderationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.isOpen || state.moderation !== "unprofessional") return;
    const target = moderationRef.current;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [state.isOpen, state.moderation]);

  const noticeText = state.notice?.trim() ?? "";
  const hideServerNotice = noticeText
    ? /monitored\s+for\s+quality\s+assurance/i.test(noticeText)
    : false;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <style jsx global>{`
        html.contrast-high [data-user-bubble="true"] {
          background-color: var(--light-hc-accent) !important;
          color: var(--light-hc-accentOn) !important;
          border-color: var(--light-hc-accent) !important;
          forced-color-adjust: none !important;
          -ms-high-contrast-adjust: none !important;
        }
        html.contrast-high.dark [data-user-bubble="true"] {
          background-color: var(--dark-hc-accent) !important;
          color: var(--dark-hc-accentOn) !important;
          border-color: var(--dark-hc-accent) !important;
          forced-color-adjust: none !important;
          -ms-high-contrast-adjust: none !important;
        }
        html.contrast-high [data-user-bubble="true"] p,
        html.contrast-high [data-user-bubble="true"] li,
        html.contrast-high [data-user-bubble="true"] ul,
        html.contrast-high [data-user-bubble="true"] ol {
          color: inherit !important;
          forced-color-adjust: none !important;
          -ms-high-contrast-adjust: none !important;
        }
      `}</style>
      {state.isOpen ? (
        <div
          className="relative flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border/50 dark:border-dark-border dark:bg-dark-background dark:ring-dark-border/50 sm:max-h-[80vh]"
          data-chat-window="true"
          style={{
            width: chatSize.width,
            height: chatSize.height,
            minWidth: MIN_CHAT_WIDTH,
            minHeight: MIN_CHAT_HEIGHT,
            maxWidth: "calc(100vw - 2rem)",
            maxHeight: "calc(100vh - 4rem)"
          }}
        >
          <div className="flex items-center gap-2.5 border-b border-border bg-surface px-4 py-2.5 dark:border-dark-border dark:bg-dark-surface">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accentOn contrast-more:bg-[var(--light-hc-accent)] contrast-more:text-[var(--light-hc-accentOn)] contrast-more:border contrast-more:border-[var(--light-hc-accent)] dark:bg-dark-accent dark:text-contrast-on-primary-dark dark:contrast-more:bg-[var(--dark-hc-accent)] dark:contrast-more:text-[var(--dark-hc-accentOn)] dark:contrast-more:border dark:contrast-more:border-[var(--dark-hc-accent)]"
              data-chat-icon="true"
            >
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
            </div>
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full border text-danger transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger dark:text-danger"
              aria-label="Close chat"
              onMouseEnter={() => setIsCloseHover(true)}
              onMouseLeave={() => setIsCloseHover(false)}
              style={closeButtonStyle}
            >
              ✕
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
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
                  <MessageBubble
                    key={message.id}
                    message={message}
                    forcedColors={isForcedColors}
                    highContrast={effectiveHighContrast}
                    isDark={isDarkMode}
                  />
                ))}
              </div>
            )}
            {rateLimitActive && (
              <div className="rounded-lg border border-accent/60 bg-accent/10 px-3 py-2 text-xs text-text dark:text-dark-text">
                <p className="text-sm font-semibold text-accent dark:text-dark-accent">
                  {copy.rateLimitTitle}
                </p>
                <p className="mt-1 text-sm text-text dark:text-dark-text">
                  {state.rateLimit?.message ?? copy.rateLimitMessage}
                </p>
                {rateLimitHint ? (
                  <p className="mt-1 text-[11px] text-textMuted dark:text-dark-textMuted">
                    {rateLimitHint}
                  </p>
                ) : null}
              </div>
            )}
            {state.moderation === "unprofessional" ? (
              <div
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm dark:border-dark-border dark:bg-dark-surface"
                ref={moderationRef}
              >
                <div className="flex items-center gap-3">
                  <div className="overflow-hidden rounded-md border border-border/70 dark:border-dark-border/70">
                    <Image
                      src="/no_fun.jpg"
                      alt="No Fun Allowed sign"
                      width={180}
                      height={190}
                      className="h-auto w-[180px] max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{copy.moderationTitle}</p>
                    <p className="mt-1 text-xs text-textMuted dark:text-dark-textMuted">
                      {copy.moderationBody}
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="rounded-lg border border-border/70 bg-background px-3 py-3 text-sm shadow-sm dark:border-dark-border/70 dark:bg-dark-background">
                <p className="text-sm font-semibold text-text dark:text-dark-text">{copy.captchaTitle}</p>
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
          <div className="relative border-t border-border bg-surface px-4 py-3 pb-4 dark:border-dark-border dark:bg-dark-surface">
            <label className="sr-only" htmlFor="chatbot-input">
              {copy.sendLabel}
            </label>
            {state.pending ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-background">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                <span>{copy.thinkingLabel}</span>
              </div>
            ) : (
              <textarea
                id="chatbot-input"
                ref={inputRef}
                rows={state.isOpen ? 2 : 1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={rateLimitActive ? copy.rateLimitMessage : copy.panelSubtitle}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-dark-border dark:bg-dark-background"
                disabled={state.pending || Boolean(state.captchaSiteKey) || rateLimitActive}
              />
            )}
            <div className="mt-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="group relative flex h-5 w-5 cursor-sw-resize items-center justify-center rounded border border-accent bg-surface/80 text-accent shadow-sm transition hover:bg-surface hover:text-accent contrast-more:border-accent dark:border-dark-accent dark:bg-dark-surface/80 dark:text-dark-accent dark:hover:text-dark-accent"
                  onMouseDown={handleResizeStart}
                  aria-label="Resize chat"
                >
                  <span className="pointer-events-none text-[12px] leading-none">↙</span>
                  {!isDraggingResize ? (
                    <span className="pointer-events-none absolute -top-8 left-0 z-10 hidden translate-y-1 whitespace-nowrap rounded bg-surface px-2 py-1 text-[11px] text-text shadow-sm ring-1 ring-border group-hover:block dark:bg-dark-surface dark:text-dark-text dark:ring-dark-border">
                      Resize
                    </span>
                  ) : null}
                </button>
                <p className="text-left text-xs text-textMuted dark:text-dark-textMuted">
                  {copy.loggingNotice}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => handleSend()}
                data-chat-send-button="true"
                disabled={
                  state.pending || Boolean(state.captchaSiteKey) || rateLimitActive || !input.trim()
                }
                className="cursor-pointer"
              >
                {state.pending ? copy.thinkingLabel : copy.sendLabel}
              </Button>
            </div>
            {noticeText && !hideServerNotice ? (
              <p className="mt-2 text-left text-xs text-textMuted dark:text-dark-textMuted">
                {noticeText}
              </p>
            ) : null}
          </div>
          {/* Resize handle lives in the footer row now */}
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accentOn shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 contrast-more:bg-[var(--light-hc-accent)] contrast-more:text-[var(--light-hc-accentOn)] contrast-more:border contrast-more:border-[var(--light-hc-accent)] dark:bg-dark-accent dark:text-contrast-on-primary-dark dark:hover:bg-dark-accentHover dark:focus-visible:ring-offset-2 dark:contrast-more:bg-[var(--dark-hc-accent)] dark:contrast-more:text-[var(--dark-hc-accentOn)] dark:contrast-more:border dark:contrast-more:border-[var(--dark-hc-accent)]"
        aria-label={copy.launcherLabel}
        data-chat-launcher="true"
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
