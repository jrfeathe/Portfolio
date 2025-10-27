import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import "./globals.css";
import "../src/styles/print.css";
import {
  defaultLocale,
  getLocaleDirection,
  isLocale,
  localeCookieName
} from "../src/utils/i18n";
import { getDictionary } from "../src/utils/dictionaries";

const defaultDictionary = getDictionary(defaultLocale);

export const metadata: Metadata = {
  title: defaultDictionary.metadata.title,
  description: defaultDictionary.metadata.description
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const storedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(storedLocale) ? storedLocale : defaultLocale;

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body className="min-h-screen bg-background font-sans text-text antialiased dark:bg-dark-background dark:text-dark-text">
        {children}
      </body>
    </html>
  );
}
