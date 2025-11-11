export const locales = ["en", "ja", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "NEXT_LOCALE";

type LocalePresentation = {
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
};

const localePresentation: Record<Locale, LocalePresentation> = {
  en: { label: "English", nativeLabel: "English", direction: "ltr" },
  ja: { label: "Japanese", nativeLabel: "日本語", direction: "ltr" },
  zh: { label: "Chinese (Simplified)", nativeLabel: "简体中文", direction: "ltr" }
};

const languageSwitcherLabel: Record<Locale, string> = {
  en: "Language",
  ja: "言語",
  zh: "语言"
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getLocaleLabel(locale: Locale) {
  return localePresentation[locale];
}

export function getLocaleDirection(locale: Locale) {
  return localePresentation[locale].direction;
}

export function getLanguageSwitcherLabel(locale: Locale) {
  return languageSwitcherLabel[locale];
}

export function parseLocale(value: string | string[] | undefined | null): Locale | null {
  if (Array.isArray(value)) {
    return value.length ? (isLocale(value[0]) ? value[0] : null) : null;
  }

  return isLocale(value ?? undefined) ? (value as Locale) : null;
}
