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

type ResumeExperience = {
  role?: string;
  company?: string;
  location?: string;
  start?: string;
  end?: string;
  summary?: string;
  highlights?: string[];
};

type ResumeEducation = {
  institution?: string;
  credential?: string;
  status?: string;
  graduation?: string;
  gpa?: number;
  notes?: string[];
};

type ResumeJson = {
  education?: ResumeEducation[];
  experience?: ResumeExperience[];
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

type AnchorLocales = Partial<
  Record<
    Locale,
    {
      name: string;
      href: string;
    }
  >
>;

type AnchorEntry = {
  id: string;
  category: "tech" | "experience" | "education";
  source: string;
  locales: AnchorLocales;
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

type AggregatedEmbedding = {
  id: string;
  sourceType: AnchorEntry["category"];
  sourceId: string;
  locales: Partial<
    Record<
      Locale,
      {
        title: string;
        href: string;
        tokens: string[];
        text: string;
      }
    >
  >;
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60) || "entry";
}

function buildAnchorEntries(techEntries: TechStackEntry[], projects: ProjectRecord[]): AnchorEntry[] {
  const anchorMap = new Map<string, AnchorEntry>();

  const addAnchor = (
    id: string,
    category: AnchorEntry["category"],
    source: string,
    locale: Locale,
    name: string,
    href: string
  ) => {
    const key = `${id}::${category}`;
    const existing = anchorMap.get(key) ?? { id, category, source, locales: {} };
    existing.locales[locale] = { name, href };
    anchorMap.set(key, existing);
  };

  for (const locale of locales) {
    for (const tech of techEntries) {
      const title = localizeString(tech.title, locale) || tech.id;
      addAnchor(tech.id, "tech", "tech-stack-details", locale, title, `/${locale}/experience#${tech.id}`);
    }

    for (const project of projects) {
      if (!project.experienceEntry) continue;
      const { id } = project.experienceEntry;
      const name = localizeString(project.experienceEntry.company, locale) || id;
      addAnchor(id, "experience", project.id, locale, name, `/${locale}/experience#${id}`);
    }
  }

  return Array.from(anchorMap.values());
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

function buildResumeExperienceChunks(
  experiences: ResumeExperience[] | undefined,
  locale: Locale,
  slugCounts: Map<string, number>
): EmbeddingChunk[] {
  const chunks: EmbeddingChunk[] = [];

  for (const entry of experiences ?? []) {
    const base = slugify(entry.company || entry.role || "experience");
    const suffix = slugCounts.get(base) ?? 0;
    const id = suffix === 0 ? base : `${base}-${suffix}`;
    slugCounts.set(base, suffix + 1);

    const title = entry.company || entry.role || "Experience";
    const timeframe = [entry.start, entry.end].filter(Boolean).join(" – ");
    const text = sanitizeText(
      [title, entry.role, entry.location, timeframe, entry.summary, (entry.highlights ?? []).join(" ")].filter(Boolean).join(" ")
    );

    if (!text) continue;

    chunks.push({
      id: `experience-${id}-${locale}`,
      locale,
      title,
      href: `/resume.pdf`,
      sourceType: "experience",
      sourceId: id,
      tokens: tokenize(text),
      text
    });
  }

  return chunks;
}

function buildResumeEducationChunks(
  education: ResumeEducation[] | undefined,
  locale: Locale,
  slugCounts: Map<string, number>
): EmbeddingChunk[] {
  const chunks: EmbeddingChunk[] = [];

  for (const entry of education ?? []) {
    const base = slugify(entry.institution || entry.credential || "education");
    const suffix = slugCounts.get(base) ?? 0;
    const id = suffix === 0 ? base : `${base}-${suffix}`;
    slugCounts.set(base, suffix + 1);

    const title = entry.institution || entry.credential || "Education";
    const metadata = [entry.credential, entry.status, entry.graduation, entry.gpa ? `GPA ${entry.gpa}` : ""]
      .filter(Boolean)
      .join(", ");
    const text = sanitizeText(
      [title, metadata, (entry.notes ?? []).join(" ")].filter(Boolean).join(" ")
    );

    if (!text) continue;

    chunks.push({
      id: `education-${id}-${locale}`,
      locale,
      title,
      href: `/resume.pdf`,
      sourceType: "education",
      sourceId: id,
      tokens: tokenize(text),
      text
    });
  }

  return chunks;
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
const resumePath = path.join(root, "content", "resume.json");
const projectsDir = path.join(dataDir, "projects");

const techStackPath = path.join(dataDir, "tech-stack-details.json");
const techEntries = readJson<TechStackEntry[]>(techStackPath);
const resume = readJson<ResumeJson>(resumePath);
const projectFiles = fs
  .readdirSync(projectsDir)
  .filter(
    (file) =>
      file.endsWith(".json") &&
      !file.includes("template-project") &&
      !file.includes("experience-template-project") &&
      !file.startsWith("template")
  );
const projects: ProjectRecord[] = projectFiles.map((file) =>
  readJson<ProjectRecord>(path.join(projectsDir, file))
);
const anchors = buildAnchorEntries(techEntries, projects);
  const embeddingMap = new Map<string, AggregatedEmbedding>();
  const slugCounts = new Map<string, number>();

  const addEmbedding = (chunk: EmbeddingChunk) => {
    const key = `${chunk.sourceType}::${chunk.sourceId}`;
    const existing = embeddingMap.get(key) ?? {
      id: `${chunk.sourceType}-${chunk.sourceId}`,
      sourceType: chunk.sourceType,
      sourceId: chunk.sourceId,
      locales: {}
    };

    existing.locales[chunk.locale] = {
      title: chunk.title,
      href: chunk.href,
      tokens: chunk.tokens,
      text: chunk.text
    };

    embeddingMap.set(key, existing);
  };

  for (const locale of locales) {
    slugCounts.clear();

    for (const tech of techEntries) {
      if (tech.id.includes("template")) continue;
      const chunk = buildTechChunks(tech, locale);
      if (chunk) {
        addEmbedding(chunk);
      }
    }

    for (const project of projects) {
      if (!project.experienceEntry || project.experienceEntry.id?.includes("template")) continue;
      const chunk = buildProjectChunks(project, locale);
      if (chunk) {
        addEmbedding(chunk);
      }
    }

    for (const chunk of buildResumeExperienceChunks(resume.experience, locale, slugCounts)) {
      addEmbedding(chunk);
    }

    for (const chunk of buildResumeEducationChunks(resume.education, locale, slugCounts)) {
      addEmbedding(chunk);
    }
  }

  const now = new Date().toISOString();
  const aggregatedChunks = Array.from(embeddingMap.values());

  await writeJson(path.join(aiDir, "tech-anchors.json"), {
    generatedAt: now,
    anchors
  });

  await writeJson(path.join(aiDir, "chatbot-embeddings.json"), {
    generatedAt: now,
    tokenizer: "bow-v1",
    hash: crypto.createHash("sha256").update(JSON.stringify(aggregatedChunks)).digest("hex"),
    chunks: aggregatedChunks
  });

  console.log(
    `Wrote ${anchors.length} anchors and ${aggregatedChunks.length} aggregated chunks to ${aiDir.replace(
      `${root}/`,
      ""
    )}`
  );
}

main().catch((error) => {
  console.error("[chatbot-index] Failed to build index:", error);
  process.exit(1);
});
