import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SANITIZED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text x="0" y="5">PlantUML</text></svg>`;

test.describe("Diagram rendering", () => {
  test("proxies PlantUML diagrams without leaking unsafe markup", async ({ page }) => {
    await page.route("**/api/plantuml", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");

      const payload = JSON.parse(request.postData() ?? "{}");
      expect(payload.diagram).toContain("@startuml");

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none';",
          "Cache-Control": "public, max-age=0, s-maxage=21600"
        },
        body: SANITIZED_SVG
      });
    });

    await page.goto("/en/notes/mdx-pipeline");

    const diagram = page.locator('[aria-label="PlantUML diagram"]');
    await expect(diagram).toBeVisible();
    const diagramMarkup = await diagram.innerHTML();

    expect(diagramMarkup).toContain("PlantUML");
    expect(diagramMarkup).not.toContain("<script");

    const accessibilityScan = await new AxeBuilder({ page })
      .include('[aria-label="PlantUML diagram"]')
      .analyze();
    expect(accessibilityScan.violations).toEqual([]);
  });
});
