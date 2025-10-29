import { test } from "@playwright/test";

test.describe("Trade-off explorer", () => {
  test.fixme(
    "adjusting scenario sliders updates comparison outputs",
    async ({ page }) => {
      await page.goto("/en/tradeoffs");
    }
  );
});
