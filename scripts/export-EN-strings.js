#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_OUTPUT = "apps/site/data/script-extracted_strings_en.md";
const DEFAULT_REJECTED_OUTPUT = "apps/site/data/script-skipped_strings_en.md";
const DEFAULT_DELTA_OUTPUT = "apps/site/data/script-extracted_strings_en_delta.md";
const DEFAULT_HASH_OUTPUT = "apps/site/data/script-extracted_strings_en_hashes.json";
const DEFAULT_CHUNK_DIR = "apps/site/data/localization_chunks";
const SOURCE_PROJECTS_DIR = "apps/site/data/projects";
const SOURCE_TECH_STACK = "apps/site/data/tech-stack-details.json";
const SOURCE_TIMEZONES = "apps/site/data/timezones.json";
const SOURCE_RESUME = "content/resume.json";
const SOURCE_DICTIONARIES = "apps/site/src/utils/dictionaries.ts";

const DICTIONARY_SKIP_KEYS = new Set([
  "id",
  "src",
  "assetId",
  "trackId",
  "blurDataURL"
]);

const DICTIONARY_SKIP_SUFFIXES = ["href", "url"];

function resolveRepoRoot() {
  return path.resolve(__dirname, "..");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const outputIndex = args.findIndex((arg) => arg === "--out" || arg === "--output");
  const outputPath =
    outputIndex !== -1 && args[outputIndex + 1]
      ? args[outputIndex + 1]
      : DEFAULT_OUTPUT;
  const rejectedIndex = args.findIndex(
    (arg) => arg === "--rejected" || arg === "--rejected-output"
  );
  const rejectedPath =
    rejectedIndex !== -1 && args[rejectedIndex + 1]
      ? args[rejectedIndex + 1]
      : DEFAULT_REJECTED_OUTPUT;
  const deltaIndex = args.findIndex((arg) => arg === "--delta" || arg === "--delta-output");
  const deltaPath =
    deltaIndex !== -1 && args[deltaIndex + 1]
      ? args[deltaIndex + 1]
      : DEFAULT_DELTA_OUTPUT;
  const hashIndex = args.findIndex((arg) => arg === "--hash" || arg === "--hash-output");
  const hashPath =
    hashIndex !== -1 && args[hashIndex + 1]
      ? args[hashIndex + 1]
      : DEFAULT_HASH_OUTPUT;
  const chunkSizeIndex = args.findIndex((arg) => arg === "--chunk-size");
  const chunkSize =
    chunkSizeIndex !== -1 && args[chunkSizeIndex + 1]
      ? Number(args[chunkSizeIndex + 1])
      : 0;
  const chunkDirIndex = args.findIndex((arg) => arg === "--chunk-dir");
  const chunkDir =
    chunkDirIndex !== -1 && args[chunkDirIndex + 1]
      ? args[chunkDirIndex + 1]
      : DEFAULT_CHUNK_DIR;

  return { outputPath, rejectedPath, deltaPath, hashPath, chunkSize, chunkDir };
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

function normalizeEnglish(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : "\"\"";
}

function normalizeRejected(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : "\"\"";
}

function hashEnglish(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function loadHashFile(filePath) {
  try {
    const payload = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(payload);
    if (data && typeof data === "object" && data.entries && typeof data.entries === "object") {
      return data;
    }
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { entries: {} };
    }
    throw error;
  }

  return { entries: {} };
}

function buildHashPayload(entries) {
  const mapped = {};
  entries.forEach(({ key, english }) => {
    mapped[key] = { english, hash: hashEnglish(english) };
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: mapped
  };
}

function sortEntriesByKey(entries) {
  return [...entries].sort((a, b) => a.key.localeCompare(b.key));
}

function buildDeltaState(entries, previous) {
  const previousEntries = previous?.entries ?? {};
  const currentMap = new Map(entries.map((entry) => [entry.key, entry.english]));
  const added = [];
  const changed = [];
  const removed = [];

  currentMap.forEach((english, key) => {
    const prevEntry = previousEntries[key];
    if (!prevEntry) {
      added.push({ key, english });
      return;
    }
    const currentHash = hashEnglish(english);
    if (prevEntry.hash !== currentHash) {
      changed.push({ key, english, previousEnglish: prevEntry.english });
    }
  });

  Object.entries(previousEntries).forEach(([key, prevEntry]) => {
    if (!currentMap.has(key)) {
      removed.push({ key, english: prevEntry.english });
    }
  });

  return {
    added: sortEntriesByKey(added),
    changed: sortEntriesByKey(changed),
    removed: sortEntriesByKey(removed)
  };
}

function addEntry(entries, seen, key, english) {
  const normalized = normalizeEnglish(english);
  if (!normalized) {
    return;
  }

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  entries.push({ key, english: normalized });
}

function addRejectedEntry(entries, seen, key, english, reason) {
  const summarized =
    typeof english === "string" && shouldSkipDictionaryValue(english)
      ? summarizeSkippedValue(english)
      : english;
  const normalized = normalizeRejected(summarized);
  if (!normalized) {
    return;
  }

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  entries.push({ key, english: normalized, reason });
}

function collectLocalizedStrings(
  value,
  pathPrefix,
  entries,
  seen,
  rejectedEntries,
  rejectedSeen
) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item && typeof item === "object") {
        collectLocalizedStrings(
          item,
          `${pathPrefix}[${index}]`,
          entries,
          seen,
          rejectedEntries,
          rejectedSeen
        );
      }
    });
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  if (typeof value.en === "string") {
    addEntry(entries, seen, pathPrefix, value.en);
    return;
  }

  if (Array.isArray(value.en)) {
    value.en.forEach((entry, index) => {
      addEntry(entries, seen, `${pathPrefix}[${index}]`, entry);
    });
    return;
  }

  Object.entries(value).forEach(([key, child]) => {
    const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    collectLocalizedStrings(child, nextPath, entries, seen, rejectedEntries, rejectedSeen);
  });
}

