import type { Locale } from "../../utils/i18n";

const openGraphLocaleMap: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN"
};

export function resolveOpenGraphLocale(locale: Locale) {
  return openGraphLocaleMap[locale] ?? openGraphLocaleMap.en;
}
