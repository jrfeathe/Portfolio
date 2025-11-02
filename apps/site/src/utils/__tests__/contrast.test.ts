import { getNextContrast, isContrastPreference } from "../contrast";

describe("contrast utilities", () => {
  it("cycles through contrast preferences in order", () => {
    expect(getNextContrast("system")).toBe("high");
    expect(getNextContrast("high")).toBe("standard");
    expect(getNextContrast("standard")).toBe("system");
  });

  it("falls back to system when current value is unexpected", () => {
    expect(getNextContrast("invalid" as never)).toBe("system");
  });

  it("validates contrast preferences", () => {
    expect(isContrastPreference("system")).toBe(true);
    expect(isContrastPreference("high")).toBe(true);
    expect(isContrastPreference("standard")).toBe(true);
    expect(isContrastPreference("other")).toBe(false);
  });
});
