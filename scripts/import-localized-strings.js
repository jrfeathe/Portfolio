#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const ts = require("typescript");

const DEFAULT_INPUT = "apps/site/data/script-strings_en-ja-zh.md";
const PROJECTS_DIR = "apps/site/data/projects";
const TECH_STACK_PATH = "apps/site/data/tech-stack-details.json";
const TIMEZONES_PATH = "apps/site/data/timezones.json";
const DICTIONARIES_PATH = "apps/site/src/utils/dictionaries.ts";
const RESUME_PATH = "content/resume.json";

const DERIVED_DICTIONARY_PREFIXES = [
  "home.sections.techStack.items",
  "home.sections.proof.proofChips",
  "experience.entries",
  "experience.techStack"
];

function resolveRepoRoot() {
  return path.resolve(__dirname, "..");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const inputIndex = args.findIndex((arg) => arg === "--in" || arg === "--input");
  const inputPath =
    inputIndex !== -1 && args[inputIndex + 1] ? args[inputIndex + 1] : DEFAULT_INPUT;

  return { inputPath };
}

function splitMarkdownRow(line) {
  const cells = [];
  let current = "";
  let escaped = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (char === "|") {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function normalizeCells(cells) {
  let trimmed = cells.map((cell) => cell.trim());
  if (trimmed[0] === "") {
    trimmed = trimmed.slice(1);
  }
  if (trimmed[trimmed.length - 1] === "") {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
}

function extractKey(keyCell) {
  const trimmed = keyCell.trim();
  if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function unescapeMarkdown(value) {
  return value.replace(/\\\|/g, "|").replace(/<br>/g, "\n");
}

function normalizeValue(value) {
  const trimmed = value.trim();
  if (trimmed === "\"\"") {
    return "";
  }
  return unescapeMarkdown(trimmed);
}

function parsePath(pathValue) {
  const tokens = [];
  let buffer = "";

  for (let i = 0; i < pathValue.length; i += 1) {
    const char = pathValue[i];
    if (char === ".") {
      if (buffer) {
        tokens.push(buffer);
        buffer = "";
      }
      continue;
    }
    if (char === "[") {
      if (buffer) {
        tokens.push(buffer);
        buffer = "";
      }
      const endIndex = pathValue.indexOf("]", i);
      if (endIndex === -1) {
        throw new Error(`Malformed path: ${pathValue}`);
      }
      const indexValue = Number(pathValue.slice(i + 1, endIndex));
      if (!Number.isFinite(indexValue)) {
        throw new Error(`Invalid array index in path: ${pathValue}`);
      }
      tokens.push(indexValue);
      i = endIndex;
      continue;
    }
    buffer += char;
  }

  if (buffer) {
    tokens.push(buffer);
  }

  return tokens;
}

async function loadTranslations(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const rows = [];
  const seen = new Set();

  content.split(/\r?\n/).forEach((line) => {
    if (!line.startsWith("| `")) {
      return;
    }
    const cells = normalizeCells(splitMarkdownRow(line));
    if (cells.length < 4) {
      throw new Error(`Malformed row in ${filePath}: ${line}`);
    }
    const [keyCell, english, japanese, chinese] = cells;
    const key = extractKey(keyCell);
    if (!key) {
      throw new Error(`Missing key in ${filePath}: ${line}`);
    }
    if (seen.has(key)) {
      throw new Error(`Duplicate key ${key} in ${filePath}`);
    }
    seen.add(key);
    rows.push({
      key,
      english: normalizeValue(english),
      ja: normalizeValue(japanese),
      zh: normalizeValue(chinese)
    });
  });

  if (!rows.length) {
    throw new Error(`No rows found in ${filePath}`);
  }

  return rows;
}

async function loadProjectFiles(projectsDir) {
  const files = await fs.readdir(projectsDir);
  const projectFiles = files
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !file.endsWith(".draft.json"))
    .filter((file) => file !== "template.json")
    .sort();

  const projects = new Map();
  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file);
    const payload = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(payload);
    if (!data || !data.id) {
      continue;
    }
    projects.set(data.id, { path: filePath, data });
  }

  return projects;
}

function applyLocalizedValue(target, tokens, locale, value) {
  if (!tokens.length) {
    return null;
  }
  const lastToken = tokens[tokens.length - 1];
  const isIndex = typeof lastToken === "number";
  const baseTokens = isIndex ? tokens.slice(0, -1) : tokens;

  let current = target;
  for (const token of baseTokens) {
    if (typeof token === "number") {
      if (!Array.isArray(current)) {
        return null;
      }
      current = current[token];
    } else {
      if (!current || typeof current !== "object") {
        return null;
      }
      current = current[token];
    }
  }

  if (!current || typeof current !== "object") {
    return null;
  }

  if (isIndex) {
    const index = lastToken;
    if (!Array.isArray(current[locale])) {
      current[locale] = [];
    }
    if (current[locale][index] === value) {
      return false;
    }
    current[locale][index] = value;
    return true;
  }

  if (current[locale] === value) {
    return false;
  }
  current[locale] = value;
  return true;
}

function applyLocalizedLeaf(target, tokens, localized) {
  if (!tokens.length) {
    return null;
  }
  const lastToken = tokens[tokens.length - 1];
  const baseTokens = tokens.slice(0, -1);

  let current = target;
  for (const token of baseTokens) {
    if (typeof token === "number") {
      if (!Array.isArray(current)) {
        return null;
      }
      current = current[token];
    } else {
      if (!current || typeof current !== "object") {
        return null;
      }
      current = current[token];
    }
  }

  if (!current || typeof current !== "object") {
    return null;
  }

  const nextValue = { en: localized.en, ja: localized.ja, zh: localized.zh };

  if (typeof lastToken === "number") {
    if (!Array.isArray(current)) {
      return null;
    }
    const existing = current[lastToken];
    if (
      existing &&
      typeof existing === "object" &&
      existing.en === nextValue.en &&
      existing.ja === nextValue.ja &&
      existing.zh === nextValue.zh
    ) {
      return false;
    }
    current[lastToken] = nextValue;
    return true;
  }

  const existing = current[lastToken];
  if (
    existing &&
    typeof existing === "object" &&
    existing.en === nextValue.en &&
    existing.ja === nextValue.ja &&
    existing.zh === nextValue.zh
  ) {
    return false;
  }
  current[lastToken] = nextValue;
  return true;
}

function unwrapExpression(node) {
  let current = node;
  while (true) {
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isAsExpression(current)) {
      current = current.expression;
      continue;
    }
    if (typeof ts.isSatisfiesExpression === "function" && ts.isSatisfiesExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isTypeAssertionExpression(current)) {
      current = current.expression;
      continue;
    }
    return current;
  }
}

function getPropertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
}

function findNodeForPath(root, tokens) {
  let current = unwrapExpression(root);

  for (const token of tokens) {
    current = unwrapExpression(current);
    if (typeof token === "string") {
      if (!ts.isObjectLiteralExpression(current)) {
        return null;
      }
      const match = current.properties.find((prop) => {
        if (!ts.isPropertyAssignment(prop)) {
          return false;
        }
        const name = getPropertyName(prop.name);
        return name === token;
      });
      if (!match || !ts.isPropertyAssignment(match)) {
        return null;
      }
      current = match.initializer;
      continue;
    }

    if (!ts.isArrayLiteralExpression(current)) {
      return null;
    }
    const element = current.elements[token];
    if (!element || ts.isSpreadElement(element)) {
      return null;
    }
    current = element;
  }

  return unwrapExpression(current);
}

function isStringLiteralNode(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function getStringLiteralValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function getSingleNonSpreadStringLiteral(node) {
  if (!ts.isArrayLiteralExpression(node)) {
    return null;
  }

  let found = null;
  for (const element of node.elements) {
    if (ts.isSpreadElement(element)) {
      continue;
    }
    const value = getStringLiteralValue(element);
    if (value === null) {
      return null;
    }
    if (found) {
      return null;
    }
    found = { node: element, value };
  }

  return found;
}

function buildReplacement(node, value, sourceFile) {
  return {
    start: node.getStart(sourceFile),
    end: node.getEnd(),
    value: JSON.stringify(value)
  };
}

function applyReplacements(sourceText, replacements) {
  if (!replacements.length) {
    return sourceText;
  }

  const sorted = [...replacements].sort((a, b) => b.start - a.start);

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].end > sorted[i - 1].start) {
      throw new Error("Overlapping replacements detected in dictionary update.");
    }
  }

  let updated = sourceText;
  sorted.forEach((replacement) => {
    updated =
      updated.slice(0, replacement.start) +
      replacement.value +
      updated.slice(replacement.end);
  });

  return updated;
}

