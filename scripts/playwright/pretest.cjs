#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

if (process.env.PLAYWRIGHT_SKIP_BUILD === "1") {
  console.log("[playwright] Skipping Next.js build (PLAYWRIGHT_SKIP_BUILD=1).");
  process.exit(0);
}

console.log("[playwright] Building Next.js app before tests…");

execFileSync("pnpm", ["run", "build"], {
  stdio: "inherit"
});
