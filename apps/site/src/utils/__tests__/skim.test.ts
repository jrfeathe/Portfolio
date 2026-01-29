import {
  hasSkimValue,
  hasSkimValues,
  isTruthySkimValue,
  resolveSkimMode
} from "../skim";

describe("resolveSkimMode", () => {
  it("returns false when no search params provided", () => {
    expect(resolveSkimMode()).toBe(false);
  });

  it("returns false when skim param is missing", () => {
    expect(resolveSkimMode({})).toBe(false);
  });

  it("returns true for truthy skim values", () => {
    expect(resolveSkimMode({ skim: "1" })).toBe(true);
    expect(resolveSkimMode({ skim: "true" })).toBe(true);
    expect(resolveSkimMode({ skim: "yes" })).toBe(true);
    expect(resolveSkimMode({ skim: "" })).toBe(true);
  });

  it("returns false for non-truthy skim values", () => {
    expect(resolveSkimMode({ skim: "0" })).toBe(false);
    expect(resolveSkimMode({ skim: "false" })).toBe(false);
  });

  it("handles array skim values", () => {
    expect(resolveSkimMode({ skim: ["0", "1"] })).toBe(true);
    expect(resolveSkimMode({ skim: ["no", "0"] })).toBe(false);
  });

  it("treats undefined skim values as enabled once present", () => {
    expect(resolveSkimMode({ skim: undefined })).toBe(true);
  });
});

describe("isTruthySkimValue", () => {
  it("normalizes common truthy inputs", () => {
    expect(isTruthySkimValue("  TRUE ")).toBe(true);
    expect(isTruthySkimValue("yes")).toBe(true);
    expect(isTruthySkimValue("0")).toBe(false);
  });
});

describe("skim gating helpers", () => {
  it("treats empty string and null as missing", () => {
    expect(hasSkimValue("")).toBe(false);
    expect(hasSkimValue(null)).toBe(false);
    expect(hasSkimValue(undefined)).toBe(false);
  });

  it("treats non-empty strings as present", () => {
    expect(hasSkimValue("ok")).toBe(true);
    expect(hasSkimValue(" ")).toBe(true);
  });

  it("detects any present value in a list", () => {
    expect(hasSkimValues(["", null, undefined])).toBe(false);
    expect(hasSkimValues(["", "value", null])).toBe(true);
  });
});
