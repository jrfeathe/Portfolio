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

type ResumeProfileLink = {
  label?: LocalizedString;
  url?: LocalizedString;
};

type ResumeBasics = {
  name?: LocalizedString;
  headline?: LocalizedString;
  profiles?: ResumeProfileLink[];
};

type ResumeLanguage = {
  language?: LocalizedString;
  proficiency?: LocalizedString;
};

type ResumeSkills = {
  languages_spoken?: ResumeLanguage[];
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
  status?: LocalizedString;
  graduation?: LocalizedString;
  gpa?: number;
  notes?: LocalizedString[];
};

type ResumeValueField = {
  value?: LocalizedString;
  label?: LocalizedString;
};

type ResumeAvailability = {
  start_date?: ResumeValueField;
  timezone?: {
    label?: LocalizedString;
    collaboration_window?: LocalizedString;
  };
};

type ResumeEligibility = {
  us_status?: ResumeValueField;
};

type ResumeJson = {
  basics?: ResumeBasics;
  skills?: ResumeSkills;
  education?: ResumeEducation[];
  experience?: ResumeExperience[];
  availability?: ResumeAvailability;
  eligibility?: ResumeEligibility;
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

type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
type QuarterHourKey = "0" | "15" | "30" | "45";
type QuarterHourMap = Record<QuarterHourKey, boolean>;
type AvailabilityDay = Record<string, Partial<QuarterHourMap>>;
type AvailabilityData = {
  timezone: string;
  intervalMinutes: number;
  hiddenHours?: string[];
  days: Partial<Record<Weekday, AvailabilityDay>>;
};

type DaySummary = {
  day: Weekday;
  ranges: Array<{ start: string; end: string }>;
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

type AnchorCategory = "tech" | "experience" | "education" | "availability" | "resume" | "behavioral";

type AnchorEntry = {
  id: string;
  category: AnchorCategory;
  source: string;
  locales: AnchorLocales;
};

type EmbeddingChunk = {
  id: string;
  locale: Locale;
  title: string;
  href: string;
  sourceType: AnchorCategory;
  sourceId: string;
  tokens: string[];
  text: string;
};

type AggregatedEmbedding = {
  id: string;
  sourceType: AnchorCategory;
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
const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const QUARTER_STRINGS: QuarterHourKey[] = ["0", "15", "30", "45"];
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "was", "were", "have", "has",
  "had", "from", "into", "about", "while", "without", "can", "will", "would", "could",
  "a", "an", "of", "to", "in", "on", "by", "at", "as", "is", "it", "be", "or", "but",
  "not", "than", "then", "so", "if", "when", "what", "which", "who", "whom", "how",
  "do", "did", "done", "just", "also", "experience"
]);
const SHORT_TOKENS = new Set(["ai", "ui", "ux", "ml", "ci", "cd", "k8s"]);
const LATIN_TOKEN = /[a-z0-9][a-z0-9+.#-]*/gi;
const PUNCTUATION_ONLY = /^[\p{P}\p{S}]+$/u;
const CJK_TOKEN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const JAPANESE_DROP_POS = new Set(["助詞", "助動詞", "記号", "フィラー"]);
const NAME_ALIAS_TOKENS = new Map<string, string[]>([
  ["ジャク", ["jack"]],
  ["ジャクさん", ["jack"]],
  ["夹克", ["jack"]]
]);

type KuromojiToken = {
  surface_form?: string;
  pos?: string;
  basic_form?: string;
};

type KuromojiTokenizer = {
  tokenize: (text: string) => KuromojiToken[];
};

type JiebaTokenizer = {
  cut: (sentence: string | Uint8Array, hmm?: boolean | undefined | null) => string[];
};

let jaTokenizer: KuromojiTokenizer | null = null;
let zhTokenizer: JiebaTokenizer | null = null;

const AVAILABILITY_DAY_LABELS: Record<Locale, Record<Weekday, string>> = {
  en: {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday"
  },
  ja: {
    sun: "日曜日",
    mon: "月曜日",
    tue: "火曜日",
    wed: "水曜日",
    thu: "木曜日",
    fri: "金曜日",
    sat: "土曜日"
  },
  zh: {
    sun: "星期日",
    mon: "星期一",
    tue: "星期二",
    wed: "星期三",
    thu: "星期四",
    fri: "星期五",
    sat: "星期六"
  }
};

const availabilityAnchorLocales: AnchorLocales = {
  en: { name: "Availability & meetings", href: "/en/meetings" },
  ja: { name: "面談可能時間", href: "/ja/meetings" },
  zh: { name: "可会面时间", href: "/zh/meetings" }
};

const resumeAnchorLocales: AnchorLocales = {
  en: { name: "Resume", href: "/resume.pdf" },
  ja: { name: "Resume", href: "/resume.pdf" },
  zh: { name: "Resume", href: "/resume.pdf" }
};

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

function readOptionalText(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf8");
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

function resolveKuromojiDictPath() {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (root: string) => {
    if (!root || seen.has(root)) return;
    seen.add(root);
    candidates.push(root);
  };

  try {
    const packageRoot = path.dirname(require.resolve("kuromoji/package.json"));
    const resolvedRoot = path.isAbsolute(packageRoot)
      ? packageRoot
      : path.resolve(process.cwd(), packageRoot);
    addCandidate(resolvedRoot);
  } catch {
    // Ignore and fall back to scanning for node_modules.
  }

  const addFrom = (start: string) => {
    let current = start;
    for (let depth = 0; depth < 6; depth += 1) {
      addCandidate(path.join(current, "node_modules", "kuromoji"));
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  };

  addFrom(process.cwd());

  for (const root of candidates) {
    const dictPath = path.join(root, "dict");
    if (fs.existsSync(path.join(dictPath, "base.dat.gz"))) {
      return dictPath;
    }
  }

  const fallbackRoot = candidates[0] ?? process.cwd();
  return path.join(fallbackRoot, "dict");
}

async function initTokenizers() {
  if (jaTokenizer && zhTokenizer) {
    return;
  }

  if (!jaTokenizer) {
    const kuromoji = require("kuromoji") as {
      builder: (options: { dicPath: string }) => {
        build: (cb: (err: Error | null, tokenizer?: KuromojiTokenizer) => void) => void;
      };
    };
    const dicPath = resolveKuromojiDictPath();
    jaTokenizer = await new Promise<KuromojiTokenizer>((resolve, reject) => {
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err || !tokenizer) {
          reject(err ?? new Error("Failed to build kuromoji tokenizer"));
          return;
        }
        resolve(tokenizer);
      });
    });
  }

  if (!zhTokenizer) {
    const { Jieba } = require("@node-rs/jieba") as {
      Jieba: { withDict: (dict: Uint8Array) => JiebaTokenizer };
    };
    const { dict } = require("@node-rs/jieba/dict") as { dict: Uint8Array };
    zhTokenizer = Jieba.withDict(dict);
  }
}

function addLatinToken(tokens: Set<string>, raw: string) {
  const normalized = raw.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
  if (!normalized) return;

  const expanded = new Set<string>();
  expanded.add(normalized);

  if (normalized === "c++" || normalized.includes("c++")) {
    expanded.add("c++");
    expanded.add("cpp");
  }
  if (normalized === "c#") {
    expanded.add("csharp");
  }

  if (normalized.includes(".") || normalized.includes("-")) {
    normalized.split(/[.-]/).forEach((part) => part && expanded.add(part));
  }

  const stripped = normalized.replace(/[+#.]/g, "");
  if (stripped && stripped !== normalized) {
    expanded.add(stripped);
  }

  for (const token of expanded) {
    if (STOP_WORDS.has(token)) continue;
    if (token.length < 3 && !SHORT_TOKENS.has(token) && !/\d/.test(token)) {
      continue;
    }
    tokens.add(token);
  }
}

function addJapaneseTokens(tokens: Set<string>, value: string) {
  if (!jaTokenizer) {
    return;
  }

  const tokenList = jaTokenizer.tokenize(value);
  for (const token of tokenList) {
    const surface = token.surface_form?.trim();
    if (!surface) continue;
    if (token.pos && JAPANESE_DROP_POS.has(token.pos)) continue;
    if (PUNCTUATION_ONLY.test(surface)) continue;

    tokens.add(surface);

    const base = token.basic_form?.trim();
    if (base && base !== "*" && base !== surface) {
      tokens.add(base);
    }
  }
}

function addChineseTokens(tokens: Set<string>, value: string) {
  if (!zhTokenizer) {
    return;
  }

  const segments = zhTokenizer.cut(value, true);
  for (const segment of segments) {
    const cleaned = segment.trim();
    if (!cleaned) continue;
    if (PUNCTUATION_ONLY.test(cleaned)) continue;
    tokens.add(cleaned);
  }
}

function addNameAliasTokens(tokens: Set<string>, rawText: string) {
  if (!CJK_TOKEN.test(rawText)) {
    return;
  }

  const hasCjkTokens = Array.from(tokens).some((token) => CJK_TOKEN.test(token));
  const normalized = hasCjkTokens ? "" : rawText.normalize("NFKC");

  for (const [alias, expansions] of NAME_ALIAS_TOKENS.entries()) {
    if (!tokens.has(alias) && (!normalized || !normalized.includes(alias))) {
      continue;
    }
    for (const token of expansions) {
      tokens.add(token);
    }
  }
}

function tokenize(text: string, locale: Locale): string[] {
  const normalized = sanitizeText(text).toLowerCase();
  const tokens = new Set<string>();

  for (const match of normalized.matchAll(LATIN_TOKEN)) {
    addLatinToken(tokens, match[0]);
  }

  if (locale === "ja") {
    addJapaneseTokens(tokens, text);
  } else if (locale === "zh") {
    addChineseTokens(tokens, text);
  }

  addNameAliasTokens(tokens, text);

  return Array.from(tokens);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60) || "entry";
}

function createQuarterMap(): QuarterHourMap {
  return QUARTER_STRINGS.reduce(
    (acc, quarter) => {
      acc[quarter] = false;
      return acc;
    },
    {} as QuarterHourMap
  );
}

function createEmptyDay(): Record<string, QuarterHourMap> {
  const day: Record<string, QuarterHourMap> = {};
  for (let hour = 0; hour < 24; hour += 1) {
    const hourKey = hour.toString().padStart(2, "0");
    day[hourKey] = createQuarterMap();
  }
  return day;
}

function createEmptyMatrix(): Record<Weekday, Record<string, QuarterHourMap>> {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = createEmptyDay();
    return acc;
  }, {} as Record<Weekday, Record<string, QuarterHourMap>>);
}

