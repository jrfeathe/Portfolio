import clsx from "clsx";
import type { Metadata } from "next";
import { cookies, headers as getHeaders } from "next/headers";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import "./globals.css";
import "../src/styles/print.css";
import {
  defaultLocale,
  getLocaleDirection,
  isLocale,
  localeCookieName
} from "../src/utils/i18n";
import { getDictionary } from "../src/utils/dictionaries";
import {
  isContrastPreference,
  contrastCookieName,
  type ContrastPreference
} from "../src/utils/contrast";
import {
  isThemePreference,
  themeCookieName,
  type ThemePreference
} from "../src/utils/theme";
import { CriticalCss } from "./CriticalCss";
import { extractNonceFromHeaders } from "../src/utils/csp";
const OtelBootstrap = dynamic(
  () =>
    import("../src/components/telemetry/OtelBootstrap").then(
      (mod) => mod.OtelBootstrap
    ),
  { ssr: false, loading: () => null }
);

// Escapes potentially dangerous characters for safe JS embedding in <script> tags
const charMap = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
};
function escapeUnsafeChars(str: string): string {
  return str.replace(/[<>\b\f\n\r\t\0\u2028\u2029/\\]/g, (c) => charMap[c as keyof typeof charMap] || c);
}

const defaultDictionary = getDictionary(defaultLocale);

export const metadata: Metadata = {
  title: defaultDictionary.metadata.title,
  description: defaultDictionary.metadata.description,
  icons: {
    icon: "/tech-stack/bash.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const storedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(storedLocale) ? storedLocale : defaultLocale;
  const browserOtelEnabled =
    typeof process.env.NEXT_PUBLIC_ENABLE_OTEL_BROWSER === "string" &&
    process.env.NEXT_PUBLIC_ENABLE_OTEL_BROWSER !== "";
  const headerList = getHeaders();
  const nonce = extractNonceFromHeaders(headerList);
  const storedThemeCookie = cookieStore.get(themeCookieName)?.value;
  const storedTheme: ThemePreference = isThemePreference(storedThemeCookie)
    ? storedThemeCookie
    : "system";
  const storedContrastCookie = cookieStore.get(contrastCookieName)?.value;
  const storedContrast: ContrastPreference = isContrastPreference(storedContrastCookie)
    ? storedContrastCookie
    : "system";
  const secChTheme = headerList.get("sec-ch-prefers-color-scheme");
  const prefersDarkFromClient = secChTheme === "dark";
  const secChContrast = headerList.get("sec-ch-prefers-contrast");
  const prefersHighContrastFromClient = secChContrast === "more";
  const initialThemeClass =
    storedTheme === "dark" ||
    (storedTheme === "system" && prefersDarkFromClient)
      ? "dark"
      : undefined;
  const initialContrastClass =
    storedContrast === "high" ||
    (storedContrast === "system" && prefersHighContrastFromClient)
      ? "contrast-high"
      : undefined;

  const themeInitScript = `(function(){const cookieName=${escapeUnsafeChars(
    JSON.stringify(themeCookieName)
  )};const contrastCookie=${escapeUnsafeChars(
    JSON.stringify(contrastCookieName)
  )};const root=document.documentElement;const getCookie=function(name){const match=document.cookie.split('; ').find((row)=>row.startsWith(name+'='));return match?match.split('=')[1]:undefined;};const resolveTheme=function(mode){if(mode==='system'){return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}return mode;};const applyTheme=function(mode){const resolved=resolveTheme(mode);root.classList.toggle('dark',resolved==='dark');root.dataset.theme=mode;};let storedTheme=getCookie(cookieName);if(storedTheme!=='light'&&storedTheme!=='dark'&&storedTheme!=='system'){storedTheme='system';}applyTheme(storedTheme);const themeMedia=window.matchMedia('(prefers-color-scheme: dark)');const themeListener=function(){const current=getCookie(cookieName);if(!current||current==='system'){applyTheme('system');}};if(typeof themeMedia.addEventListener==='function'){themeMedia.addEventListener('change',themeListener);}else if(typeof themeMedia.addListener==='function'){themeMedia.addListener(themeListener);}const resolveContrast=function(mode){if(mode==='system'){return window.matchMedia('(prefers-contrast: more)').matches?'high':'standard';}return mode;};const applyContrast=function(mode){const resolved=resolveContrast(mode);root.classList.toggle('contrast-high',resolved==='high');root.dataset.contrast=mode;};let storedContrast=getCookie(contrastCookie);if(storedContrast!=='high'&&storedContrast!=='standard'&&storedContrast!=='system'){storedContrast='system';}applyContrast(storedContrast);const contrastMedia=window.matchMedia('(prefers-contrast: more)');const contrastListener=function(){const current=getCookie(contrastCookie);if(!current||current==='system'){applyContrast('system');}};if(typeof contrastMedia.addEventListener==='function'){contrastMedia.addEventListener('change',contrastListener);}else if(typeof contrastMedia.addListener==='function'){contrastMedia.addListener(contrastListener);}window.__portfolioTheme={get:function(){const value=getCookie(cookieName);return value==='light'||value==='dark'||value==='system'?value:'system';},set:function(mode){const value=mode==='light'||mode==='dark'?mode:'system';document.cookie=cookieName+'='+value+'; path=/; max-age=31536000; SameSite=Lax';applyTheme(value);}};window.__portfolioContrast={get:function(){const value=getCookie(contrastCookie);return value==='high'||value==='standard'||value==='system'?value:'system';},set:function(mode){const value=mode==='high'||mode==='standard'?mode:'system';document.cookie=contrastCookie+'='+value+'; path=/; max-age=31536000; SameSite=Lax';applyContrast(value);}};})();`;

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      className={clsx(initialThemeClass, initialContrastClass)}
      data-theme={storedTheme}
      data-contrast={storedContrast}
    >
      <body
        className={clsx(
          "min-h-screen bg-background font-sans text-text antialiased dark:bg-dark-background dark:text-dark-text",
        )}
        data-csp-nonce={nonce}
      >
        <CriticalCss nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {nonce ? (
          <script
            suppressHydrationWarning
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.__webpack_nonce__=${JSON.stringify(
                nonce
              )};window.__next_style_nonce__=${JSON.stringify(nonce)};`
            }}
          />
        ) : null}
        {browserOtelEnabled ? <OtelBootstrap /> : null}
        {children}
      </body>
    </html>
  );
}
