#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_ROOT = resolve(__dirname, "..", "..");
const OUTPUT_DIR = resolve(REPO_ROOT, "apps/site/.lhci");
const MANIFEST_PATH = resolve(OUTPUT_DIR, "manifest.json");
const REPORT_PATH = resolve(OUTPUT_DIR, "report.json");
const BADGE_PATH = resolve(OUTPUT_DIR, "badge.json");
const BUDGET_PATH = resolve(REPO_ROOT, "performance-budgets.json");
const CATEGORY_KEYS = [
  "performance",
  "accessibility",
  "best-practices",
  "seo"
];

function readBudgets() {
  if (!existsSync(BUDGET_PATH)) {
    return [];
  }

  try {
    const raw = JSON.parse(readFileSync(BUDGET_PATH, "utf8"));
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        typeof entry.path === "string" &&
        entry.path.length > 0
    );
  } catch (error) {
    console.warn(
      `Unable to read ${BUDGET_PATH} while building Lighthouse summary: ${error.message}`
    );
    return [];
  }
}

function groupRunsByPath(runs) {
  const map = new Map();

  for (const run of runs) {
    const target = run.finalUrl || run.requestedUrl;

    if (!target) {
      continue;
    }

    try {
      const url = new URL(target);
      const key = url.pathname + (url.search || "");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(run);
    } catch {
      continue;
    }
  }

  return map;
}

function average(values) {
  if (!values.length) {
    return null;
  }
  const total = values.reduce((acc, value) => acc + value, 0);
  return total / values.length;
}

function toKilobytes(bytes) {
  return bytes / 1024;
}

function formatNumber(value, digits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(digits));
}

function collectResourceValue(run, resourceType) {
  if (!Array.isArray(run.resources)) {
    return null;
  }

  const match = run.resources.find(
    (item) => item.resourceType === resourceType
  );

  if (!match) {
    return null;
  }

  const candidate =
    typeof match.transferSize === "number"
      ? match.transferSize
      : typeof match.size === "number"
      ? match.size
      : null;

  if (typeof candidate !== "number") {
    return null;
  }

  return toKilobytes(candidate);
}

function collectMetricValue(run, metricId) {
  const value = run.metrics?.[metricId];
  return typeof value === "number" ? value : null;
}

function evaluateResourceBudgets(runs, definitions) {
  return definitions.map((definition) => {
    const samples = runs
      .map((run) => collectResourceValue(run, definition.resourceType))
      .filter((value) => typeof value === "number");

    const actual = formatNumber(average(samples));
    const status =
      actual == null
        ? "unknown"
        : actual <= definition.budget
        ? "pass"
        : "fail";

    return {
      resourceType: definition.resourceType,
      budget: definition.budget,
      unit: "KB",
      actual,
      status
    };
  });
}

function resolveTimingUnit(metric) {
  if (
    metric === "cumulative-layout-shift" ||
    metric === "speed-index" ||
    metric === "interactive"
  ) {
    return metric === "cumulative-layout-shift" ? "" : "ms";
  }
  return metric.endsWith("-paint") || metric.endsWith("-time") ? "ms" : "";
}

function evaluateMetricBudgets(runs, definitions, unitResolver, digits = 1) {
  return definitions.map((definition) => {
    const samples = runs
      .map((run) => collectMetricValue(run, definition.metric))
      .filter((value) => typeof value === "number");

    const actual = formatNumber(average(samples), digits);
    const status =
      actual == null
        ? "unknown"
        : actual <= definition.budget
        ? "pass"
        : "fail";

    return {
      metric: definition.metric,
      budget: definition.budget,
      unit: unitResolver(definition.metric),
      actual,
      status
    };
  });
}

function summarizeStatuses(collections, hasRuns) {
  if (!hasRuns) {
    return "missing";
  }

  const flattened = collections.flat();

  if (flattened.some((entry) => entry.status === "fail")) {
    return "fail";
  }

  if (flattened.some((entry) => entry.status === "unknown")) {
    return "unknown";
  }

  return "pass";
}

function computeBudgetReport(definitions, runsByPath) {
  if (!definitions.length) {
    return undefined;
  }

  const report = {};

  for (const definition of definitions) {
    const runs = runsByPath.get(definition.path) ?? [];
    const hasRuns = runs.length > 0;

    const resourceSizes = Array.isArray(definition.resourceSizes)
      ? evaluateResourceBudgets(runs, definition.resourceSizes)
      : [];
    const timings = Array.isArray(definition.timings)
      ? evaluateMetricBudgets(runs, definition.timings, resolveTimingUnit)
      : [];
    const metrics = Array.isArray(definition.metrics)
      ? evaluateMetricBudgets(runs, definition.metrics, () => "", 2)
      : [];

    report[definition.path] = {
      status: summarizeStatuses([resourceSizes, timings, metrics], hasRuns),
      runs: runs.length,
      resourceSizes,
      timings,
      metrics
    };
  }

  return report;
}

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
    scores,
    metrics: {
      "first-contentful-paint":
        raw.audits?.["first-contentful-paint"]?.numericValue ?? null,
      "largest-contentful-paint":
        raw.audits?.["largest-contentful-paint"]?.numericValue ?? null,
      "cumulative-layout-shift":
        raw.audits?.["cumulative-layout-shift"]?.numericValue ?? null,
      "total-blocking-time":
        raw.audits?.["total-blocking-time"]?.numericValue ?? null,
      interactive: raw.audits?.interactive?.numericValue ?? null,
      "speed-index": raw.audits?.["speed-index"]?.numericValue ?? null
    },
    resources: Array.isArray(
      raw.audits?.["resource-summary"]?.details?.items
    )
      ? raw.audits["resource-summary"].details.items.map((item) => ({
          resourceType: item.resourceType,
          transferSize: item.transferSize ?? null,
          size: item.size ?? null
        }))
      : []
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
  const budgets = readBudgets();
  const budgetReport = computeBudgetReport(budgets, groupRunsByPath(runs));

  const report = {
    requestedUrl: runs[0]?.requestedUrl ?? null,
    finalUrl: runs[0]?.finalUrl ?? null,
    generatedAt: new Date().toISOString(),
    averages,
    runs,
    budgets: budgetReport
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  writeFileSync(BADGE_PATH, JSON.stringify(buildBadge(averages), null, 2));

  if (budgetReport) {
    const failing = Object.entries(budgetReport).filter(
      ([, value]) => value.status === "fail"
    );
    const missing = Object.entries(budgetReport).filter(
      ([, value]) => value.status === "missing"
    );

    if (failing.length > 0) {
      console.warn(
        "Performance budgets failed for:\n" +
          failing
            .map(
              ([path, value]) =>
                `  • ${path} (runs=${value.runs})`
            )
            .join("\n")
      );
    }

    if (missing.length > 0) {
      console.warn(
        "No Lighthouse runs matched these budget paths:\n" +
          missing.map(([path]) => `  • ${path}`).join("\n")
      );
    }
  }

  console.log(`Wrote Lighthouse summary to ${REPORT_PATH} and badge to ${BADGE_PATH}`);
}

if (require.main === module) {
  runSummarize();
} else {
  module.exports = runSummarize;
}