function buildAvailabilityMatrix(data: AvailabilityData): Record<Weekday, Record<string, QuarterHourMap>> {
  const matrix = createEmptyMatrix();

  WEEKDAYS.forEach((day) => {
    const sourceDay = data.days?.[day];
    if (!sourceDay) {
      return;
    }

    Object.entries(sourceDay).forEach(([hourKey, quarterMap]) => {
      if (!matrix[day][hourKey]) {
        matrix[day][hourKey] = createQuarterMap();
      }
      QUARTER_STRINGS.forEach((quarter) => {
        if (typeof quarterMap?.[quarter] === "boolean") {
          matrix[day][hourKey][quarter] = Boolean(quarterMap[quarter]);
        }
      });
    });
  });

  return matrix;
}

function toQuarterKey(minute: number): QuarterHourKey | null {
  if (minute === 0) return "0";
  if (minute === 15) return "15";
  if (minute === 30) return "30";
  if (minute === 45) return "45";
  return null;
}

function formatQuarterIndex(index: number, intervalMinutes: number): string {
  const totalMinutes = index * intervalMinutes;
  const hour = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

function summarizeAvailabilityMatrix(
  matrix: Record<Weekday, Record<string, QuarterHourMap>>,
  intervalMinutes: number
): DaySummary[] {
  const quartersPerHour = 60 / intervalMinutes;
  const quartersPerDay = quartersPerHour * 24;

  return WEEKDAYS.map((day) => {
    const ranges: Array<{ start: string; end: string }> = [];
    let currentStart: number | null = null;

    for (let quarterIndex = 0; quarterIndex < quartersPerDay; quarterIndex += 1) {
      const hour = Math.floor(quarterIndex / quartersPerHour);
      const minute = (quarterIndex % quartersPerHour) * intervalMinutes;
      const hourKey = hour.toString().padStart(2, "0");
      const quarterKey = toQuarterKey(minute);
      const isAvailable = quarterKey ? matrix[day][hourKey]?.[quarterKey] : false;

      if (isAvailable && currentStart === null) {
        currentStart = quarterIndex;
      } else if (!isAvailable && currentStart !== null) {
        ranges.push({
          start: formatQuarterIndex(currentStart, intervalMinutes),
          end: formatQuarterIndex(quarterIndex, intervalMinutes)
        });
        currentStart = null;
      }
    }

    if (currentStart !== null) {
      ranges.push({
        start: formatQuarterIndex(currentStart, intervalMinutes),
        end: formatQuarterIndex(quartersPerDay, intervalMinutes)
      });
    }

    return { day, ranges };
  });
}

function formatHour(value: number) {
  return value.toString().padStart(2, "0");
}

function formatHiddenHours(hidden?: string[]): string | null {
  if (!hidden || !hidden.length) {
    return null;
  }

  const parsed = hidden
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value < 24)
    .sort((a, b) => a - b);

  if (!parsed.length) {
    return null;
  }

  const ranges: Array<[number, number]> = [];
  let start = parsed[0];
  let previous = parsed[0];

  for (let index = 1; index < parsed.length; index += 1) {
    const current = parsed[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }
    ranges.push([start, previous]);
    start = current;
    previous = current;
  }
  ranges.push([start, previous]);

  return ranges
    .map(([rangeStart, rangeEnd]) => {
      const endDisplay = (rangeEnd + 1) % 24;
      return `${formatHour(rangeStart)}:00-${formatHour(endDisplay)}:00`;
    })
    .join(", ");
}

