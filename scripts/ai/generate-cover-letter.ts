#!/usr/bin/env node

// Generate a tailored cover letter from Job Studio pass1/pass2 + local site context.

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

type Locale = "en" | "ja" | "zh";

type LocalizedString = Partial<Record<Locale, string>> | string;
type LocalizedStringList = Partial<Record<Locale, string[]>> | string[];

type ResumeBasics = {
  name?: LocalizedString;
  headline?: LocalizedString;
};

type ResumeExperience = {
  role?: LocalizedString;
  company?: LocalizedString;
  location?: LocalizedString;
  start?: LocalizedString;
  end?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedString[];
};

type ResumeEducation = {
  institution?: LocalizedString;
  credential?: LocalizedString;
  graduation?: LocalizedString;
  gpa?: number;
  notes?: LocalizedString[];
};

type ResumeJson = {
  basics?: ResumeBasics;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
};

type TechStackEntry = {
  id: string;
  title: LocalizedString;
  context?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedStringList;
};

type ProjectExperience = {
  id: string;
  company?: LocalizedString;
  role?: LocalizedString;
  timeframe?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedStringList;
};

type ProjectRecord = {
  id: string;
  experienceEntry?: ProjectExperience;
};

type CliOptions = {
  pass1Path: string;
  pass2Path: string;
  outPath: string;
  locale: Locale;
  model?: string;
  maxWords: number;
};

const DEFAULT_PASS1 = "apps/job-studio/cover-letters/pass1.md";
const DEFAULT_PASS2 = "apps/job-studio/cover-letters/pass2.md";
const DEFAULT_OUT = "apps/job-studio/cover-letters/cover-letter.md";
const DEFAULT_MAX_WORDS = 200;

const SYSTEM_PROMPT = [
  "You are a cover letter writer.",
  "Use the candidate context plus pass1 and pass2 planning notes.",
  "Follow the pass2 paragraph plan and honor pass1 tone guidance.",
  "Voice: formal, calm, concise, with slight warmth.",
  "Length: <= 200 words (target 170-190).",
  "Achievements: include only if clearly relevant to the job; quality over quantity.",
  "Use only the provided context; do not invent facts or claims.",
  "If pass1 includes a company name and product/platform name, use them exactly.",
  "If both are provided, refer to the product as the company's product/platform (do not attribute the mission to the product).",
  "Preserve company and product capitalization as written in pass1.",
  "No bullet lists, headings, or markdown formatting.",
  "No salutations or signatures; write only the letter body.",
  "Output plain text only."
].join("\n");

function printUsage() {
  console.log(
    [
      "Usage: pnpm exec tsc -p scripts/ai/tsconfig.json && node .tmp/chatbot-build/generate-cover-letter.js [options]",
      "",
      "Options:",
      `  --pass1 <path>       Pass 1 output path (default: ${DEFAULT_PASS1}).`,
      `  --pass2 <path>       Pass 2 output path (default: ${DEFAULT_PASS2}).`,
      `  --out <path>         Output markdown path (default: ${DEFAULT_OUT}).`,
      `  --locale <en|ja|zh>  Locale for context fields (default: en).`,
      "  --model <id>         OpenRouter model override.",
      `  --max-words <n>      Maximum word count (default: ${DEFAULT_MAX_WORDS}).`,
      "  --help               Show this help message."
    ].join("\n")
  );
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const getArg = (flag: string) => {
    const index = args.findIndex((arg) => arg === flag);
    return index !== -1 ? args[index + 1] : undefined;
  };

  const localeArg = getArg("--locale");
  const locale = localeArg === "ja" || localeArg === "zh" ? localeArg : "en";
  const maxWordsRaw = getArg("--max-words");
  const maxWords = maxWordsRaw ? Number.parseInt(maxWordsRaw, 10) : DEFAULT_MAX_WORDS;

  return {
    pass1Path: getArg("--pass1") ?? DEFAULT_PASS1,
    pass2Path: getArg("--pass2") ?? DEFAULT_PASS2,
    outPath: getArg("--out") ?? DEFAULT_OUT,
    locale,
    model: getArg("--model"),
    maxWords: Number.isFinite(maxWords) && maxWords > 0 ? maxWords : DEFAULT_MAX_WORDS
  };
}

