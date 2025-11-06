import { test, expect, type Page } from "@playwright/test";
import { getStructuredDataScript } from "./utils/getStructuredData";

function collectTypes(graph: Array<Record<string, unknown>>) {
  return graph.flatMap((entry) => {
    const value = entry["@type"];
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return [value];
    }
    return [];
  });
}

async function readStructuredData(page: Page) {
  const { nonce, raw } = await getStructuredDataScript(page);
  const bodyNonce = await page.locator("body").getAttribute("data-csp-nonce");
  if (bodyNonce && nonce) {
    expect(bodyNonce).toBe(nonce);
  }

  return JSON.parse(raw ?? "{}");
}

test.describe("Structured data", () => {
  test("home page exposes person + website graph", async ({ page }) => {
    await page.goto("/en");
    const payload = await readStructuredData(page);
    const types = collectTypes(payload["@graph"] ?? []);
    expect(types).toEqual(
      expect.arrayContaining(["Person", "WebSite", "WebPage", "BreadcrumbList"])
    );
  });

  test("notes index models the collection page", async ({ page }) => {
    await page.goto("/en/notes");
    const payload = await readStructuredData(page);
    const types = collectTypes(payload["@graph"] ?? []);
    expect(types).toEqual(
      expect.arrayContaining(["CollectionPage", "BreadcrumbList", "WebSite"])
    );
  });

  test("note detail emits article schema", async ({ page }) => {
    await page.goto("/en/notes/mdx-pipeline");
    const payload = await readStructuredData(page);
    const types = collectTypes(payload["@graph"] ?? []);
    expect(types).toContain("Article");
  });
});
