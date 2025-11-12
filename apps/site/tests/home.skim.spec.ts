import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Recruiter skim mode", () => {
  test("flags skim mode via query param without regressing hero content", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en");

    await expect(page.getByRole("heading", { name: "Jack Featherstone", level: 1 })).toBeVisible();
    await expect(page.getByRole("img", { name: "Portrait of Jack Featherstone standing under warm light." })).toBeVisible();
    await expect(page.locator("[data-skim-mode=\"true\"]")).toHaveCount(0);

    const themeDark = page.getByRole("radio", { name: "Dark" });
    await themeDark.click();
    await expect(themeDark).toHaveAttribute("aria-checked", "true");

    const contrastHigh = page.getByRole("radio", { name: "High" });
    await contrastHigh.click();
    await expect(contrastHigh).toHaveAttribute("aria-checked", "true");

    await expect(page.getByRole("radio", { name: /English/ })).toHaveAttribute("aria-checked", "true");

    const skimToggle = page.getByTestId("skim-toggle");
    await skimToggle.click();
    await expect(page).toHaveURL(/skim=1/);

    await page.goto("/en?skim=1");

    const skimContainer = page.locator("[data-skim-mode=\"true\"]");
    await expect(skimContainer).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Jack Featherstone", level: 1 })).toBeVisible();

    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View experience" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a short intro" })).toBeVisible();
    await expect(page.getByRole("link", { name: /React/ })).toBeVisible();

    const accessibilityScan = await new AxeBuilder({ page })
      .include("main")
      .analyze();

    expect(accessibilityScan.violations).toEqual([]);
  });
});
