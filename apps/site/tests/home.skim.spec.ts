import { test, expect } from "@playwright/test";

test.describe("Recruiter skim mode", () => {
  test("flags skim mode via query param without regressing hero content", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const heroPortrait = page.locator("[data-hero-portrait=\"true\"]");
    await expect(heroPortrait).toBeVisible();
    await expect(heroPortrait.locator("img")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-skim-mode", "false");
    await expect(page.locator('[data-testid="skim-toggle"]:visible')).toHaveCount(1);

    await page.goto("/en?skim=1", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/skim=1/);

    await expect(page.locator("html")).toHaveAttribute("data-skim-mode", "true");
    await expect(page.locator("[data-hero-portrait=\"true\"]:visible")).toHaveCount(0);

    const ctaContainer = page.locator(".shell-stacked-sidebar");
    await expect(ctaContainer).toBeVisible();
    const ctaLinks = await ctaContainer.getByRole("link").count();
    expect(ctaLinks).toBeGreaterThan(0);

  });
});
