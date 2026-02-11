import type { Localized } from "../../../../../content/serviceProofItems";
import type { Locale } from "../../utils/i18n";

export function localize<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

export function formatYearMonth(value: string, locale: Locale): string {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short"
  }).format(date);
}

export function formatFullDate(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function parseYearMonth(value: string): number {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getTime();
}

type ClientInfo = {
  name?: string;
  role?: Localized<string>;
  org?: Localized<string>;
  note?: Localized<string>;
};

type ClientAttribution = {
  primary: string;
  secondary?: string;
  note?: string;
};

export function formatClientAttribution({
  client,
  isAnonymized,
  locale,
  anonymousLabel,
  unknownLabel
}: {
  client?: ClientInfo;
  isAnonymized: boolean;
  locale: Locale;
  anonymousLabel: string;
  unknownLabel: string;
}): ClientAttribution {
  const resolvedOrg = client?.org ? localize(client.org, locale) : "";
  const resolvedRole = client?.role ? localize(client.role, locale) : "";
  const resolvedNote = client?.note ? localize(client.note, locale) : "";

  const primary =
    client?.name ||
    resolvedOrg ||
    (isAnonymized ? anonymousLabel : unknownLabel);

  const secondaryParts = [] as string[];

  if (resolvedRole) {
    secondaryParts.push(resolvedRole);
  }

  if (client?.name && resolvedOrg) {
    secondaryParts.push(resolvedOrg);
  }

  return {
    primary,
    secondary: secondaryParts.length ? secondaryParts.join(" · ") : undefined,
    note: resolvedNote || undefined
  };
}
