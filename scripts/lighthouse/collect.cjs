#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { existsSync, mkdirSync, readFileSync, rmSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_ROOT = resolve(__dirname, "..", "..");
const OUTPUT_DIR = resolve(REPO_ROOT, "apps/site/.lhci");
const BUDGET_PATH = resolve(REPO_ROOT, "performance-budgets.json");

function ensurePreviewUrl(value) {
  if (!value) {
    console.error("PREVIEW_URL must be provided as env or first arg.");
    process.exit(1);
  }
  return value;
}

function loadBudgetPaths() {
  if (!existsSync(BUDGET_PATH)) {
    return [];
  }

  try {
    const raw = JSON.parse(readFileSync(BUDGET_PATH, "utf8"));
    if (!Array.isArray(raw)) {
      return [];
    }

    const seen = new Set();
    for (const entry of raw) {
      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.path === "string" &&
        entry.path.startsWith("/")
      ) {
        seen.add(entry.path);
      }
    }
    return Array.from(seen);
  } catch (error) {
    console.warn(
      `Unable to read ${BUDGET_PATH} for additional Lighthouse paths: ${error.message}`
    );
    return [];
  }
}

function runCollect(previewUrl) {
  const url = ensurePreviewUrl(previewUrl);

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const urls = new Set([url]);
  const budgetPaths = loadBudgetPaths();

  if (budgetPaths.length > 0) {
    const base = new URL(url);
    const origin = `${base.protocol}//${base.host}`;

    for (const path of budgetPaths) {
      const resolved = new URL(path, origin).toString();
      urls.add(resolved);
    }
  }

  const cliArgs = [
    "exec",
    "lhci",
    "autorun",
    "--config=.lighthouserc.json",
    ...Array.from(urls).map((value) => `--collect.url=${value}`)
  ];

  console.log(
    `Running Lighthouse CI for ${urls.size} URL(s):\n${Array.from(urls)
      .map((value) => `  • ${value}`)
      .join("\n")}`
  );

  execFileSync(
    "pnpm",
    cliArgs,
    {
      cwd: REPO_ROOT,
      env: { ...process.env, PREVIEW_URL: url },
      stdio: "inherit"
    }
  );
}

if (require.main === module) {
  runCollect(process.env.PREVIEW_URL || process.argv[2]);
} else {
  module.exports = runCollect;
}
