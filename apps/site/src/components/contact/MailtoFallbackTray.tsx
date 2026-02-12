"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import type { AppDictionary } from "../../utils/dictionaries";

type MailtoTrayCopy = AppDictionary["mailtoTray"];

type MailtoIntent = {
  email: string;
  subject: string;
  body: string;
};

type MailtoFallbackTrayProps = {
  copy: MailtoTrayCopy;
};

function parseMailtoHref(rawHref: string): MailtoIntent | null {
  const href = rawHref.trim();
  if (!href.toLowerCase().startsWith("mailto:")) {
    return null;
  }

  const payload = href.slice("mailto:".length);
  const queryStart = payload.indexOf("?");
  const recipientPart = queryStart === -1 ? payload : payload.slice(0, queryStart);
  const queryPart = queryStart === -1 ? "" : payload.slice(queryStart + 1);
  let email = "";

  try {
    email = decodeURIComponent(recipientPart).trim();
  } catch {
    return null;
  }

  if (!email) {
    return null;
  }

  const params = new URLSearchParams(queryPart);

  return {
    email,
    subject: params.get("subject") ?? "",
    body: params.get("body") ?? ""
  };
}

function buildGmailComposeHref(intent: MailtoIntent): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: intent.email
  });

  if (intent.subject) {
    params.set("su", intent.subject);
  }
  if (intent.body) {
    params.set("body", intent.body);
  }

  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildOutlookComposeHref(intent: MailtoIntent): string {
  const params = new URLSearchParams({
    to: intent.email
  });

  if (intent.subject) {
    params.set("subject", intent.subject);
  }
  if (intent.body) {
    params.set("body", intent.body);
  }

  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

function buildYahooComposeHref(intent: MailtoIntent): string {
  const params = new URLSearchParams({
    to: intent.email
  });

  if (intent.subject) {
    params.set("subject", intent.subject);
  }

  return `http://compose.mail.yahoo.com/?${params.toString()}`;
}

function buildAolComposeHref(intent: MailtoIntent): string {
  const params = new URLSearchParams({
    to: intent.email
  });

  if (intent.subject) {
    params.set("subject", intent.subject);
  }

  return `http://webmail.aol.com/Mail/ComposeMessage.aspx?${params.toString()}`;
}

async function copyText(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback below handles restricted clipboard contexts.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

export function MailtoFallbackTray({ copy }: MailtoFallbackTrayProps) {
  const [intent, setIntent] = useState<MailtoIntent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  const pendingIntentRef = useRef<MailtoIntent | null>(null);
  const openTimeoutRef = useRef<number | null>(null);

  const openPendingIntent = useCallback(() => {
    if (!pendingIntentRef.current) {
      return;
    }

    setIsOpen(true);
    pendingIntentRef.current = null;
  }, []);

  useEffect(() => {
    const scheduleTrayOpen = (nextIntent: MailtoIntent) => {
      setIntent(nextIntent);
      setCopyState("idle");
      pendingIntentRef.current = nextIntent;

      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current);
      }

      openTimeoutRef.current = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          openPendingIntent();
        }
      }, 700);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      const parsed = parseMailtoHref(href);
      if (!parsed) {
        return;
      }

      scheduleTrayOpen(parsed);
    };

    const handleFocus = () => {
      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          openPendingIntent();
        }
      }, 0);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        openPendingIntent();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current);
      }
    };
  }, [openPendingIntent]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const gmailHref = useMemo(
    () => (intent ? buildGmailComposeHref(intent) : ""),
    [intent]
  );
  const outlookHref = useMemo(
    () => (intent ? buildOutlookComposeHref(intent) : ""),
    [intent]
  );
  const yahooHref = useMemo(
    () => (intent ? buildYahooComposeHref(intent) : ""),
    [intent]
  );
  const aolHref = useMemo(
    () => (intent ? buildAolComposeHref(intent) : ""),
    [intent]
  );

  const copyStatusText =
    copyState === "success"
      ? copy.copySuccess
      : copyState === "error"
        ? copy.copyFailure
        : "";

  const handleCopyEmail = useCallback(async () => {
    if (!intent) {
      return;
    }

    const copied = await copyText(intent.email);
    setCopyState(copied ? "success" : "error");
  }, [intent]);

  if (!intent) {
    return null;
  }

  return (
    <aside
      data-mailto-tray="true"
      className={clsx(
        "fixed right-4 z-50 w-[min(18rem,calc(100%-2rem))] transition duration-200 ease-out",
        isOpen
          ? "visible pointer-events-auto translate-y-0 opacity-100"
          : "invisible pointer-events-none translate-y-3 opacity-0"
      )}
      style={{ bottom: "calc(1rem + var(--safe-bottom, 0px))" }}
      aria-hidden={!isOpen}
    >
      <div className="rounded-2xl border border-border bg-surface/95 px-4 pb-3 pt-4 shadow-2xl backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface/95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text dark:text-dark-text">
              {copy.title}
            </p>
            <p className="mt-1 text-xs text-textMuted dark:text-dark-textMuted">
              {copy.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={copy.closeLabel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface p-0 text-sm font-semibold text-text shadow-md transition hover:bg-surfaceMuted dark:border-dark-border/70 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
          >
            {"✕"}
          </button>
        </div>

        <div className="relative mt-3 rounded-xl border border-border/70 bg-background/70 px-3 py-2 pr-12 dark:border-dark-border/70 dark:bg-dark-background/70">
          <div className="absolute right-2 top-2">
            <div className="group relative">
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label={copy.copyEmailLabel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-surface p-0 text-text shadow-sm transition hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border/70 dark:bg-dark-surface dark:hover:bg-dark-surfaceMuted dark:focus-visible:ring-dark-accent/40"
              >
                <img
                  src="/copy.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-3.5 w-3.5 dark:invert"
                />
              </button>
              <span className="pointer-events-none absolute -top-8 right-0 hidden whitespace-nowrap rounded-md border border-border/70 bg-surface px-2 py-1 text-[11px] font-semibold text-text shadow-sm group-hover:block group-focus-within:block dark:border-dark-border/70 dark:bg-dark-surface dark:text-dark-text">
                {copy.copyLabel}
              </span>
            </div>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            {copy.emailLabel}
          </p>
          <p className="mt-1 break-all text-sm font-medium text-text dark:text-dark-text">
            {intent.email}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
            {copy.openInLabel}
          </p>
          <a
            href={gmailHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={copy.gmailLabel}
            title={copy.gmailLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-surface p-0 text-text shadow-sm transition hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border/70 dark:bg-dark-surface dark:hover:bg-dark-surfaceMuted dark:focus-visible:ring-dark-accent/40"
          >
            <img
              src="/gmail.svg"
              alt=""
              aria-hidden="true"
              className="h-5 w-5"
            />
          </a>
          <a
            href={outlookHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={copy.outlookLabel}
            title={copy.outlookLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-surface p-0 text-text shadow-sm transition hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border/70 dark:bg-dark-surface dark:hover:bg-dark-surfaceMuted dark:focus-visible:ring-dark-accent/40"
          >
            <img
              src="/outlook.svg"
              alt=""
              aria-hidden="true"
              className="h-5 w-5"
            />
          </a>
          <a
            href={yahooHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={copy.yahooLabel}
            title={copy.yahooLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-white p-0 text-text shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border/70 dark:bg-white dark:hover:bg-white/90 dark:focus-visible:ring-dark-accent/40"
          >
            <img
              src="/yahoo.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
          </a>
          <a
            href={aolHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={copy.aolLabel}
            title={copy.aolLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-[#ffd327] p-0 text-text shadow-sm transition hover:bg-[#e6be24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border/70 dark:bg-[#ffd327] dark:hover:bg-[#e6be24] dark:focus-visible:ring-dark-accent/40"
          >
            <img
              src="/aol.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </a>
        </div>

        <p
          aria-live="polite"
          className="mt-0.5 text-xs text-textMuted dark:text-dark-textMuted"
        >
          {copyStatusText}
        </p>
      </div>
    </aside>
  );
}