function isDerivedDictionaryKey(key) {
  return DERIVED_DICTIONARY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function isRoadmapNextStepKey(key) {
  return key.startsWith("home.sections.roadmap.nextSteps[");
}

function findConstObject(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) {
        continue;
      }
      if (!declaration.initializer) {
        continue;
      }
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isObjectLiteralExpression(initializer)) {
        return initializer;
      }
    }
  }
  return null;
}

async function updateDictionaries(repoRoot, rows) {
  const dictionariesPath = path.join(repoRoot, DICTIONARIES_PATH);
  const sourceText = await fs.readFile(dictionariesPath, "utf8");
  const sourceFile = ts.createSourceFile(
    dictionariesPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const enNode = findConstObject(sourceFile, "en");
  const jaNode = findConstObject(sourceFile, "ja");
  const zhNode = findConstObject(sourceFile, "zh");

  if (!jaNode || !zhNode) {
    throw new Error("Unable to locate ja/zh dictionaries in dictionaries.ts.");
  }

  const roadmapTokens = parsePath("home.sections.roadmap.nextSteps");
  const roadmapEnArray = enNode ? findNodeForPath(enNode, roadmapTokens) : null;
  const roadmapJaArray = findNodeForPath(jaNode, roadmapTokens);
  const roadmapZhArray = findNodeForPath(zhNode, roadmapTokens);
  const roadmapEnLiteral = roadmapEnArray
    ? getSingleNonSpreadStringLiteral(roadmapEnArray)
    : null;
  const roadmapJaLiteral = roadmapJaArray
    ? getSingleNonSpreadStringLiteral(roadmapJaArray)
    : null;
  const roadmapZhLiteral = roadmapZhArray
    ? getSingleNonSpreadStringLiteral(roadmapZhArray)
    : null;

  const replacements = [];
  const missing = [];
  let updatedJa = 0;
  let updatedZh = 0;
  let skippedDerived = 0;
  let skippedRoadmapDerived = 0;

  rows.forEach((row) => {
    if (isDerivedDictionaryKey(row.key)) {
      skippedDerived += 1;
      return;
    }

    if (isRoadmapNextStepKey(row.key)) {
      if (roadmapEnLiteral && row.english === roadmapEnLiteral.value) {
        if (roadmapJaLiteral) {
          const current = roadmapJaLiteral.value;
          if (current !== row.ja) {
            replacements.push(buildReplacement(roadmapJaLiteral.node, row.ja, sourceFile));
            updatedJa += 1;
          }
        } else {
          missing.push({ key: row.key, locale: "ja" });
        }
        if (roadmapZhLiteral) {
          const current = roadmapZhLiteral.value;
          if (current !== row.zh) {
            replacements.push(buildReplacement(roadmapZhLiteral.node, row.zh, sourceFile));
            updatedZh += 1;
          }
        } else {
          missing.push({ key: row.key, locale: "zh" });
        }
      } else {
        skippedRoadmapDerived += 1;
      }
      return;
    }

    const tokens = parsePath(row.key);
    const jaValueNode = findNodeForPath(jaNode, tokens);
    const zhValueNode = findNodeForPath(zhNode, tokens);

    if (jaValueNode && isStringLiteralNode(jaValueNode)) {
      const current = getStringLiteralValue(jaValueNode);
      if (current !== row.ja) {
        replacements.push(buildReplacement(jaValueNode, row.ja, sourceFile));
        updatedJa += 1;
      }
    } else {
      missing.push({ key: row.key, locale: "ja" });
    }

    if (zhValueNode && isStringLiteralNode(zhValueNode)) {
      const current = getStringLiteralValue(zhValueNode);
      if (current !== row.zh) {
        replacements.push(buildReplacement(zhValueNode, row.zh, sourceFile));
        updatedZh += 1;
      }
    } else {
      missing.push({ key: row.key, locale: "zh" });
    }
  });

  const updatedText = applyReplacements(sourceText, replacements);
  if (updatedText !== sourceText) {
    await fs.writeFile(dictionariesPath, updatedText, "utf8");
  }

  return {
    updatedJa,
    updatedZh,
    skippedDerived,
    skippedRoadmapDerived,
    missing,
    wroteFile: updatedText !== sourceText ? dictionariesPath : null
  };
}

async function updateResumeTranslations(repoRoot, rows) {
  const resumePath = path.join(repoRoot, RESUME_PATH);
  const payload = await fs.readFile(resumePath, "utf8");
  const resume = JSON.parse(payload);

  let updated = 0;
  const missing = [];

  rows.forEach((row) => {
    const pathSuffix = row.key.startsWith("resume.")
      ? row.key.slice("resume.".length)
      : row.key;
    const tokens = parsePath(pathSuffix);
    const result = applyLocalizedLeaf(resume, tokens, {
      en: row.english,
      ja: row.ja,
      zh: row.zh
    });
    if (result === null) {
      missing.push({ key: row.key, locale: "resume" });
    } else if (result) {
      updated += 1;
    }
  });

  if (updated) {
    await fs.writeFile(resumePath, `${JSON.stringify(resume, null, 2)}\n`, "utf8");
  }

  return { updated, missing, wroteFile: updated ? resumePath : null };
}

async function main() {
  const repoRoot = resolveRepoRoot();
  const { inputPath } = parseArgs(process.argv);
  const inputFile = path.resolve(repoRoot, inputPath);

  const rows = await loadTranslations(inputFile);
  const projectRows = [];
  const techStackRows = [];
  const timezoneRows = [];
  const resumeRows = [];
  const dictionaryRows = [];

  rows.forEach((row) => {
    if (row.key.startsWith("projects.")) {
      projectRows.push(row);
    } else if (row.key.startsWith("techStackDetails.")) {
      techStackRows.push(row);
    } else if (row.key.startsWith("timezones.")) {
      timezoneRows.push(row);
    } else if (row.key.startsWith("resume.")) {
      resumeRows.push(row);
    } else {
      dictionaryRows.push(row);
    }
  });

  const projectsDir = path.join(repoRoot, PROJECTS_DIR);
  const projects = await loadProjectFiles(projectsDir);
  const projectMissing = [];
  const updatedProjectFiles = new Set();
  let projectUpdates = 0;

  projectRows.forEach((row) => {
    const rest = row.key.slice("projects.".length);
    const splitIndex = rest.indexOf(".");
    if (splitIndex === -1) {
      projectMissing.push({ key: row.key, locale: "ja/zh" });
      return;
    }
    const projectId = rest.slice(0, splitIndex);
    const pathSuffix = rest.slice(splitIndex + 1);
    const entry = projects.get(projectId);
    if (!entry) {
      projectMissing.push({ key: row.key, locale: "ja/zh" });
      return;
    }
    const tokens = parsePath(pathSuffix);
    const jaUpdated = applyLocalizedValue(entry.data, tokens, "ja", row.ja);
    const zhUpdated = applyLocalizedValue(entry.data, tokens, "zh", row.zh);
    if (jaUpdated === null) {
      projectMissing.push({ key: row.key, locale: "ja" });
    }
    if (zhUpdated === null) {
      projectMissing.push({ key: row.key, locale: "zh" });
    }
    if (jaUpdated || zhUpdated) {
      projectUpdates += Number(Boolean(jaUpdated)) + Number(Boolean(zhUpdated));
      updatedProjectFiles.add(entry.path);
    }
  });

  for (const filePath of updatedProjectFiles) {
    const project = [...projects.values()].find((entry) => entry.path === filePath);
    if (project) {
      await fs.writeFile(filePath, `${JSON.stringify(project.data, null, 2)}\n`, "utf8");
    }
  }

  const techStackPath = path.join(repoRoot, TECH_STACK_PATH);
  const techStackPayload = await fs.readFile(techStackPath, "utf8");
  const techStackDetails = JSON.parse(techStackPayload);
  const techStackById = new Map();
  if (Array.isArray(techStackDetails)) {
    techStackDetails.forEach((entry) => {
      if (entry?.id) {
        techStackById.set(entry.id, entry);
      }
    });
  }

  let techStackUpdates = 0;
  const techStackMissing = [];

  techStackRows.forEach((row) => {
    const rest = row.key.slice("techStackDetails.".length);
    const splitIndex = rest.indexOf(".");
    if (splitIndex === -1) {
      techStackMissing.push({ key: row.key, locale: "ja/zh" });
      return;
    }
    const entryId = rest.slice(0, splitIndex);
    const pathSuffix = rest.slice(splitIndex + 1);
    const entry = techStackById.get(entryId);
    if (!entry) {
      techStackMissing.push({ key: row.key, locale: "ja/zh" });
      return;
    }
    const tokens = parsePath(pathSuffix);
    const jaUpdated = applyLocalizedValue(entry, tokens, "ja", row.ja);
    const zhUpdated = applyLocalizedValue(entry, tokens, "zh", row.zh);
    if (jaUpdated === null) {
      techStackMissing.push({ key: row.key, locale: "ja" });
    }
    if (zhUpdated === null) {
      techStackMissing.push({ key: row.key, locale: "zh" });
    }
    if (jaUpdated || zhUpdated) {
      techStackUpdates += Number(Boolean(jaUpdated)) + Number(Boolean(zhUpdated));
    }
  });

  if (techStackUpdates) {
    await fs.writeFile(techStackPath, `${JSON.stringify(techStackDetails, null, 2)}\n`, "utf8");
  }

  const timezonesPath = path.join(repoRoot, TIMEZONES_PATH);
  const timezonesPayload = await fs.readFile(timezonesPath, "utf8");
  const timezones = JSON.parse(timezonesPayload);
  let timezoneUpdates = 0;
  const timezoneMissing = [];

  timezoneRows.forEach((row) => {
    const timezoneKey = row.key.slice("timezones.".length);
    const entry = timezones[timezoneKey];
    if (!entry || typeof entry !== "object") {
      timezoneMissing.push({ key: row.key, locale: "ja/zh" });
      return;
    }
    if (entry.ja !== row.ja) {
      entry.ja = row.ja;
      timezoneUpdates += 1;
    }
    if (entry.zh !== row.zh) {
      entry.zh = row.zh;
      timezoneUpdates += 1;
    }
  });

  if (timezoneUpdates) {
    await fs.writeFile(timezonesPath, `${JSON.stringify(timezones, null, 2)}\n`, "utf8");
  }

  const dictionaryResult = await updateDictionaries(repoRoot, dictionaryRows);

  const resumeResult = await updateResumeTranslations(repoRoot, resumeRows);

  const lines = [
    `Loaded ${rows.length} rows from ${inputFile}`,
    `Updated project entries: ${projectUpdates} (${updatedProjectFiles.size} files)`,
    `Updated tech stack entries: ${techStackUpdates}`,
    `Updated timezone entries: ${timezoneUpdates}`,
    `Updated dictionaries: ja ${dictionaryResult.updatedJa}, zh ${dictionaryResult.updatedZh}`,
    `Skipped derived dictionary entries: ${dictionaryResult.skippedDerived}`,
    `Skipped derived roadmap entries: ${dictionaryResult.skippedRoadmapDerived}`
  ];

  if (dictionaryResult.wroteFile) {
    lines.push(`Wrote ${dictionaryResult.wroteFile}`);
  }

  if (resumeResult) {
    lines.push(`Updated resume entries: ${resumeResult.updated}`);
    if (resumeResult.wroteFile) {
      lines.push(`Wrote ${resumeResult.wroteFile}`);
    }
  }

  process.stdout.write(`${lines.join("\n")}\n`);

  const missing = [
    ...projectMissing,
    ...techStackMissing,
    ...timezoneMissing,
    ...dictionaryResult.missing,
    ...(resumeResult?.missing ?? [])
  ];

  if (missing.length) {
    const preview = missing.slice(0, 20);
    process.stderr.write(`Missing ${missing.length} entries (showing up to 20):\n`);
    preview.forEach((entry) => {
      process.stderr.write(`- ${entry.key} (${entry.locale})\n`);
    });
    if (missing.length > preview.length) {
      process.stderr.write(`...and ${missing.length - preview.length} more.\n`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
