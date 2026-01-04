import path from "node:path";

import { test } from "@playwright/test";

const locales = ["en", "ja", "zh"] as const;

const pages = [
  { name: "home", buildPath: (locale: string) => `/${locale}` },
  { name: "experience", buildPath: (locale: string) => `/${locale}/experience` },
  { name: "meetings", buildPath: (locale: string) => `/${locale}/meetings` },
  { name: "skim", buildPath: (locale: string) => `/${locale}?skim=1` }
] as const;

const screenshotsDir = path.resolve(__dirname, "../../../WBS");

test.describe("localization QA screenshots", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const locale of locales) {
    for (const page of pages) {
      test(`${page.name} (${locale})`, async ({ page: browserPage }) => {
        await browserPage.goto(page.buildPath(locale), { waitUntil: "networkidle" });
        await browserPage.waitForSelector("main");

        const filename = `Task_F4.2_${page.name}_${locale}.png`;
        const outputPath = path.join(screenshotsDir, filename);

        await browserPage.screenshot({ path: outputPath, fullPage: true });
      });
    }
  }
});