function buildAvailabilitySummary(data: AvailabilityData, locale: Locale): string {
  const intervalMinutes = data.intervalMinutes || 15;
  const matrix = buildAvailabilityMatrix(data);
  const summaries = summarizeAvailabilityMatrix(matrix, intervalMinutes);
  const labels = AVAILABILITY_DAY_LABELS[locale] ?? AVAILABILITY_DAY_LABELS.en;

  const dayLines = summaries
    .map(({ day, ranges }) => {
      if (!ranges.length) {
        return null;
      }
      const label = labels[day] ?? day;
      const rangeText = ranges.map((range) => `${range.start}-${range.end}`).join(", ");
      return `${label} ${rangeText}`;
    })
    .filter(Boolean) as string[];

  const timezoneNote = `Base timezone ${data.timezone}`;
  const intervalNote = `${intervalMinutes}-minute blocks`;
  const hiddenLabel = formatHiddenHours(data.hiddenHours);

  const summaryText = dayLines.length ? dayLines.join("; ") : "No recurring availability set.";
  const parts = [`${timezoneNote} (${intervalNote})`, summaryText, hiddenLabel ? `Hidden hours: ${hiddenLabel}` : null];

  return sanitizeText(parts.filter(Boolean).join(". "));
}

function buildAnchorEntries(
  techEntries: TechStackEntry[],
  projects: ProjectRecord[],
  availabilityAnchors: AnchorLocales,
  resumeAnchors: AnchorLocales
): AnchorEntry[] {
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

    const availabilityAnchor = availabilityAnchors[locale] ?? availabilityAnchors.en;
    if (availabilityAnchor?.href && availabilityAnchor?.name) {
      addAnchor(
        "availability-weekly",
        "availability",
        "availability-weekly",
        locale,
        availabilityAnchor.name,
        availabilityAnchor.href
      );
    }

    const resumeAnchor = resumeAnchors[locale] ?? resumeAnchors.en;
    if (resumeAnchor?.href && resumeAnchor?.name) {
      addAnchor("resume", "resume", "resume-json", locale, resumeAnchor.name, resumeAnchor.href);
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
    tokens: tokenize(text, locale),
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
    tokens: tokenize(text, locale),
    text
  };
}

