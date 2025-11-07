import type { Page } from "@playwright/test";

export type StructuredDataResult = {
  nonce: string | null;
  raw: string | null;
};

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
