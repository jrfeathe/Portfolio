export {};

declare global {
  interface Window {
    __portfolioTheme?: {
      get(): "light" | "dark" | "system";
      set(theme: "light" | "dark" | "system"): void;
    };
    __portfolioThemeLocale?: {
      get(): "en" | "ja" | "zh" | "dreamland";
      set(locale: "en" | "ja" | "zh" | "dreamland"): void;
    };
    __portfolioContrast?: {
      get(): "system" | "high" | "standard";
      set(mode: "system" | "high" | "standard"): void;
    };
  }
}
