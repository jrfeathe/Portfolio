#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { mkdirSync, rmSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_ROOT = resolve(__dirname, "..", "..");
const OUTPUT_DIR = resolve(REPO_ROOT, "apps/site/.lhci");

function ensurePreviewUrl(value) {
  if (!value) {
    console.error("PREVIEW_URL must be provided as env or first arg.");
    process.exit(1);
  }
  return value;
}

function runCollect(previewUrl) {
  const url = ensurePreviewUrl(previewUrl);

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  execFileSync(
    "pnpm",
    [
      "exec",
      "lhci",
      "autorun",
      "--config=.lighthouserc.json",
      `--collect.url=${url}`
    ],
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
