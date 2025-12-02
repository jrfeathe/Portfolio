#!/usr/bin/env node

// Build a lightweight retrieval corpus for the AI chatbot.
// Sources: tech-stack details, project experience entries, and resume summary.

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type Locale = "en" | "ja" | "zh";

type LocalizedString = Partial<Record<Locale, string>> | string;
type LocalizedStringList = Partial<Record<Locale, string[]>> | string[];

type TechStackEntry = {
  id: string;
  title: LocalizedString;
  context?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedStringList;
};

type ProjectExperience = {
  id: string;
  company: LocalizedString;
  role: LocalizedString;
  timeframe?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedStringList;
};

type ProjectRecord = {
  id: string;
  experienceEntry?: ProjectExperience;
};

type ResumeJson = {
  summary?: {
    scope?: string;
    positioning?: string;
    strengths?: string[];
  };
  experience?: Array<{
    role?: string;
    company?: string;
    summary?: string;
    highlights?: string[];
    stack?: string[];
  }>;
  skills?: {
    languages?: Array<{ name?: string; proficiency?: string }>;
    frameworks?: Array<{ name?: string; proficiency?: string }>;
    tools?: Array<{ name?: string; proficiency?: string }>;
  };
};

type AnchorEntry = {
  id: string;
  name: string;
  href: string;
  locale: Locale;
  category: "tech" | "experience" | "resume";
  source: string;
};

type EmbeddingChunk = {
  id: string;
  locale: Locale;
  title: string;
  href: string;
  sourceType: AnchorEntry["category"];
  sourceId: string;
  tokens: string[];
  text: string;
};

const locales: Locale[] = ["en", "ja", "zh"];
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "was", "were", "have", "has",
  "had", "from", "into", "about", "while", "without", "can", "will", "would", "could",
  "a", "an", "of", "to", "in", "on", "by", "at", "as", "is", "it", "be", "or", "but",
  "not", "than", "then", "so", "if", "when", "what", "which", "who", "whom", "how",
  "do", "did", "done", "just", "also"
]);

function resolvePath(candidates: string[]): string {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`None of the candidate paths exist: ${candidates.join(", ")}`);
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function localizeString(value: LocalizedString | undefined, locale: Locale): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value[locale] || value.en || "";
}

function localizeList(value: LocalizedStringList | undefined, locale: Locale): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return value[locale] || value.en || [];
}

function sanitizeText(text: string): string {
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted email]")
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[redacted phone]")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return Array.from(new Set(tokens));
}

function buildAnchorEntries(
  techEntries: TechStackEntry[],
  projects: ProjectRecord[]
): AnchorEntry[] {
  const anchors: AnchorEntry[] = [];

  for (const locale of locales) {
    for (const tech of techEntries) {
      const title = localizeString(tech.title, locale) || tech.id;
      anchors.push({
        id: tech.id,
        name: title,
        href: `/${locale}/experience#${tech.id}`,
        locale,
        category: "tech",
        source: "tech-stack-details"
      });
    }

    for (const project of projects) {
      if (!project.experienceEntry) continue;
      const { id } = project.experienceEntry;
      anchors.push({
        id,
        name: localizeString(project.experienceEntry.company, locale) || id,
        href: `/${locale}/experience#${id}`,
        locale,
        category: "experience",
        source: project.id
      });
    }

    anchors.push({
      id: "resume",
      name: "Resume",
      href: "/resume.pdf",
      locale,
      category: "resume",
      source: "resume-json"
    });
  }

  return anchors;
}

function buildTechChunks(entry: TechStackEntry, locale: Locale): EmbeddingChunk | null {
  const title = localizeString(entry.title, locale) || entry.id;
  const context = localizeString(entry.context, locale);
  const summary = localizeString(entry.summary, locale);
  const highlights = localizeList(entry.highlights, locale).join(" ");
  const text = sanitizeText([title, context, summary, highlights].filter(Boolean).join(" "));

  if (!text) {
    return null;
  }

  return {
    id: `tech-${entry.id}-${locale}`,
    locale,
    title,
    href: `/${locale}/experience#${entry.id}`,
    sourceType: "tech",
    sourceId: entry.id,
    tokens: tokenize(text),
    text
  };
}

