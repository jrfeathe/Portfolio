#!/usr/bin/env node

// Generate a tailored, 1-page resume (markdown) from local JSON context + a job description.

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

type ResumeOutput = {
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
};

type CliOptions = {
  jobPath?: string;
  jobText?: string;
  outPath: string;
  jsonOutPath?: string;
  locale: Locale;
  model?: string;
  noHeader: boolean;
};

const DEFAULT_JOB = "apps/job-studio/job-description-compact.txt";
const DEFAULT_OUT = "apps/job-studio/tailored-resume.md";

const SYSTEM_PROMPT = [
  "You are a resume assistant.",
  "Context includes: basics, experience (jobs), projectExperience (projects), tech (skills), education.",
  "Use ONLY the provided context. Do not invent facts or add unverifiable details.",
  "Return strict JSON only, no markdown, no commentary.",
  "Schema:",
  '{ "summary": string, "skills": string[], "experience": [{ "title": string, "company": string, "location": string, "dates": string, "bullets": string[] }] }',
  "Constraints:",
  "- Summary: 60-80 words, 3-4 sentences, tailored to the job description.",
  "- Skills: 12-18 items, single terms or short phrases (no commas inside an item).",
  "- Experience: 2-3 entries, 2-3 bullets each, <= 18 words per bullet.",
  "- Prefer software engineering roles and projects most relevant to the job description.",
  "- If a field is not supported by the context, leave it empty instead of guessing.",
  "Output JSON only."
].join("\n");

function printUsage() {
  console.log(
    [
      "Usage: pnpm exec tsc -p scripts/ai/tsconfig.json && node .tmp/chatbot-build/generate-tailored-resume.js [options]",
      "",
      "Options:",
      "  --job <path>         Path to job description text file (default: apps/job-studio/job-description-compact.txt).",
      "  --job-text <text>    Inline job description text.",
      "  --out <path>         Output markdown path (default: apps/job-studio/tailored-resume.md).",
      "  --json-out <path>    Optional JSON output path (raw model output after normalization).",
      "  --locale <en|ja|zh>  Locale for context fields (default: en).",
      "  --model <id>         OpenRouter model override.",
      "  --no-header          Skip name/headline header.",
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

  return {
    jobPath: getArg("--job"),
    jobText: getArg("--job-text"),
    outPath: getArg("--out") ?? DEFAULT_OUT,
    jsonOutPath: getArg("--json-out"),
    locale,
    model: getArg("--model"),
    noHeader: args.includes("--no-header")
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

function normalizeBullet(value: string): string {
  return normalizeText(value).replace(/^[-*\u2022]\s+/, "");
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

function trimWords(value: string, maxWords: number): string {
  const words = normalizeText(value).split(" ").filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(" ");
  }
  return words.slice(0, maxWords).join(" ");
}

function dedupeList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item);
  }
  return result;
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

function buildUserPrompt(jobDescription: string, context: ReturnType<typeof buildContext>): string {
  const payload = JSON.stringify(
    {
      jobDescription: normalizeText(jobDescription),
      context
    },
    null,
    2
  );
  return payload;
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

function extractJsonPayload(text: string): string | null {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1).trim();
}

function normalizeOutput(payload: unknown): ResumeOutput {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const summary = typeof data.summary === "string" ? normalizeText(data.summary) : "";
  const rawSkills = Array.isArray(data.skills) ? data.skills : [];
  const skills = dedupeList(
    rawSkills
      .map((item) => (typeof item === "string" ? normalizeText(item) : ""))
      .filter(Boolean)
  ).slice(0, 18);

  const rawExperience = Array.isArray(data.experience) ? data.experience : [];
  const experience = rawExperience
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const title = typeof entry.title === "string" ? normalizeText(entry.title) : "";
      const company = typeof entry.company === "string" ? normalizeText(entry.company) : "";
      const location = typeof entry.location === "string" ? normalizeText(entry.location) : "";
      const dates = typeof entry.dates === "string" ? normalizeText(entry.dates) : "";
      const bullets = Array.isArray(entry.bullets)
        ? entry.bullets
            .map((bullet) => (typeof bullet === "string" ? normalizeBullet(bullet) : ""))
            .filter(Boolean)
            .slice(0, 3)
        : [];
      return { title, company, location, dates, bullets };
    })
    .filter(Boolean)
    .slice(0, 3) as ResumeOutput["experience"];

  return {
    summary: trimWords(summary, 80),
    skills,
    experience: experience.map((entry) => ({
      ...entry,
      bullets: entry.bullets.map((bullet) => trimWords(bullet, 18))
    }))
  };
}

function formatExperienceTitle(title: string): string {
  let result = title;
  if (/Undergraduate Teaching Assistant/i.test(result)) {
    result = result.replace(/Undergraduate Teaching Assistant/i, "TA");
    result = result.replace(/SER\s*321\s*\(([^)]+)\)/i, "$1");
    result = result.replace(/^TA,\s*/i, "TA for ");
    result = result.replace(/\s*\(SER\s*321\)\s*/i, "");
  }
  return result;
}

