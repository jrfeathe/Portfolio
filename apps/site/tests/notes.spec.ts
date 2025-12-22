import { test, expect } from "@playwright/test";

test.describe.skip("Engineering notes flow (pending single-page writeup)", () => {
  test("lists published notes and renders detail with table of contents", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/en/notes", { waitUntil: "domcontentloaded" });

    const noteLink = page.getByRole("link", { name: /MDX pipeline game plan/i });
    await expect(noteLink).toBeVisible();

    await page.goto("/en/notes/mdx-pipeline", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: /Back to notes/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /MDX pipeline game plan/i })).toBeVisible();

    const toc = page.locator('nav[aria-label="On this page"]');
    await expect(toc).toBeVisible();
    await expect(toc.getByRole("link").first()).toBeVisible();

  });
});
