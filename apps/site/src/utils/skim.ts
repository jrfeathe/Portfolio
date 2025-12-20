export type SkimSearchParams = Record<string, string | string[] | undefined>;
export type SkimValue = string | null | undefined;

export function isTruthySkimValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes"
  );
}

export function resolveSkimMode(searchParams?: SkimSearchParams) {
  if (!searchParams) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(searchParams, "skim")) {
    return false;
  }

  const raw = searchParams.skim;

  if (Array.isArray(raw)) {
    return raw.some((entry) => typeof entry === "string" && isTruthySkimValue(entry));
  }

  if (typeof raw === "string") {
    return isTruthySkimValue(raw);
  }

  return true;
}

export function hasSkimValue(value: SkimValue) {
  return value !== null && value !== undefined && value !== "";
}

export function hasSkimValues(values: SkimValue[]) {
  return values.some((value) => hasSkimValue(value));
}
