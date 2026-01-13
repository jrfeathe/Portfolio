import { test, expect, type APIRequestContext } from "@playwright/test";
import { extractStructuredDataFromHtml } from "./utils/getStructuredData";

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

async function readStructuredData(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  const { raw } = extractStructuredDataFromHtml(html);
  expect(raw).toBeTruthy();
  return JSON.parse(raw ?? "{}");
}

test.describe("Structured data", () => {
  test("home page exposes person + website graph", async ({ request }) => {
    const payload = await readStructuredData(request, "/en");
    const types = collectTypes(payload["@graph"] ?? []);
    expect(types).toEqual(
      expect.arrayContaining(["Person", "WebSite", "WebPage", "BreadcrumbList"])
    );
  });
});
