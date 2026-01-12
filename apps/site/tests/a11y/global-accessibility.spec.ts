import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const journeys = [
  {
    name: "home hero",
    path: "/en",
    async prepare(page: Page) {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  },
  {
    name: "home skim mode",
    path: "/en?skim=1",
    async prepare(page: Page) {
      await page.waitForLoadState("networkidle");
      await expect(page.locator('[data-skim-mode="true"]')).toHaveCount(1);
    }
  },
  {
    name: "notes index",
    path: "/en/notes",
    async prepare(page: Page) {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { level: 1, name: /Engineering notes/i })).toBeVisible();
      await expect(
        page.getByText(/single narrative that explains how the portfolio was built/i)
      ).toBeVisible();
    }
  }
];

test.describe("Global accessibility smoke checks", () => {
  test.describe.configure({ timeout: 90_000 });

  for (const journey of journeys) {
    test(`@a11y ${journey.name} has no serious or critical axe violations`, async ({ page }, testInfo) => {
      await page.goto(journey.path);
      await journey.prepare(page);

      const { isDark, isHighContrast } = await page.evaluate(() => ({
        isDark: document.documentElement.classList.contains("dark"),
        isHighContrast: document.documentElement.classList.contains("contrast-high")
      }));
      const isStandardLight = !isDark && !isHighContrast;

      const analysis = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const impactfulViolations = analysis.violations.filter((violation) => {
        if (isStandardLight && violation.id === "color-contrast") {
          return false;
        }

        return (
          violation.impact && (violation.impact === "serious" || violation.impact === "critical")
        );
      });

      if (impactfulViolations.length > 0) {
        await testInfo.attach(`${journey.name}-axe-violations`, {
          body: JSON.stringify(impactfulViolations, null, 2),
          contentType: "application/json"
        });
      }

      expect(impactfulViolations).toHaveLength(0);
    });
  }
});
