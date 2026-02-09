import type { MetadataRoute } from "next";

import { locales } from "../src/utils/i18n";
import { PORTFOLIO_BASE_URL } from "../src/lib/seo/jsonld";

const baseUrl = PORTFOLIO_BASE_URL;

function buildLanguageAlternates(pathSuffix: string) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      new URL(`/${locale}${pathSuffix}`, baseUrl).toString()
    ])
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const homeAlternates = buildLanguageAlternates("");
  const experienceAlternates = buildLanguageAlternates("/experience");
  const meetingsAlternates = buildLanguageAlternates("/meetings");
  const servicesAlternates = buildLanguageAlternates("/services");
  const servicesTermsAlternates = buildLanguageAlternates("/services/terms");

  return locales.flatMap((locale) => [
    {
      url: new URL(`/${locale}`, baseUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: homeAlternates
      }
    },
    {
      url: new URL(`/${locale}/experience`, baseUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: experienceAlternates
      }
    },
    {
      url: new URL(`/${locale}/meetings`, baseUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: meetingsAlternates
      }
    },
    {
      url: new URL(`/${locale}/services`, baseUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: servicesAlternates
      }
    },
    {
      url: new URL(`/${locale}/services/terms`, baseUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: servicesTermsAlternates
      }
    }
  ]);
}
