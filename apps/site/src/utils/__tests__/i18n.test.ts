import {
  defaultLocale,
  getLanguageSwitcherLabel,
  getLocaleDirection,
  getLocaleLabel,
  isLocale,
  localeCookieName,
  locales,
  parseLocale
} from "../i18n";

describe("i18n utilities", () => {
  it("exposes expected locale metadata", () => {
    expect(locales).toEqual(["en", "ja", "zh"]);
    expect(defaultLocale).toBe("en");
    expect(localeCookieName).toBe("NEXT_LOCALE");
  });

  it("validates locale strings", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(true);
    expect(isLocale("zh")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("returns presentation labels and direction", () => {
    expect(getLocaleLabel("en")).toMatchObject({
      label: "English",
      nativeLabel: "English"
    });
    expect(getLocaleDirection("en")).toBe("ltr");
    expect(getLocaleDirection("ja")).toBe("ltr");
    expect(getLanguageSwitcherLabel("zh")).toBe("语言");
  });

  it("parses locale inputs", () => {
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale(["ja"])).toBe("ja");
    expect(parseLocale(["fr", "en"])).toBeNull();
    expect(parseLocale(null)).toBeNull();
    expect(parseLocale(undefined)).toBeNull();
  });

});
