import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";
const webServerCommand =
  process.env.PLAYWRIGHT_WEBSERVER_COMMAND ??
  "pnpm exec next start --hostname 127.0.0.1 --port 3000";


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
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["blob", { outputDir: "blob-report" }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    actionTimeout: 10_000
  },
  outputDir: "test-results",
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