function buildAvailabilityChunk(availability: AvailabilityData, locale: Locale): EmbeddingChunk | null {
  const anchor = availabilityAnchorLocales[locale] ?? availabilityAnchorLocales.en;
  if (!anchor?.href || !anchor?.name) {
    return null;
  }

  const text = buildAvailabilitySummary(availability, locale);
  const tokens = tokenize(text, locale);

  if (!tokens.length) {
    return null;
  }

  return {
    id: `availability-${locale}`,
    locale,
    title: anchor.name,
    href: anchor.href,
    sourceType: "availability",
    sourceId: "availability-weekly",
    tokens,
    text
  };
}

function buildResumeProfileChunk(resume: ResumeJson, locale: Locale): EmbeddingChunk | null {
  const name = localizeString(resume.basics?.name, locale);
  const headline = localizeString(resume.basics?.headline, locale);
  const profiles = (resume.basics?.profiles ?? [])
    .map((profile) => localizeString(profile.label, locale))
    .filter((label): label is string => Boolean(label));
  const languages = (resume.skills?.languages_spoken ?? [])
    .map((entry) => {
      const language = localizeString(entry.language, locale);
      if (!language) return null;
      const proficiency = localizeString(entry.proficiency, locale);
      return proficiency ? `${language} (${proficiency})` : language;
    })
    .filter((value): value is string => Boolean(value));
  const eligibility = localizeString(resume.eligibility?.us_status?.value, locale);
  const startDate = localizeString(resume.availability?.start_date?.value, locale);
  const timezoneLabel = localizeString(resume.availability?.timezone?.label, locale);
  const collaborationWindow = localizeString(
    resume.availability?.timezone?.collaboration_window,
    locale
  );

  const text = sanitizeText(
    [
      name,
      headline,
      profiles.length ? `Profiles: ${profiles.join(", ")}` : null,
      languages.length ? `Languages: ${languages.join(", ")}` : null,
      eligibility ? `Work eligibility: ${eligibility}` : null,
      startDate ? `Start date: ${startDate}` : null,
      timezoneLabel ? `Timezone: ${timezoneLabel}` : null,
      collaborationWindow ? `Collaboration window: ${collaborationWindow}` : null
    ]
      .filter(Boolean)
      .join(". ")
  );

  if (!text) {
    return null;
  }

  return {
    id: `resume-profile-${locale}`,
    locale,
    title: name || "Resume",
    href: `/resume.pdf`,
    sourceType: "resume",
    sourceId: "resume-profile",
    tokens: tokenize(text, locale),
    text
  };
}

