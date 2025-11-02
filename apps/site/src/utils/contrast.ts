export type ContrastPreference = "system" | "high" | "standard";

export const contrastCookieName = "portfolio-contrast";

export function isContrastPreference(value: unknown): value is ContrastPreference {
  return value === "system" || value === "high" || value === "standard";
}

const CONTRAST_CYCLE: ContrastPreference[] = ["system", "high", "standard"];

export function getNextContrast(current: ContrastPreference): ContrastPreference {
  const index = CONTRAST_CYCLE.indexOf(current);
  if (index === -1) {
    return "system";
  }
  return CONTRAST_CYCLE[(index + 1) % CONTRAST_CYCLE.length];
}
