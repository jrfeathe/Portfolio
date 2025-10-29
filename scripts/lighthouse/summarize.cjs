#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_ROOT = resolve(__dirname, "..", "..");
const OUTPUT_DIR = resolve(REPO_ROOT, "apps/site/.lhci");
const MANIFEST_PATH = resolve(OUTPUT_DIR, "manifest.json");
const REPORT_PATH = resolve(OUTPUT_DIR, "report.json");
const BADGE_PATH = resolve(OUTPUT_DIR, "badge.json");
const CATEGORY_KEYS = [
  "performance",
  "accessibility",
  "best-practices",
  "seo"
];

function readLhrScores(entry) {
  const lhrPath = resolve(OUTPUT_DIR, entry.jsonPath);
  const raw = JSON.parse(readFileSync(lhrPath, "utf8"));
  const scores = {};

  for (const key of CATEGORY_KEYS) {
    const category = raw.categories?.[key];
    if (category && typeof category.score === "number") {
      scores[key] = category.score;
    }
  }

  return {
    index: entry.runIndex ?? null,
    jsonPath: entry.jsonPath,
    requestedUrl: entry.requestedUrl,
    finalUrl: entry.finalUrl,
    fetchTime: raw.fetchTime,
    scores
  };
}

function toAverages(runs) {
  const totals = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, 0]));

  for (const run of runs) {
    for (const key of CATEGORY_KEYS) {
      totals[key] += run.scores[key] ?? 0;
    }
  }

  const divisor = runs.length || 1;
  const averages = {};

  for (const key of CATEGORY_KEYS) {
    averages[key] = Number((totals[key] / divisor).toFixed(4));
  }

  return averages;
}

function buildBadge(averages) {
  const badge = {};
  for (const key of CATEGORY_KEYS) {
    const value = averages[key] ?? 0;
    badge[key] = Math.round(value * 100);
  }
  return badge;
}

function runSummarize() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error("No manifest.json found in apps/site/.lhci. Run collect first.");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.error("Lighthouse manifest is empty.");
    process.exit(1);
  }

  const runs = manifest.map(readLhrScores);
  const averages = toAverages(runs);

  const report = {
    requestedUrl: runs[0]?.requestedUrl ?? null,
    finalUrl: runs[0]?.finalUrl ?? null,
    generatedAt: new Date().toISOString(),
    averages,
    runs
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  writeFileSync(BADGE_PATH, JSON.stringify(buildBadge(averages), null, 2));

  console.log(`Wrote Lighthouse summary to ${REPORT_PATH} and badge to ${BADGE_PATH}`);
}

if (require.main === module) {
  runSummarize();
} else {
  module.exports = runSummarize;
}