function buildBehavioralPrinciplesChunk(text: string | null, locale: Locale): EmbeddingChunk | null {
  if (!text) return null;
  const raw = text.trim();
  if (!raw) return null;
  const titleLine = raw.split(/\r?\n/).find((line) => line.trim().startsWith("# "));
  const title = titleLine ? titleLine.replace(/^#\s*/, "").trim() : "Hidden context: Behavioral principles";
  const trimmed = sanitizeText(raw).trim();
  if (!trimmed) return null;

  return {
    id: `behavioral-principles-${locale}`,
    locale,
    title,
    href: "",
    sourceType: "behavioral",
    sourceId: "behavioral-principles",
    tokens: tokenize(trimmed, locale),
    text: trimmed
  };
}

function buildResumeExperienceChunks(
  experiences: ResumeExperience[] | undefined,
  locale: Locale,
  slugCounts: Map<string, number>
): EmbeddingChunk[] {
  const chunks: EmbeddingChunk[] = [];

  for (const entry of experiences ?? []) {
    const base = slugify(
      localizeString(entry.company, "en") || localizeString(entry.role, "en") || "experience"
    );
    const suffix = slugCounts.get(base) ?? 0;
    const id = suffix === 0 ? base : `${base}-${suffix}`;
    slugCounts.set(base, suffix + 1);

    const title =
      localizeString(entry.company, locale) ||
      localizeString(entry.role, locale) ||
      "Experience";
    const role = localizeString(entry.role, locale);
    const location = localizeString(entry.location, locale);
    const start = localizeString(entry.start, locale);
    const end = localizeString(entry.end, locale);
    const summary = localizeString(entry.summary, locale);
    const highlights = (entry.highlights ?? [])
      .map((highlight) => localizeString(highlight, locale))
      .filter((value): value is string => Boolean(value))
      .join(" ");
    const timeframe = [start, end].filter(Boolean).join(" – ");
    const text = sanitizeText(
      [title, role, location, timeframe, summary, highlights].filter(Boolean).join(" ")
    );

    if (!text) continue;

    chunks.push({
      id: `experience-${id}-${locale}`,
      locale,
      title,
      href: `/resume.pdf`,
      sourceType: "experience",
      sourceId: id,
      tokens: tokenize(text, locale),
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
    const base = slugify(
      localizeString(entry.institution, "en") ||
        localizeString(entry.credential, "en") ||
        "education"
    );
    const suffix = slugCounts.get(base) ?? 0;
    const id = suffix === 0 ? base : `${base}-${suffix}`;
    slugCounts.set(base, suffix + 1);

    const title =
      localizeString(entry.institution, locale) ||
      localizeString(entry.credential, locale) ||
      "Education";
    const credential = localizeString(entry.credential, locale);
    const status = localizeString(entry.status, locale);
    const graduation = localizeString(entry.graduation, locale);
    const notes = (entry.notes ?? [])
      .map((note) => localizeString(note, locale))
      .filter((value): value is string => Boolean(value))
      .join(" ");
    const metadata = [
      credential,
      status,
      graduation,
      entry.gpa ? `GPA ${entry.gpa}` : ""
    ]
      .filter(Boolean)
      .join(", ");
    const text = sanitizeText(
      [title, metadata, notes].filter(Boolean).join(" ")
    );

    if (!text) continue;

    chunks.push({
      id: `education-${id}-${locale}`,
      locale,
      title,
      href: `/resume.pdf`,
      sourceType: "education",
      sourceId: id,
      tokens: tokenize(text, locale),
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
  await initTokenizers();
  const dataDir = resolvePath([
    path.join(root, "apps", "site", "data"),
    path.join(root, "data")
  ]);
  const aiDir = path.join(dataDir, "ai");
  const resumePath = path.join(root, "content", "resume.json");
  const availabilityPath = path.join(dataDir, "availability", "weekly.json");
  const projectsDir = path.join(dataDir, "projects");
  const behavioralPrinciplesPath = path.join(aiDir, "behavioral-principles.md");

  const techStackPath = path.join(dataDir, "tech-stack-details.json");
  const techEntries = readJson<TechStackEntry[]>(techStackPath);
  const availability = readJson<AvailabilityData>(availabilityPath);
  const resume = readJson<ResumeJson>(resumePath);
  const behavioralPrinciplesDefaultText = readOptionalText(behavioralPrinciplesPath);
  const behavioralPrinciplesByLocale = new Map<Locale, string | null>();
  for (const locale of locales) {
    const localizedPath = path.join(aiDir, `behavioral-principles.${locale}.md`);
    const localizedText = readOptionalText(localizedPath) ?? behavioralPrinciplesDefaultText;
    behavioralPrinciplesByLocale.set(locale, localizedText);
  }
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
  const anchors = buildAnchorEntries(techEntries, projects, availabilityAnchorLocales, resumeAnchorLocales);
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

    const availabilityChunk = buildAvailabilityChunk(availability, locale);
    if (availabilityChunk) {
      addEmbedding(availabilityChunk);
    }

    const resumeProfileChunk = buildResumeProfileChunk(resume, locale);
    if (resumeProfileChunk) {
      addEmbedding(resumeProfileChunk);
    }

    const behavioralChunk = buildBehavioralPrinciplesChunk(
      behavioralPrinciplesByLocale.get(locale) ?? behavioralPrinciplesDefaultText,
      locale
    );
    if (behavioralChunk) {
      addEmbedding(behavioralChunk);
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
    tokenizer: "locale-v2",
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
