import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import type { Locale } from "../../utils/i18n";

const HCAPTCHA_SCRIPT_BASE = "https://js.hcaptcha.com/1/api.js?render=explicit";

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

function getHCaptchaLanguage(locale?: Locale): string | null {
  if (locale === "ja") {
    return "ja";
  }
  if (locale === "zh") {
    return "zh-CN";
  }
  return null;
}

function buildHCaptchaScriptSrc(locale?: Locale): string {
  const language = getHCaptchaLanguage(locale);
  if (!language) {
    return HCAPTCHA_SCRIPT_BASE;
  }
  return `${HCAPTCHA_SCRIPT_BASE}&hl=${encodeURIComponent(language)}`;
}

function loadHCaptchaScript(locale?: Locale): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  let script = document.querySelector<HTMLScriptElement>('script[data-hcaptcha-script="true"]');
  const desiredLanguage = getHCaptchaLanguage(locale) ?? "default";
  const desiredSrc = buildHCaptchaScriptSrc(locale);

  if (script && script.dataset.hcaptchaLang !== desiredLanguage) {
    script.remove();
    script = null;
    if (window.hcaptcha) {
      delete window.hcaptcha;
    }
  }

  if (window.hcaptcha && script && script.dataset.hcaptchaLang === desiredLanguage) {
    return Promise.resolve();
  }

  if (!script) {
    script = document.createElement("script");
    script.src = desiredSrc;
    script.async = true;
    script.defer = true;
    script.dataset.hcaptchaScript = "true";
    script.dataset.hcaptchaLang = desiredLanguage;
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

export function HCaptchaWidget({
  siteKey,
  onVerify,
  locale,
  disabled
}: {
  siteKey: string;
  onVerify: (token: string) => void;
  locale: Locale;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const readTheme = () => (root.classList.contains("dark") ? "dark" : "light");
    setTheme(readTheme());

    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      if (!siteKey || typeof window === "undefined") {
        return;
      }

      try {
        await loadHCaptchaScript(locale);
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
  }, [siteKey, onVerify, theme, locale]);

  return (
    <div className="mt-2">
      <div
        ref={containerRef}
        className={clsx(disabled && "pointer-events-none opacity-60")}
      />
    </div>
  );
}