function buildProjectChunks(project: ProjectRecord, locale: Locale): EmbeddingChunk | null {
  if (!project.experienceEntry) {
    return null;
  }

  const { id } = project.experienceEntry;
  const title = localizeString(project.experienceEntry.company, locale) || id;
  const role = localizeString(project.experienceEntry.role, locale);
  const summary = localizeString(project.experienceEntry.summary, locale);
  const highlights = localizeList(project.experienceEntry.highlights, locale).join(" ");
  const text = sanitizeText([title, role, summary, highlights].filter(Boolean).join(" "));

  if (!text) {
    return null;
  }

  return {
    id: `experience-${id}-${locale}`,
    locale,
    title,
    href: `/${locale}/experience#${id}`,
    sourceType: "experience",
    sourceId: id,
    tokens: tokenize(text),
    text
  };
}

function buildResumeChunks(resume: ResumeJson, locale: Locale): EmbeddingChunk | null {
  const summaryParts = [
    resume.summary?.scope,
    resume.summary?.positioning,
    ...(resume.summary?.strengths ?? [])
  ];

  const experienceParts =
    resume.experience?.slice(0, 3).map((entry) =>
      [entry.role, entry.company, entry.summary, ...(entry.highlights ?? [])].filter(Boolean).join(" ")
    ) ?? [];

  const skillParts: string[] = [];
  for (const group of [resume.skills?.languages, resume.skills?.frameworks, resume.skills?.tools]) {
    if (!group) continue;
    for (const item of group) {
      if (item?.name) {
        skillParts.push(item.proficiency ? `${item.name} (${item.proficiency})` : item.name);
      }
    }
  }

  const text = sanitizeText(
    [...summaryParts, ...experienceParts, skillParts.join(", ")].filter(Boolean).join(" ")
  );

  if (!text) {
    return null;
  }

  return {
    id: `resume-${locale}`,
    locale,
    title: "Resume overview",
    href: "/resume.pdf",
    sourceType: "resume",
    sourceId: "resume",
    tokens: tokenize(text),
    text
  };
}

async function writeJson(filePath: string, payload: unknown) {
  const serialized = JSON.stringify(payload, null, 2);
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, `${serialized}\n`, "utf8");
}

async function main() {
  const root = process.cwd();
  const dataDir = resolvePath([
    path.join(root, "apps", "site", "data"),
    path.join(root, "data")
  ]);
  const aiDir = path.join(dataDir, "ai");
  const projectsDir = path.join(dataDir, "projects");

  const techStackPath = path.join(dataDir, "tech-stack-details.json");
  const resumePath = resolvePath([
    path.join(root, "content", "resume.json"),
    path.join(root, "..", "..", "content", "resume.json")
  ]);

  const techEntries = readJson<TechStackEntry[]>(techStackPath);
  const projectFiles = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".json"));
  const projects: ProjectRecord[] = projectFiles.map((file) =>
    readJson<ProjectRecord>(path.join(projectsDir, file))
  );
  const resume = readJson<ResumeJson>(resumePath);

  const anchors = buildAnchorEntries(techEntries, projects);
  const chunks: EmbeddingChunk[] = [];

  for (const locale of locales) {
    for (const tech of techEntries) {
      const chunk = buildTechChunks(tech, locale);
      if (chunk) {
        chunks.push(chunk);
      }
    }

    for (const project of projects) {
      const chunk = buildProjectChunks(project, locale);
      if (chunk) {
        chunks.push(chunk);
      }
    }

    const resumeChunk = buildResumeChunks(resume, locale);
    if (resumeChunk) {
      chunks.push(resumeChunk);
    }
  }

  const now = new Date().toISOString();

  await writeJson(path.join(aiDir, "tech-anchors.json"), {
    generatedAt: now,
    anchors
  });

  await writeJson(path.join(aiDir, "chatbot-embeddings.json"), {
    generatedAt: now,
    tokenizer: "bow-v1",
    hash: crypto.createHash("sha256").update(JSON.stringify(chunks)).digest("hex"),
    chunks
  });

  console.log(
    `Wrote ${anchors.length} anchors and ${chunks.length} chunks to ${aiDir.replace(
      `${root}/`,
      ""
    )}`
  );
}

main().catch((error) => {
  console.error("[chatbot-index] Failed to build index:", error);
  process.exit(1);
});