function resolveRepoRoot(): string {
  const candidates = [
    process.cwd(),
    path.resolve(__dirname, "..", ".."),
    path.resolve(__dirname, "..", "..", "..")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "content", "resume.json"))) {
      return candidate;
    }
  }
  throw new Error("Unable to resolve repo root. Run from the repository root.");
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function localizeString(value: LocalizedString | undefined, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || "";
}

function localizeList(value: LocalizedStringList | undefined, locale: Locale): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value[locale] || value.en || [];
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdownFences(value: string): string {
  const match = value.match(/```(?:\w+)?\s*([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }
  return value.trim();
}

function normalizeCoverLetter(value: string): string {
  const stripped = stripMarkdownFences(value);
  const lines = stripped
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*\u2022]\s+/, ""));

  const output: string[] = [];
  let blankStreak = 0;
  for (const line of lines) {
    if (!line) {
      blankStreak += 1;
      if (blankStreak > 1) continue;
      output.push("");
      continue;
    }
    blankStreak = 0;
    output.push(line);
  }

  return output.join("\n").trimEnd() + "\n";
}

function countWords(value: string): number {
  const normalized = normalizeText(value);
  if (!normalized) return 0;
  return normalized.split(" ").filter(Boolean).length;
}

type ParsedEnvLine = {
  key: string;
  value: string;
};

function parseEnvLine(line: string): ParsedEnvLine | null {
  let trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("export ")) {
    trimmed = trimmed.slice("export ".length).trim();
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();
  if (!key) return null;

  if (!value) {
    return { key, value: "" };
  }

  const quote = value[0];
  if (quote === '"' || quote === "'") {
    const endIndex = value.lastIndexOf(quote);
    value = endIndex > 0 ? value.slice(1, endIndex) : value.slice(1);
    if (quote === '"') {
      value = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    return { key, value };
  }

  const commentIndex = value.search(/\s#/);
  if (commentIndex !== -1) {
    value = value.slice(0, commentIndex).trim();
  }

  return { key, value };
}

function loadEnvFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    if (process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }
  return true;
}

function loadLocalEnv(): void {
  const repoRoot = resolveRepoRoot();
  const envFiles = [
    path.join(repoRoot, "apps", "site", ".env.local"),
    path.join(repoRoot, "apps", "site", ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(repoRoot, ".env")
  ];

  for (const envPath of envFiles) {
    loadEnvFile(envPath);
  }
}

function buildContext(locale: Locale) {
  const repoRoot = resolveRepoRoot();
  const resumePath = path.join(repoRoot, "content", "resume.json");
  const techStackPath = path.join(repoRoot, "apps", "site", "data", "tech-stack-details.json");
  const projectsDir = path.join(repoRoot, "apps", "site", "data", "projects");

  const resume = readJson<ResumeJson>(resumePath);
  const techStack = readJson<TechStackEntry[]>(techStackPath);
  const projectFiles = fs
    .readdirSync(projectsDir)
    .filter(
      (file) =>
        file.endsWith(".json") &&
        !file.includes(".draft") &&
        !file.startsWith("template")
    );

  const projects = projectFiles.map((file) =>
    readJson<ProjectRecord>(path.join(projectsDir, file))
  );

  const basics = {
    name: localizeString(resume.basics?.name, locale),
    headline: localizeString(resume.basics?.headline, locale)
  };

  const experience = (resume.experience ?? []).map((entry) => ({
    role: localizeString(entry.role, locale),
    company: localizeString(entry.company, locale),
    location: localizeString(entry.location, locale),
    start: localizeString(entry.start, locale),
    end: localizeString(entry.end, locale),
    summary: localizeString(entry.summary, locale),
    highlights: (entry.highlights ?? [])
      .map((highlight) => localizeString(highlight, locale))
      .filter(Boolean)
  }));

  const education = (resume.education ?? []).map((entry) => ({
    institution: localizeString(entry.institution, locale),
    credential: localizeString(entry.credential, locale),
    graduation: localizeString(entry.graduation, locale),
    gpa: entry.gpa ?? null,
    notes: (entry.notes ?? [])
      .map((note) => localizeString(note, locale))
      .filter(Boolean)
  }));

  const projectExperience = projects
    .map((project) => project.experienceEntry)
    .filter(Boolean)
    .map((entry) => ({
      id: entry?.id ?? "",
      company: localizeString(entry?.company, locale),
      role: localizeString(entry?.role, locale),
      timeframe: localizeString(entry?.timeframe, locale),
      summary: localizeString(entry?.summary, locale),
      highlights: localizeList(entry?.highlights, locale).filter(Boolean)
    }))
    .filter((entry) => entry.company || entry.role || entry.summary || entry.highlights.length);

  const tech = techStack
    .filter((entry) => !entry.id.includes("template"))
    .map((entry) => ({
      id: entry.id,
      title: localizeString(entry.title, locale),
      context: localizeString(entry.context, locale),
      summary: localizeString(entry.summary, locale),
      highlights: localizeList(entry.highlights, locale).filter(Boolean)
    }));

  return { basics, experience, projectExperience, tech, education };
}

async function readFileFromRepo(relativePath: string): Promise<string> {
  const repoRoot = resolveRepoRoot();
  const resolved = path.isAbsolute(relativePath)
    ? relativePath
    : path.resolve(repoRoot, relativePath);
  return fsPromises.readFile(resolved, "utf8");
}

async function callOpenRouter(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Portfolio Cover Letter Generator"
  };

  const referer = process.env.OPENROUTER_APP_URL;
  if (referer) {
    headers["HTTP-Referer"] = referer;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${response.status} ${response.statusText}): ${errorBody.slice(0, 200)}`
    );
  }

  const payload = await response.json();
  const choice = payload?.choices?.[0];
  const content = extractMessageContent(choice);
  if (!content.trim()) {
    throw new Error("OpenRouter returned empty content.");
  }
  return content.trim();
}

