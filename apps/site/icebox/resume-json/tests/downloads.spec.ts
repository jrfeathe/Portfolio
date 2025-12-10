import { test, expect } from "@playwright/test";

test.describe("Resume downloads", () => {
  test("exposes sanitized resume JSON", async ({ request }) => {
    const response = await request.get("/resume.json");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/json");

    const payload = await response.json();

    expect(payload.version).toBeDefined();
    expect(payload.profile.name).toBe("Jack R. Featherstone");
    expect(payload.downloads.pdf).toBe("/resume.pdf");
    expect(payload.profile.sameAs).toEqual(
      expect.arrayContaining(["https://github.com/jrfeathe"])
    );
    expect(JSON.stringify(payload)).not.toContain("PLACEHOLDER");
  });

  test("serves printable resume PDF", async ({ request }) => {
    const response = await request.get("/resume.pdf");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/pdf");

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(20_000);
    expect(body.byteLength).toBeLessThan(262_144);
  });
});
