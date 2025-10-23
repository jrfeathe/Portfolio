#!/usr/bin/env node

// Synchronize GitHub labels to match the WBS definitions plus shared workflow labels.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

const repo =
  process.env.GITHUB_REPOSITORY ??
  process.argv[2] ??
  (() => {
    console.error(
      "Missing repository. Provide GITHUB_REPOSITORY=owner/repo or pass it as the first argument."
    );
    process.exit(1);
  })();

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("GITHUB_TOKEN is required with `repo` scope to manage labels.");
  process.exit(1);
}

const wbsPath = path.join(process.cwd(), "WBS", "Essential_WBS.csv");

if (!fs.existsSync(wbsPath)) {
  console.error(`Unable to locate WBS at ${wbsPath}`);
  process.exit(1);
}

const csv = fs.readFileSync(wbsPath, "utf8");

function parseCsv(text) {
  const rows = [];
  let current = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      current.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      current.push(value.trim());
      value = "";
      if (current.length) {
        rows.push(current);
      }
      current = [];
    } else {
      value += char;
    }
  }

  if (value.length || current.length) {
    current.push(value.trim());
    rows.push(current);
  }

  return rows;
}

const [header, ...rest] = parseCsv(csv);

function colorForId(id) {
  return crypto.createHash("md5").update(id).digest("hex").slice(0, 6);
}

function toLabel(row) {
  const [id, epic, task] = row;
  if (!id || id === "ID") {
    return null;
  }

  return {
    name: `WBS:${id}`,
    color: colorForId(id),
    description: `${epic} – ${task}`.slice(0, 100),
  };
}

const wbsLabels = rest.map(toLabel).filter(Boolean);

const workflowLabels = [
  {
    name: "type:feature",
    color: "1FA6FF",
    description: "Net-new functionality scoped to a WBS item.",
  },
  {
    name: "type:bug",
    color: "D73A4A",
    description: "Defects found in production or pre-production.",
  },
  {
    name: "type:tech-debt",
    color: "8E44AD",
    description: "Maintenance work to reduce friction or risk.",
  },
  {
    name: "status:triage",
    color: "FBCA04",
    description: "Needs triage before prioritization.",
  },
];

const labels = [...workflowLabels, ...wbsLabels];

async function upsertLabel(label) {
  const apiBase = `https://api.github.com/repos/${repo}/labels`;
  const updateUrl = `${apiBase}/${encodeURIComponent(label.name)}`;

  const common = {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "wbs-label-sync",
    },
    body: JSON.stringify(label),
  };

  const update = await fetch(updateUrl, { method: "PATCH", ...common });

  if (update.status === 404) {
    const create = await fetch(apiBase, { method: "POST", ...common });
    if (!create.ok) {
      throw new Error(
        `Failed to create label ${label.name}: ${create.status} ${await create.text()}`
      );
    }
    console.log(`Created label ${label.name}`);
    return;
  }

  if (!update.ok) {
    throw new Error(
      `Failed to update label ${label.name}: ${update.status} ${await update.text()}`
    );
  }

  console.log(`Updated label ${label.name}`);
}

const run = async () => {
  for (const label of labels) {
    await upsertLabel(label);
  }
  console.log(`Synchronized ${labels.length} labels for ${repo}.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
