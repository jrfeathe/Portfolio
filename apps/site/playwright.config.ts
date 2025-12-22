import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";
const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
let parsedBaseURL: URL | undefined;
try {
  parsedBaseURL = explicitBaseURL ? new URL(explicitBaseURL) : undefined;
} catch {
  parsedBaseURL = undefined;
}
const resolvedPort = process.env.PLAYWRIGHT_PORT ?? parsedBaseURL?.port;
const serverPort = Number(resolvedPort || "3001");
const baseURL = explicitBaseURL ?? `http://127.0.0.1:${serverPort}`;
const workerCount = Number(process.env.PLAYWRIGHT_WORKERS ?? "1");
const webServerCommand =
  process.env.PLAYWRIGHT_WEBSERVER_COMMAND ??
  `pnpm exec next start --hostname 127.0.0.1 --port ${serverPort}`;

const htmlReportDir = process.env.PLAYWRIGHT_HTML_REPORT ?? "playwright-report";
const blobReportDir = process.env.PLAYWRIGHT_BLOB_REPORT ?? "blob-report";
const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: workerCount > 1 && !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: workerCount,
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
    baseURL,
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
        url: baseURL,
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
