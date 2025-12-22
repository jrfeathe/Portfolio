import { test, expect } from "@playwright/test";

test.describe("Recruiter skim mode", () => {
  test("flags skim mode via query param without regressing hero content", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Jack Featherstone", level: 1 })).toBeVisible();
    await expect(page.getByRole("img", { name: "Portrait of Jack Featherstone standing under warm light." })).toBeVisible();
    await expect(page.locator("[data-skim-mode=\"true\"]")).toHaveCount(0);
    await expect(page.getByTestId("skim-toggle")).toBeVisible();

    await page.goto("/en?skim=1", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/skim=1/);

    const skimContainer = page.locator("[data-skim-mode=\"true\"]");
    await expect(skimContainer).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "AI-assisted Fullstack Engineer", level: 1 })).toBeVisible();

    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View experience" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a short intro" })).toBeVisible();
    await expect(page.getByRole("link", { name: /React/ })).toBeVisible();

  });
});
