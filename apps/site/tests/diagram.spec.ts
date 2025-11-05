import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SANITIZED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text x="0" y="5">PlantUML</text></svg>`;

test.describe("Diagram rendering", () => {
  test("proxies PlantUML diagrams without leaking unsafe markup", async ({ page }) => {
    test.setTimeout(90_000);

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

    const diagramRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/plantuml") && request.method() === "POST",
      { timeout: 60_000 }
    );
    const diagramResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/plantuml") && response.status() === 200,
      { timeout: 60_000 }
    );

    await page.goto("/en/notes/mdx-pipeline");
    await diagramRequest;
    await diagramResponse;
    await page.waitForLoadState("networkidle");

    const diagram = page.locator('[aria-label="PlantUML diagram"]');
    await expect(diagram).toBeVisible({ timeout: 45_000 });
    const diagramMarkup = await diagram.innerHTML();

    expect(diagramMarkup).toContain("PlantUML");
    expect(diagramMarkup).not.toContain("<script");

    const accessibilityScan = await new AxeBuilder({ page })
      .include('[aria-label="PlantUML diagram"]')
      .analyze();
    expect(accessibilityScan.violations).toEqual([]);
  });
});
