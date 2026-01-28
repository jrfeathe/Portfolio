import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import "./globals.css";
import "../src/styles/print.css";
import { defaultLocale, getLocaleDirection } from "../src/utils/i18n";
import { getDictionary } from "../src/utils/dictionaries";
import { PORTFOLIO_BASE_URL } from "../src/lib/seo/jsonld";
import { contrastCookieName } from "../src/utils/contrast";
import { themeCookieName, themeLocaleCookieName } from "../src/utils/theme";
import { CriticalCss } from "./CriticalCss";
import { ViewportHUDLayer } from "../src/components/Shell/ViewportHUDLayer";
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
const DEFAULT_DIR = getLocaleDirection(defaultLocale);

export const metadata: Metadata = {
  metadataBase: new URL(PORTFOLIO_BASE_URL),
  title: defaultDictionary.metadata.title,
  description: defaultDictionary.metadata.description,
  icons: {
    icon: "/tech-stack/bash.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

const themeInitScript = `(function(){const cookieName=${escapeUnsafeChars(
  JSON.stringify(themeCookieName)
)};const contrastCookie=${escapeUnsafeChars(
  JSON.stringify(contrastCookieName)
)};const themeLocaleCookie=${escapeUnsafeChars(
  JSON.stringify(themeLocaleCookieName)
)};const fallbackLocale=${escapeUnsafeChars(
  JSON.stringify(defaultLocale)
)};const root=document.documentElement;const skimParams=new URLSearchParams(window.location.search);const skimValues=skimParams.getAll('skim');const skimActive=skimValues.some((value)=>{const normalized=value.trim().toLowerCase();return normalized===''||normalized==='1'||normalized==='true'||normalized==='yes';});root.dataset.skimMode=skimActive?'true':'false';const getCookie=function(name){const match=document.cookie.split('; ').find((row)=>row.startsWith(name+'='));return match?match.split('=')[1]:undefined;};const resolveLocale=function(){const segment=window.location.pathname.split('/')[1];if(segment==='en'||segment==='ja'||segment==='zh'||segment==='dreamland'){return segment;}return root.lang||fallbackLocale;};const themeLocaleFallback=resolveLocale();if(themeLocaleFallback&&root.lang!==themeLocaleFallback){root.lang=themeLocaleFallback;}const resolveTheme=function(mode){if(mode==='system'){return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}return mode;};const applyTheme=function(mode){const resolved=resolveTheme(mode);root.classList.toggle('dark',resolved==='dark');root.dataset.theme=mode;};let storedTheme=getCookie(cookieName);if(storedTheme!=='light'&&storedTheme!=='dark'&&storedTheme!=='system'){storedTheme='system';}applyTheme(storedTheme);const applyThemeLocale=function(locale){root.dataset.themeLocale=locale;};let storedThemeLocale=getCookie(themeLocaleCookie);if(storedThemeLocale!=='en'&&storedThemeLocale!=='ja'&&storedThemeLocale!=='zh'&&storedThemeLocale!=='dreamland'){storedThemeLocale=themeLocaleFallback;}applyThemeLocale(storedThemeLocale);const themeMedia=window.matchMedia('(prefers-color-scheme: dark)');const themeListener=function(){const current=getCookie(cookieName);if(!current||current==='system'){applyTheme('system');}};if(typeof themeMedia.addEventListener==='function'){themeMedia.addEventListener('change',themeListener);}else if(typeof themeMedia.addListener==='function'){themeMedia.addListener(themeListener);}const resolveContrast=function(mode){if(mode==='system'){return window.matchMedia('(prefers-contrast: more)').matches?'high':'standard';}return mode;};const applyContrast=function(mode){const resolved=resolveContrast(mode);root.classList.toggle('contrast-high',resolved==='high');root.dataset.contrast=mode;};let storedContrast=getCookie(contrastCookie);if(storedContrast!=='high'&&storedContrast!=='standard'&&storedContrast!=='system'){storedContrast='system';}applyContrast(storedContrast);const contrastMedia=window.matchMedia('(prefers-contrast: more)');const contrastListener=function(){const current=getCookie(contrastCookie);if(!current||current==='system'){applyContrast('system');}};if(typeof contrastMedia.addEventListener==='function'){contrastMedia.addEventListener('change',contrastListener);}else if(typeof contrastMedia.addListener==='function'){contrastMedia.addListener(contrastListener);}window.__portfolioTheme={get:function(){const value=getCookie(cookieName);return value==='light'||value==='dark'||value==='system'?value:'system';},set:function(mode){const value=mode==='light'||mode==='dark'?mode:'system';document.cookie=cookieName+'='+value+'; path=/; max-age=31536000; SameSite=Lax';applyTheme(value);}};window.__portfolioThemeLocale={get:function(){const value=getCookie(themeLocaleCookie);return value==='en'||value==='ja'||value==='zh'||value==='dreamland'?value:themeLocaleFallback;},set:function(locale){const value=locale==='en'||locale==='ja'||locale==='zh'||locale==='dreamland'?locale:themeLocaleFallback;document.cookie=themeLocaleCookie+'='+value+'; path=/; max-age=31536000; SameSite=Lax';applyThemeLocale(value);}};window.__portfolioContrast={get:function(){const value=getCookie(contrastCookie);return value==='high'||value==='standard'||value==='system'?value:'system';},set:function(mode){const value=mode==='high'||mode==='standard'?mode:'system';document.cookie=contrastCookie+'='+value+'; path=/; max-age=31536000; SameSite=Lax';applyContrast(value);}};})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const browserOtelEnabled =
    typeof process.env.NEXT_PUBLIC_ENABLE_OTEL_BROWSER === "string" &&
    process.env.NEXT_PUBLIC_ENABLE_OTEL_BROWSER !== "";

  return (
    <html
      lang={defaultLocale}
      dir={DEFAULT_DIR}
      data-theme="system"
      data-theme-locale={defaultLocale}
      data-contrast="system"
    >
      <body
        className={clsx(
          "min-h-screen bg-background font-sans text-text antialiased dark:bg-dark-background dark:text-dark-text",
        )}
      >
        <CriticalCss />
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {browserOtelEnabled ? <OtelBootstrap /> : null}
        <ViewportHUDLayer />
        {children}
      </body>
    </html>
  );
}
