import type { ContrastPreference } from "./contrast";
import type { ThemePreference } from "./theme";

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

type TopBarCopy = {
  themeLabel: string;
  themeOptions: Record<ThemePreference, string>;
  contrastLabel: string;
  contrastOptions: Record<ContrastPreference, string>;
  skim: {
    buttonLabelOn: string;
    buttonLabelOff: string;
    statusOn: string;
    statusOff: string;
    ariaEnable: string;
    ariaDisable: string;
  };
};

const topBarCopy: Record<Locale, TopBarCopy> = {
  en: {
    themeLabel: "Select color theme",
    themeOptions: {
      light: "Light",
      system: "System",
      dark: "Dark"
    },
    contrastLabel: "Select contrast preference",
    contrastOptions: {
      standard: "Normal",
      system: "System",
      high: "High"
    },
    skim: {
      buttonLabelOn: "Skim mode",
      buttonLabelOff: "Skim mode",
      statusOn: "ON",
      statusOff: "OFF",
      ariaEnable: "Enable recruiter skim mode",
      ariaDisable: "Disable recruiter skim mode"
    }
  },
  ja: {
    themeLabel: "テーマを選択",
    themeOptions: {
      light: "ライト",
      system: "システム",
      dark: "ダーク"
    },
    contrastLabel: "コントラストを選択",
    contrastOptions: {
      standard: "標準",
      system: "システム",
      high: "ハイ"
    },
    skim: {
      buttonLabelOn: "要約モード",
      buttonLabelOff: "要約モード",
      statusOn: "オン",
      statusOff: "オフ",
      ariaEnable: "要約モードを有効化",
      ariaDisable: "要約モードを無効化"
    }
  },
  zh: {
    themeLabel: "选择主题",
    themeOptions: {
      light: "浅色",
      system: "系统",
      dark: "深色"
    },
    contrastLabel: "选择对比度",
    contrastOptions: {
      standard: "标准",
      system: "系统",
      high: "高"
    },
    skim: {
      buttonLabelOn: "摘要模式",
      buttonLabelOff: "摘要模式",
      statusOn: "开",
      statusOff: "关",
      ariaEnable: "启用招聘者摘要模式",
      ariaDisable: "关闭招聘者摘要模式"
    }
  }
};

export function getTopBarCopy(locale: Locale): TopBarCopy {
  return topBarCopy[locale] ?? topBarCopy.en;
}
