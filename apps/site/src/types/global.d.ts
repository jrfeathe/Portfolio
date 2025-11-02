export {};

declare global {
  interface Window {
    __portfolioTheme?: {
      get(): "light" | "dark" | "system";
      set(theme: "light" | "dark" | "system"): void;
    };
    __portfolioContrast?: {
      get(): "system" | "high" | "standard";
      set(mode: "system" | "high" | "standard"): void;
    };
  }
}
