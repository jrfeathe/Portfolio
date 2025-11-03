#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { existsSync, readFileSync, rmSync } = require("node:fs");
const { join, resolve } = require("node:path");

const { getRouteRegex } = require("next/dist/shared/lib/router/utils/route-regex");
const { getRouteMatcher } = require("next/dist/shared/lib/router/utils/route-matcher");

const REPO_ROOT = resolve(__dirname, "..", "..");
const SITE_DIR = resolve(REPO_ROOT, "apps/site");
const DIST_DIR = resolve(SITE_DIR, ".next");
const BUDGET_PATH = resolve(REPO_ROOT, "performance-budgets.json");
const BUNDLE_MANIFEST_NAME = "performance-bundle-manifest.json";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON from ${path}: ${error.message}`);
  }
}

function loadBundleBudgets() {
  if (!existsSync(BUDGET_PATH)) {
    throw new Error(`Missing performance budgets file at ${BUDGET_PATH}`);
  }

  const raw = readJson(BUDGET_PATH);

  if (!Array.isArray(raw)) {
    throw new Error("performance-budgets.json must export an array");
  }

  const bundles = new Map();

  for (const entry of raw) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof entry.path !== "string" ||
      !entry.path.startsWith("/")
    ) {
      continue;
    }

    const limit = entry.bundle && entry.bundle.firstLoadJs;

    if (typeof limit === "number" && Number.isFinite(limit)) {
      bundles.set(entry.path, {
        limit,
        raw: entry
      });
    }
  }

  return bundles;
}

function runNextBuild() {
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true, force: true });
  }

  execFileSync(
    "pnpm",
    ["exec", "next", "build", "--no-lint"],
    {
      cwd: SITE_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1",
        NODE_ENV: "production",
        PERF_BUDGETS: "1"
      }
    }
  );
}

function loadBundleManifest() {
  const manifestPath = join(DIST_DIR, BUNDLE_MANIFEST_NAME);

  if (!existsSync(manifestPath)) {
    throw new Error(
      `Missing ${manifestPath}. Ensure Next.js emitted the performance bundle manifest.`
    );
  }

  const manifest = readJson(manifestPath);

  if (
    !manifest ||
    typeof manifest !== "object" ||
    !Array.isArray(manifest.routes)
  ) {
    throw new Error(
      `${BUNDLE_MANIFEST_NAME} is malformed. Expected a \`routes\` array.`
    );
  }

  return manifest.routes
    .map((entry) => {
      if (!entry || typeof entry.route !== "string") {
        return null;
      }

      const kilobytes =
        typeof entry.totalKilobytes === "number"
          ? entry.totalKilobytes
          : typeof entry.totalBytes === "number"
          ? Number((entry.totalBytes / 1024).toFixed(2))
          : null;

      if (kilobytes == null) {
        return null;
      }

      return {
        route: entry.route,
        files: Array.isArray(entry.files) ? entry.files : [],
        kilobytes,
        matcher: getRouteMatcher(getRouteRegex(entry.route))
      };
    })
    .filter(Boolean);
}

function formatRow(row) {
  const route = row.route.padEnd(28, " ");
  const budget = row.budget.toFixed(1).padStart(10, " ");
  const actual = row.actual.toFixed(1).padStart(12, " ");
  const status = row.status.toUpperCase();
  return `${route} | ${budget} | ${actual} | ${status}`;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const skipBuild = args.has("--skip-build");

  const bundleBudgets = loadBundleBudgets();

  if (bundleBudgets.size === 0) {
    console.warn("No bundle budgets defined in performance-budgets.json; nothing to enforce.");
    return;
  }

  if (!skipBuild) {
    runNextBuild();
  }

  const manifestEntries = loadBundleManifest();

  const results = [];
  let hasFailure = false;

  for (const [budgetPath, { limit }] of bundleBudgets.entries()) {
    const entry = manifestEntries.find((candidate) => {
      const match = candidate.matcher(budgetPath);
      return match !== false;
    });

    if (!entry) {
      console.warn(
        `No performance bundle manifest entry matched route "${budgetPath}". Skipping.`
      );
      continue;
    }

    const actual = entry.kilobytes;
    const status = actual <= limit ? "pass" : "fail";

    if (status === "fail") {
      hasFailure = true;
    }

    results.push({
      route: entry.route,
      budget: limit,
      actual,
      status
    });
  }

  if (results.length === 0) {
    console.warn("No routes were evaluated for bundle budgets.");
    return;
  }

  console.log("Route                        |  Budget KB |  Actual KB | Status");
  console.log("----------------------------------------------------------------");
  for (const row of results) {
    console.log(formatRow(row));
  }

  if (hasFailure) {
    throw new Error("Bundle budgets exceeded. See rows marked FAIL above.");
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
