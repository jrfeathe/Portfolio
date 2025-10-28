import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Engineering notes flow", () => {
  test("lists published notes and renders detail with table of contents", async ({ page }) => {
    await page.goto("/en/notes");

    const noteLink = page.getByRole("link", { name: /MDX pipeline game plan/i });
    await expect(noteLink).toBeVisible();

    const indexA11y = await new AxeBuilder({ page })
      .include("main")
      .analyze();
    expect(indexA11y.violations).toEqual([]);

    await noteLink.click();
    await expect(page).toHaveURL(/\/en\/notes\/mdx-pipeline$/);

    await expect(page.getByRole("link", { name: /Back to notes/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /MDX pipeline game plan/i })).toBeVisible();

    const toc = page.locator('nav[aria-label="On this page"]');
    await expect(toc).toBeVisible();
    await expect(toc.getByRole("link").first()).toBeVisible();

    const detailA11y = await new AxeBuilder({ page })
      .include("article")
      .analyze();
    expect(detailA11y.violations).toEqual([]);
  });
});
