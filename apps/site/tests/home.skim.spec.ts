import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Recruiter skim mode", () => {
  test("flags skim mode via query param without regressing hero content", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en");

    await expect(page.getByRole("heading", { name: "Jack Featherstone", level: 1 })).toBeVisible();
    await expect(page.locator("[data-skim-mode=\"true\"]")).toHaveCount(0);

    await page.goto("/en?skim=1");

    const skimContainer = page.locator("[data-skim-mode=\"true\"]");
    await expect(skimContainer).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Jack Featherstone", level: 1 })).toBeVisible();

    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View experience" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a short intro" })).toBeVisible();

    const accessibilityScan = await new AxeBuilder({ page })
      .include("main")
      .analyze();

    expect(accessibilityScan.violations).toEqual([]);
  });
});
