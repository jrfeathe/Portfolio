import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";
const webServerCommand =
  process.env.PLAYWRIGHT_WEBSERVER_COMMAND ??
  "pnpm exec next start --hostname 127.0.0.1 --port 3000";

const htmlReportDir = process.env.PLAYWRIGHT_HTML_REPORT ?? "playwright-report";
const blobReportDir = process.env.PLAYWRIGHT_BLOB_REPORT ?? "blob-report";
const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: htmlReportDir, open: "never" }],
    ["blob", { outputDir: blobReportDir }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    actionTimeout: 10_000
  },
  outputDir,
  webServer: skipWebServer
    ? undefined
    : {
        command: webServerCommand,
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe"
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