function collectStringValues(value, pathPrefix, entries, seen, rejectedEntries, rejectedSeen) {
  if (typeof value === "string") {
    addEntry(entries, seen, pathPrefix, value);
    return;
  }

  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringValues(
        item,
        `${pathPrefix}[${index}]`,
        entries,
        seen,
        rejectedEntries,
        rejectedSeen
      );
    });
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  Object.entries(value).forEach(([key, child]) => {
    const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    collectStringValues(child, nextPath, entries, seen, rejectedEntries, rejectedSeen);
  });
}

function shouldSkipDictionaryKey(key) {
  if (DICTIONARY_SKIP_KEYS.has(key)) {
    return true;
  }

  const lowered = key.toLowerCase();
  return DICTIONARY_SKIP_SUFFIXES.some((suffix) => lowered.endsWith(suffix));
}

function shouldSkipDictionaryValue(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function summarizeSkippedValue(value) {
  if (!value.startsWith("data:image/")) {
    return value;
  }

  const preview = value.slice(0, 48);
  return `${preview}... (omitted ${value.length - preview.length} chars)`;
}

function collectDictionaryStrings(
  value,
  pathPrefix,
  entries,
  seen,
  rejectedEntries,
  rejectedSeen
) {
  if (typeof value === "string") {
    if (shouldSkipDictionaryValue(value)) {
      addRejectedEntry(
        rejectedEntries,
        rejectedSeen,
        pathPrefix,
        value,
        "skip-value:data-image"
      );
      return;
    }

    addEntry(entries, seen, pathPrefix, value);
    return;
  }

  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPath = `${pathPrefix}[${index}]`;
      collectDictionaryStrings(item, nextPath, entries, seen, rejectedEntries, rejectedSeen);
    });
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  Object.entries(value).forEach(([key, child]) => {
    const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (shouldSkipDictionaryKey(key)) {
      if (typeof child === "string") {
        addRejectedEntry(
          rejectedEntries,
          rejectedSeen,
          nextPath,
          child,
          `skip-key:${key}`
        );
      } else if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (typeof item === "string") {
            addRejectedEntry(
              rejectedEntries,
              rejectedSeen,
              `${nextPath}[${index}]`,
              item,
              `skip-key:${key}`
            );
          }
        });
      }
      return;
    }
    collectDictionaryStrings(child, nextPath, entries, seen, rejectedEntries, rejectedSeen);
  });
}

async function loadProjects(repoRoot, entries, seen, rejectedEntries, rejectedSeen) {
  const projectsDir = path.join(repoRoot, SOURCE_PROJECTS_DIR);
  const files = await fs.readdir(projectsDir);
  const projectFiles = files
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !file.endsWith(".draft.json"))
    .filter((file) => file !== "template.json")
    .sort();

  for (const file of projectFiles) {
    const payload = await fs.readFile(path.join(projectsDir, file), "utf8");
    const project = JSON.parse(payload);
    if (!project || !project.id) {
      continue;
    }
    collectLocalizedStrings(
      project,
      `projects.${project.id}`,
      entries,
      seen,
      rejectedEntries,
      rejectedSeen
    );
  }
}