function formatExperienceHeader(entry: ResumeOutput["experience"][number]): string {
  const title = entry.title.toLowerCase();
  const company = entry.company.toLowerCase();
  const taMatch = /teaching assistant|\bta\b/.test(title);
  const contextMatch = /arizona state|distributed software systems|ser\s*321/.test(
    `${title} ${company}`
  );

  if (taMatch && contextMatch) {
    return "TA for Distributed Software Systems, Arizona State University — Remote | March – May 2024";
  }

  const formattedTitle = [formatExperienceTitle(entry.title), entry.company]
    .filter(Boolean)
    .join(", ");
  const meta = [entry.location, entry.dates].filter(Boolean).join(" | ");
  return [formattedTitle, meta].filter(Boolean).join(" — ");
}

function renderMarkdown(
  output: ResumeOutput,
  options: { includeHeader: boolean; basics?: { name?: string; headline?: string } }
): string {
  const lines: string[] = [];

  if (options.includeHeader && options.basics?.name) {
    lines.push(`# ${options.basics.name}`);
    if (options.basics.headline) {
      lines.push(options.basics.headline);
    }
    lines.push("");
  }

  lines.push("## Summary");
  lines.push(output.summary || "");
  lines.push("");

  lines.push("## Tech");
  lines.push(output.skills.length ? output.skills.join(" · ") : "");
  lines.push("");

  lines.push("## Experience");
  if (!output.experience.length) {
    lines.push("");
  } else {
    output.experience.forEach((entry) => {
      const header = formatExperienceHeader(entry);
      if (header) {
        lines.push(header);
      }
      entry.bullets.forEach((bullet) => {
        lines.push(`- ${bullet}`);
      });
      lines.push("");
    });
  }

  return lines.join("\n").trimEnd() + "\n";
}

function logWarnings(output: ResumeOutput) {
  if (!output.summary) {
    console.warn("[resume] Warning: summary is empty.");
  }
  if (output.skills.length < 12) {
    console.warn(`[resume] Warning: expected 12+ skills, got ${output.skills.length}.`);
  }
  if (output.experience.length < 2) {
    console.warn(
      `[resume] Warning: expected 2+ experience entries, got ${output.experience.length}.`
    );
  }
}

async function readJobDescription(options: CliOptions): Promise<string> {
  if (options.jobText) {
    return options.jobText;
  }
  if (options.jobPath) {
    const repoRoot = resolveRepoRoot();
    const resolved = path.isAbsolute(options.jobPath)
      ? options.jobPath
      : path.resolve(repoRoot, options.jobPath);
    return fsPromises.readFile(resolved, "utf8");
  }

  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        data += chunk;
      });
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }

  const repoRoot = resolveRepoRoot();
  const defaultPath = path.resolve(repoRoot, DEFAULT_JOB);
  if (fs.existsSync(defaultPath)) {
    return fsPromises.readFile(defaultPath, "utf8");
  }

  throw new Error(
    "No job description provided. Use --job, --job-text, stdin, or add apps/job-studio/job-description-compact.txt."
  );
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
    "X-Title": "Portfolio Resume Generator"
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
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1400
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

async function main() {
  const options = parseArgs(process.argv);
  const jobDescription = normalizeText(await readJobDescription(options));
  if (!jobDescription) {
    throw new Error("Job description is empty.");
  }
  loadLocalEnv();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable.");
  }

  const model =
    options.model ||
    process.env.OPENROUTER_RESUME_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "openrouter/auto";

  const context = buildContext(options.locale);
  const userPrompt = buildUserPrompt(jobDescription, context);
  const rawResponse = await callOpenRouter({
    apiKey,
    model,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt
  });

  const jsonPayload = extractJsonPayload(rawResponse);
  if (!jsonPayload) {
    throw new Error("Failed to extract JSON from OpenRouter response.");
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${(error as Error).message}`);
  }

  const normalized = normalizeOutput(parsed);
  logWarnings(normalized);
  const markdown = renderMarkdown(normalized, {
    includeHeader: !options.noHeader,
    basics: context.basics
  });

  const repoRoot = resolveRepoRoot();
  const outputPath = path.resolve(repoRoot, options.outPath);
  await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
  await fsPromises.writeFile(outputPath, markdown, "utf8");

  if (options.jsonOutPath) {
    const jsonPath = path.resolve(repoRoot, options.jsonOutPath);
    await fsPromises.mkdir(path.dirname(jsonPath), { recursive: true });
    await fsPromises.writeFile(jsonPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  }

  console.log(`Wrote tailored resume to ${path.relative(repoRoot, outputPath)}`);
}

main().catch((error) => {
  console.error("[resume] Failed:", error);
  process.exit(1);
});
