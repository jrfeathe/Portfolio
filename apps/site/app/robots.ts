import type { MetadataRoute } from "next";

import { locales } from "../src/utils/i18n";
import { PORTFOLIO_BASE_URL } from "../src/lib/seo/jsonld";

export default function robots(): MetadataRoute.Robots {
  const localeNotes = locales.map((locale) => `/${locale}/notes`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/_next",
          "/experience",
          "/meetings",
          "/notes",
          ...localeNotes
        ]
      }
    ],
    sitemap: `${PORTFOLIO_BASE_URL}/sitemap.xml`
  };
}