async function loadTechStackDetails(repoRoot, entries, seen, rejectedEntries, rejectedSeen) {
  const techStackPath = path.join(repoRoot, SOURCE_TECH_STACK);
  const payload = await fs.readFile(techStackPath, "utf8");
  const techStackEntries = JSON.parse(payload);

  if (!Array.isArray(techStackEntries)) {
    throw new Error("tech-stack-details.json must export an array.");
  }

  techStackEntries.forEach((entry) => {
    if (!entry || !entry.id) {
      return;
    }
    collectLocalizedStrings(
      entry,
      `techStackDetails.${entry.id}`,
      entries,
      seen,
      rejectedEntries,
      rejectedSeen
    );
  });
}

async function loadResume(repoRoot, entries, seen, rejectedEntries, rejectedSeen) {
  const resumePath = path.join(repoRoot, SOURCE_RESUME);
  const payload = await fs.readFile(resumePath, "utf8");
  const resume = JSON.parse(payload);

  collectStringValues(resume, "resume", entries, seen, rejectedEntries, rejectedSeen);
}

async function loadTimezones(repoRoot, entries, seen, rejectedEntries, rejectedSeen) {
  const timezonesPath = path.join(repoRoot, SOURCE_TIMEZONES);
  const payload = await fs.readFile(timezonesPath, "utf8");
  const timezones = JSON.parse(payload);

  collectLocalizedStrings(
    timezones,
    "timezones",
    entries,
    seen,
    rejectedEntries,
    rejectedSeen
  );
}

function requireFromString(code, filename) {
  const { Module } = require("node:module");
  const moduleInstance = new Module(filename, module.parent);
  moduleInstance.filename = filename;
  moduleInstance.paths = Module._nodeModulePaths(path.dirname(filename));
  moduleInstance._compile(code, filename);
  return moduleInstance.exports;
}

function addStaticTechStackItems(sourceText, rejectedEntries, rejectedSeen) {
  const blockMatch = sourceText.match(
    /const\s+STATIC_TECH_STACK_ITEMS[^=]*=\s*\[([\s\S]*?)\];/
  );
  if (!blockMatch) {
    return;
  }

  const itemRegex =
    /\{\s*name:\s*["']([^"']+)["']\s*,\s*href:\s*["']([^"']*)["']\s*,\s*assetId:\s*["']([^"']+)["']\s*\}/g;
  let index = 0;
  let match;

  while ((match = itemRegex.exec(blockMatch[1]))) {
    const [_, name, href, assetId] = match;
    addRejectedEntry(
      rejectedEntries,
      rejectedSeen,
      `techStack.staticItems[${index}].name`,
      name,
      "static-tech-stack"
    );
    addRejectedEntry(
      rejectedEntries,
      rejectedSeen,
      `techStack.staticItems[${index}].href`,
      href,
      "static-tech-stack"
    );
    addRejectedEntry(
      rejectedEntries,
      rejectedSeen,
      `techStack.staticItems[${index}].assetId`,
      assetId,
      "static-tech-stack"
    );
    index += 1;
  }
}

function addProofChipFallbacks(sourceText, rejectedEntries, rejectedSeen) {
  const proofRegex =
    /const\s+(build[A-Za-z0-9]+ProofChip)\s*=\s*\([^)]*\)\s*=>\s*buildProofChip\([^,]+,[^,]+,\s*["']([^"']+)["']\s*\)/g;
  let match;

  while ((match = proofRegex.exec(sourceText))) {
    const [_, functionName, fallback] = match;
    addRejectedEntry(
      rejectedEntries,
      rejectedSeen,
      `proofChipFallback.${functionName}`,
      fallback,
      "fallback-literal"
    );
  }
}

