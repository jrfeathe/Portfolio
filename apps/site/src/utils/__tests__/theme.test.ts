import {
  getNextTheme,
  isThemeLocale,
  isThemePreference,
  themeCookieName,
  themeLocaleCookieName
} from "../theme";

describe("theme utilities", () => {
  it("cycles through theme preferences in order", () => {
    expect(getNextTheme("system")).toBe("dark");
    expect(getNextTheme("dark")).toBe("light");
    expect(getNextTheme("light")).toBe("system");
  });

  it("falls back to system when current value is unexpected", () => {
    expect(getNextTheme("system" as never)).toBe("dark");
    expect(getNextTheme("invalid" as never)).toBe("system");
  });

  it("validates theme preferences", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("other")).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
  });

  it("validates theme locale values", () => {
    expect(themeCookieName).toBe("portfolio-theme");
    expect(themeLocaleCookieName).toBe("portfolio-theme-locale");
    expect(isThemeLocale("en")).toBe(true);
    expect(isThemeLocale("dreamland")).toBe(true);
    expect(isThemeLocale("unknown")).toBe(false);
    expect(isThemeLocale(undefined)).toBe(false);
  });
});
