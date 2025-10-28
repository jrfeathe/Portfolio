#!/usr/bin/env node

const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");

const REPO_ROOT = resolve(__dirname, "..", "..");
const COVERAGE_PATH = resolve(REPO_ROOT, "apps/site/coverage/coverage-summary.json");
const LEGACY_PATH = resolve(REPO_ROOT, "coverage/coverage-summary.json");

const THRESHOLDS = {
  lines: 0.9,
  statements: 0.9,
  branches: 0.8,
  functions: 0.9
};

const args = new Set(process.argv.slice(2));
const REPORT_ONLY = args.has("--report");
const MARKDOWN = args.has("--markdown");

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function readCoverageSummary() {
  let path = COVERAGE_PATH;

  if (!existsSync(path) && existsSync(LEGACY_PATH)) {
    path = LEGACY_PATH;
  }

  if (!existsSync(path)) {
    throw new Error(
      `Coverage summary not found. Expected ${COVERAGE_PATH} or ${LEGACY_PATH}. Run tests with coverage first.`
    );
  }

  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);

  if (!data.total) {
    throw new Error("Coverage summary missing 'total' bucket.");
  }

  return data.total;
}

function toScore(metric) {
  return typeof metric?.pct === "number" ? metric.pct / 100 : 0;
}

function renderTable(results) {
  const header = ["Metric", "Target", "Actual", "Status"];
  const rows = results.map((result) => [
    result.metric,
    formatPercent(result.target * 100),
    formatPercent(result.actual * 100),
    result.passed ? "pass" : "fail"
  ]);

  const allRows = [header, ...rows];
  const columnWidths = header.map((_, index) =>
    Math.max(...allRows.map((row) => row[index].length))
  );

  const lines = allRows.map((row) =>
    row
      .map((cell, index) => cell.padEnd(columnWidths[index]))
      .join("  ")
  );

  if (MARKDOWN) {
    const markdownLines = [
      "| Metric | Target | Actual | Status |",
      "| --- | --- | --- | --- |",
      ...rows.map(
        (row) =>
          `| ${row[0]} | ${row[1]} | ${row[2]} | ${
            row[3] === "pass" ? "✅ Pass" : "❌ Fail"
          } |`
      )
    ];
    return markdownLines.join("\n");
  }

  return lines.join("\n");
}

function main() {
  try {
    const totals = readCoverageSummary();
    const results = Object.entries(THRESHOLDS).map(([metric, target]) => {
      const actual = toScore(totals[metric]);
      return {
        metric,
        target,
        actual,
        passed: actual >= target
      };
    });

    const table = renderTable(results);

    if (MARKDOWN) {
      console.log(table);
    } else {
      console.log("Coverage Quality Gate\n");
      console.log(table);
    }

    const failures = results.filter((result) => !result.passed);

    if (failures.length) {
      console.error(
        `\nCoverage check failed for: ${failures
          .map((failure) => failure.metric)
          .join(", ")}`
      );
      if (!REPORT_ONLY) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`Coverage check failed: ${error.message}`);
    if (!REPORT_ONLY) {
      process.exit(1);
    }
  }
}

main();