function extractMessageContent(choice: unknown): string {
  if (!choice || typeof choice !== "object") {
    return "";
  }

  const message = (choice as { message?: unknown }).message;
  if (!message || typeof message !== "object") {
    return "";
  }

  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  const messageText = (message as { text?: unknown }).text;
  return typeof messageText === "string" ? messageText : "";
}

function buildUserPrompt(pass1: string, pass2: string, context: ReturnType<typeof buildContext>) {
  return [
    "PASS 1 (tone + role brief):",
    pass1.trim(),
    "",
    "PASS 2 (cover letter plan):",
    pass2.trim(),
    "",
    "CANDIDATE CONTEXT (JSON):",
    JSON.stringify(context, null, 2)
  ].join("\n");
}

async function main() {
  const options = parseArgs(process.argv);
  loadLocalEnv();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable.");
  }

  const model =
    options.model ||
    process.env.OPENROUTER_COVER_LETTER_MODEL ||
    process.env.OPENROUTER_RESUME_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "openrouter/auto";

  const pass1 = (await readFileFromRepo(options.pass1Path)).trim();
  const pass2 = (await readFileFromRepo(options.pass2Path)).trim();

  if (!pass1) {
    throw new Error(`Pass 1 file is empty: ${options.pass1Path}`);
  }
  if (!pass2) {
    throw new Error(`Pass 2 file is empty: ${options.pass2Path}`);
  }

  const context = buildContext(options.locale);
  const userPrompt = buildUserPrompt(pass1, pass2, context);
  const rawResponse = await callOpenRouter({
    apiKey,
    model,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt
  });

  const coverLetter = normalizeCoverLetter(rawResponse);
  const wordCount = countWords(coverLetter);
  if (wordCount > options.maxWords) {
    console.warn(
      `[cover-letter] Warning: ${wordCount} words (limit ${options.maxWords}).`
    );
  }

  const repoRoot = resolveRepoRoot();
  const outputPath = path.resolve(repoRoot, options.outPath);
  await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
  await fsPromises.writeFile(outputPath, coverLetter, "utf8");

  console.log(
    `Wrote cover letter to ${path.relative(repoRoot, outputPath)} (${wordCount} words)`
  );
}

main().catch((error) => {
  console.error("[cover-letter] Failed:", error);
  process.exit(1);
});
