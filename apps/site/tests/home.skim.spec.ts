import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Recruiter skim mode", () => {
  test("flags skim mode via query param without regressing hero content", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en");

    await expect(page.getByRole("heading", { name: "Portfolio", level: 1 })).toBeVisible();
    await expect(page.locator("[data-skim-mode=\"true\"]")).toHaveCount(0);

    await page.goto("/en?skim=1");

    const skimContainer = page.locator("[data-skim-mode=\"true\"]");
    await expect(skimContainer).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Portfolio", level: 1 })).toBeVisible();

    await expect(page.getByRole("button", { name: "View case studies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Book a 20-minute intro" })).toBeVisible();

    const accessibilityScan = await new AxeBuilder({ page })
      .include("main")
      .analyze();

    expect(accessibilityScan.violations).toEqual([]);
  });
});