function addErrorMessages(sourceText, rejectedEntries, rejectedSeen) {
  const errorRegex = /new Error\((`[^`]+`|"[^"]+"|'[^']+')\)/g;
  let index = 0;
  let match;

  while ((match = errorRegex.exec(sourceText))) {
    const raw = match[1];
    const message = raw.slice(1, -1);
    const normalized = message.replace(/\\s+/g, " ").trim();
    let key;

    if (normalized.includes("Experience entry is required for project")) {
      key = "errors.requireExperience";
    } else if (normalized.includes("Tech stack is required for project")) {
      key = "errors.requireTechStack";
    } else {
      key = `errors.literal[${index}]`;
      index += 1;
    }

    addRejectedEntry(rejectedEntries, rejectedSeen, key, message, "error-message");
  }
}

function addDictionarySourceExtras(sourceText, rejectedEntries, rejectedSeen) {
  addStaticTechStackItems(sourceText, rejectedEntries, rejectedSeen);
  addProofChipFallbacks(sourceText, rejectedEntries, rejectedSeen);
  addErrorMessages(sourceText, rejectedEntries, rejectedSeen);
}

async function loadDictionaries(repoRoot, entries, seen, rejectedEntries, rejectedSeen) {
  const dictionariesPath = path.join(repoRoot, SOURCE_DICTIONARIES);
  const payload = await fs.readFile(dictionariesPath, "utf8");
  addDictionarySourceExtras(payload, rejectedEntries, rejectedSeen);
  const ts = require("typescript");
  const compiled = ts.transpileModule(payload, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: dictionariesPath
  });
  const dictionaryModule = requireFromString(compiled.outputText, dictionariesPath);

  if (typeof dictionaryModule.getDictionary !== "function") {
    throw new Error("dictionaries.ts must export getDictionary().");
  }

  const dictionary = dictionaryModule.getDictionary("en");
  collectDictionaryStrings(dictionary, "", entries, seen, rejectedEntries, rejectedSeen);
}

function buildMarkdown(entries) {
  const lines = [
    "# Projects + Tech Stack + Resume + Dictionary + Timezone strings - String | English",
    "",
    "Source: `apps/site/data/projects/*.json`, `apps/site/data/tech-stack-details.json`, `apps/site/data/timezones.json`, `content/resume.json`, `apps/site/src/utils/dictionaries.ts`",
    "Generated by: `scripts/export-EN-strings.js`",
    "",
    "## Copy strings",
    "",
    "| String | English |",
    "| --- | --- |"
  ];

  entries.forEach(({ key, english }) => {
    lines.push(`| \`${key}\` | ${escapeMarkdown(english)} |`);
  });

  lines.push("");
  return lines.join("\n");
}

function buildDeltaMarkdown(added, changed, removed) {
  const lines = [
    "# Delta strings - Added + Changed",
    "",
    "Source: `apps/site/data/projects/*.json`, `apps/site/data/tech-stack-details.json`, `apps/site/data/timezones.json`, `content/resume.json`, `apps/site/src/utils/dictionaries.ts`",
    "Generated by: `scripts/export-EN-strings.js`",
    "",
    "## Added",
    "",
    "| String | English |",
    "| --- | --- |"
  ];

  if (added.length) {
    added.forEach(({ key, english }) => {
      lines.push(`| \`${key}\` | ${escapeMarkdown(english)} |`);
    });
  }

  lines.push("", "## Changed", "", "| String | English (old → new) |", "| --- | --- |");

  if (changed.length) {
    changed.forEach(({ key, english, previousEnglish }) => {
      lines.push(
        `| \`${key}\` | ${escapeMarkdown(previousEnglish)} → ${escapeMarkdown(english)} |`
      );
    });
  }

  if (removed.length) {
    lines.push("", "## Removed", "", "| String | Previous English |", "| --- | --- |");
    removed.forEach(({ key, english }) => {
      lines.push(`| \`${key}\` | ${escapeMarkdown(english)} |`);
    });
  }

  lines.push("");
  return lines.join("\n");
}

function buildRejectedMarkdown(entries) {
  const lines = [
    "# Skipped strings - String | English | Reason",
    "",
    "Source: `apps/site/src/utils/dictionaries.ts`, `apps/site/data/projects/*.json`, `apps/site/data/tech-stack-details.json`, `apps/site/data/timezones.json`, `content/resume.json`",
    "Generated by: `scripts/export-EN-strings.js`",
    "",
    "## Skipped strings",
    "",
    "| String | English | Reason |",
    "| --- | --- | --- |"
  ];

  entries.forEach(({ key, english, reason }) => {
    lines.push(`| \`${key}\` | ${escapeMarkdown(english)} | ${escapeMarkdown(reason)} |`);
  });

  lines.push("");
  return lines.join("\n");
}

function buildChunkMarkdown(entries, partIndex, partTotal) {
  const lines = [
    "# Projects + Tech Stack + Resume + Dictionary + Timezone strings - String | English",
    "",
    `Part ${partIndex} of ${partTotal}`,
    "",
    "Source: `apps/site/data/projects/*.json`, `apps/site/data/tech-stack-details.json`, `apps/site/data/timezones.json`, `content/resume.json`, `apps/site/src/utils/dictionaries.ts`",
    "Generated by: `scripts/export-EN-strings.js`",
    "",
    "## Copy strings",
    "",
    "| String | English |",
    "| --- | --- |"
  ];

  entries.forEach(({ key, english }) => {
    lines.push(`| \`${key}\` | ${escapeMarkdown(english)} |`);
  });

  lines.push("");
  return lines.join("\n");
}

function buildChunkManifest(chunks, chunkFilenames) {
  const lines = [
    "# Localization chunks manifest",
    "",
    "Generated by: `scripts/export-EN-strings.js`",
    "",
    "| File | Rows | First key | Last key |",
    "| --- | --- | --- | --- |"
  ];

  chunks.forEach((chunk, index) => {
    const first = chunk[0]?.key ?? "";
    const last = chunk[chunk.length - 1]?.key ?? "";
    lines.push(`| ${chunkFilenames[index]} | ${chunk.length} | \`${first}\` | \`${last}\` |`);
  });

  lines.push("");
  return lines.join("\n");
}

async function writeChunks(entries, chunkSize, chunkDir) {
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }

  const chunkFilenames = chunks.map((_, index) =>
    `script-extracted_strings_en_part-${String(index + 1).padStart(3, "0")}.md`
  );

  await fs.mkdir(chunkDir, { recursive: true });

  await Promise.all(
    chunks.map((chunk, index) => {
      const content = buildChunkMarkdown(chunk, index + 1, chunks.length);
      const filePath = path.join(chunkDir, chunkFilenames[index]);
      return fs.writeFile(filePath, content, "utf8");
    })
  );

  const manifest = buildChunkManifest(chunks, chunkFilenames);
  const manifestPath = path.join(chunkDir, "script-extracted_strings_en_chunks_manifest.md");
  await fs.writeFile(manifestPath, manifest, "utf8");

  return [manifestPath, ...chunkFilenames.map((name) => path.join(chunkDir, name))];
}

async function main() {
  const repoRoot = resolveRepoRoot();
  const {
    outputPath,
    rejectedPath,
    deltaPath,
    hashPath,
    chunkSize,
    chunkDir
  } = parseArgs(process.argv);
  const outputFile = path.resolve(repoRoot, outputPath);
  const rejectedFile = path.resolve(repoRoot, rejectedPath);
  const deltaFile = path.resolve(repoRoot, deltaPath);
  const hashFile = path.resolve(repoRoot, hashPath);

  const projectEntries = [];
  const techStackEntries = [];
  const resumeEntries = [];
  const timezoneEntries = [];
  const dictionaryEntries = [];
  const rejectedEntries = [];
  const seen = new Set();
  const rejectedSeen = new Set();

  await loadProjects(repoRoot, projectEntries, seen, rejectedEntries, rejectedSeen);
  await loadTechStackDetails(repoRoot, techStackEntries, seen, rejectedEntries, rejectedSeen);
  await loadResume(repoRoot, resumeEntries, seen, rejectedEntries, rejectedSeen);
  await loadTimezones(repoRoot, timezoneEntries, seen, rejectedEntries, rejectedSeen);
  await loadDictionaries(repoRoot, dictionaryEntries, seen, rejectedEntries, rejectedSeen);

  const combinedEntries = [
    ...projectEntries,
    ...techStackEntries,
    ...resumeEntries,
    ...timezoneEntries,
    ...dictionaryEntries
  ];
  const markdown = buildMarkdown(combinedEntries);
  const hashState = await loadHashFile(hashFile);
  const deltaState = buildDeltaState(combinedEntries, hashState);
  const deltaMarkdown = buildDeltaMarkdown(deltaState.added, deltaState.changed, deltaState.removed);
  const hashPayload = buildHashPayload(combinedEntries);
  const rejectedMarkdown = buildRejectedMarkdown(rejectedEntries);
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, markdown, "utf8");
  await fs.mkdir(path.dirname(rejectedFile), { recursive: true });
  await fs.writeFile(rejectedFile, rejectedMarkdown, "utf8");
  await fs.mkdir(path.dirname(deltaFile), { recursive: true });
  await fs.writeFile(deltaFile, deltaMarkdown, "utf8");
  await fs.mkdir(path.dirname(hashFile), { recursive: true });
  await fs.writeFile(hashFile, `${JSON.stringify(hashPayload, null, 2)}\n`, "utf8");
  const chunkPaths = await writeChunks(combinedEntries, chunkSize, path.resolve(repoRoot, chunkDir));

  const chunkSummary = chunkPaths.length
    ? `Wrote ${chunkPaths.length} chunk files in ${path.resolve(repoRoot, chunkDir)}\n`
    : "";
  process.stdout.write(
    `Wrote ${outputFile}\nWrote ${rejectedFile}\nWrote ${deltaFile}\nWrote ${hashFile}\n${chunkSummary}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
