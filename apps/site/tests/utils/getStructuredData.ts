import type { Page } from "@playwright/test";

export type StructuredDataResult = {
  nonce: string | null;
  raw: string | null;
};

const SCRIPT_REGEX = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
const NONCE_REGEX = /nonce=["']([^"']+)["']/i;

export function extractStructuredDataFromHtml(html: string): StructuredDataResult {
  const match = html.match(SCRIPT_REGEX);
  if (!match) {
    return { nonce: null, raw: null };
  }
  const [fullMatch, raw] = match;
  const nonceMatch = fullMatch.match(NONCE_REGEX);
  return {
    nonce: nonceMatch?.[1] ?? null,
    raw: raw ?? null
  };
}

export async function getStructuredDataScript(page: Page): Promise<StructuredDataResult> {
  const scriptLocator = page.locator('script[type="application/ld+json"]');
  await scriptLocator.first().waitFor({ state: "attached" });
  const nonce = await scriptLocator.first().getAttribute("nonce");
  const raw = await scriptLocator.first().textContent();
  return {
    nonce,
    raw
  };
}
