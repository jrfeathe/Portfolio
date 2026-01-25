import { test, expect } from "@playwright/test";

test.describe.skip("Engineering notes flow (pending single-page writeup)", () => {
  test("lists published notes and renders detail with table of contents", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/en/notes", { waitUntil: "domcontentloaded" });

    const toc = page.locator('nav[aria-label="On-page navigation"]');
    await expect(toc).toBeVisible();
    await expect(toc.getByRole("link").first()).toBeVisible();
    await expect(toc.getByRole("link", { name: /Preamble/i })).toBeVisible();
  });
});
