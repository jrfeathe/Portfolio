import { expect, test } from "@playwright/test";

test.describe("Accessibility preference handling", () => {
  test("@a11y disables transitions when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");

    const ctaButton = page.getByRole("link", { name: "View case studies" });
    const transitionDuration = await ctaButton.evaluate((element) => {
      const value = getComputedStyle(element).transitionDuration;
      const numeric = parseFloat(value);
      return Number.isNaN(numeric) ? value : numeric;
    });

    expect(transitionDuration).toBe(0);
  });

  test("@a11y exposes a high-contrast focus ring", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en");

    const ctaButton = page.getByRole("link", { name: "View case studies" });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.keyboard.press("Tab");
      const isActive = await ctaButton.evaluate(
        (element) => document.activeElement === element
      );
      if (isActive) {
        break;
      }
    }

    const isButtonActive = await ctaButton.evaluate(
      (element) => document.activeElement === element
    );
    expect(isButtonActive).toBeTruthy();

    const { outlineWidth, outlineStyle } = await ctaButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle
      };
    });

    expect(outlineStyle).not.toBe("none");
    expect(outlineStyle).not.toBe("hidden");
    expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  test("@a11y manual theme toggle overrides system preference", async ({ page, context }) => {
    await context.clearCookies();
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en");

    const themeToggle = page.getByTestId("theme-toggle");

    const initialClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(initialClass).toBeFalsy();

    // Cycle: system -> dark
    await themeToggle.click();
    let datasetTheme = await page.evaluate(
      () => document.documentElement.dataset.theme
    );
    expect(datasetTheme).toBe("dark");

    // Cycle: dark -> light
    await themeToggle.click();
    datasetTheme = await page.evaluate(
      () => document.documentElement.dataset.theme
    );
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(datasetTheme).toBe("light");
    expect(hasDarkClass).toBeFalsy();

    const cookies = await context.cookies();
    const themeCookie = cookies.find((cookie) => cookie.name === "portfolio-theme");
    expect(themeCookie?.value).toBe("light");
  });

  test("@a11y manual contrast toggle overrides system preference", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/en");

    const contrastToggle = page.getByTestId("contrast-toggle");

    const initialContrast = await page.evaluate(
      () => document.documentElement.dataset.contrast
    );
    expect(initialContrast === undefined || initialContrast === "system").toBeTruthy();

    // Cycle: system -> high
    await contrastToggle.click();
    let datasetContrast = await page.evaluate(
      () => document.documentElement.dataset.contrast
    );
    let hasContrastClass = await page.evaluate(() =>
      document.documentElement.classList.contains("contrast-high")
    );
    expect(datasetContrast).toBe("high");
    expect(hasContrastClass).toBeTruthy();

    // Cycle: high -> standard
    await contrastToggle.click();
    datasetContrast = await page.evaluate(
      () => document.documentElement.dataset.contrast
    );
    hasContrastClass = await page.evaluate(() =>
      document.documentElement.classList.contains("contrast-high")
    );
    expect(datasetContrast).toBe("standard");
    expect(hasContrastClass).toBeFalsy();

    const cookies = await context.cookies();
    const contrastCookie = cookies.find((cookie) => cookie.name === "portfolio-contrast");
    expect(contrastCookie?.value).toBe("standard");
  });
});
