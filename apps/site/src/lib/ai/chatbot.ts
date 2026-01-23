import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { defaultLocale, type Locale } from "../../utils/i18n";

export type AnchorCategory = "tech" | "experience" | "education" | "availability" | "resume";

export type AnchorEntry = {
  id: string;
  name: string;
  href: string;
  locale: Locale;
  category: AnchorCategory;
  source: string;
};

export type EmbeddingChunk = {
  id: string;
  locale: Locale;
  title: string;
  href: string;
  sourceType: AnchorCategory;
  sourceId: string;
  tokens: string[];
  text: string;
};

type EmbeddingIndex = {
  chunks: EmbeddingChunk[];
};

export type RetrievalHit = {
  chunk: EmbeddingChunk;
  score: number;
};

type Resources = {
  instructions: string;
  anchors: AnchorEntry[];
  index: EmbeddingIndex;
};

export type ContextFact = {
  title: string;
  detail: string;
  href: string;
  sourceType: AnchorCategory;
  sourceId: string;
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "was", "were", "have", "has",
  "had", "from", "into", "about", "while", "without", "can", "will", "would", "could",
  "a", "an", "of", "to", "in", "on", "by", "at", "as", "is", "it", "be", "or", "but",
  "not", "than", "then", "so", "if", "when", "what", "which", "who", "whom", "how",
  "do", "did", "done", "does", "just", "also", "experience"
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

const require = createRequire(import.meta.url);
let tokenizerPromise: Promise<{ ja?: KuromojiTokenizer; zh?: JiebaTokenizer }> | null = null;

const AI_PATH_CANDIDATES = [
  path.join(process.cwd(), "apps", "site", "data", "ai"),
  path.join(process.cwd(), "data", "ai")
];

const SUPPORTED_LOCALES: Locale[] = ["en", "ja", "zh"];

let cachedInstructions: string | null = null;
let cachedAnchors: AnchorEntry[] | null = null;
let cachedIndex: EmbeddingIndex | null = null;

function resolveAiPath(fileName: string) {
  for (const candidate of AI_PATH_CANDIDATES) {
    const resolved = path.join(candidate, fileName);
    if (fsSync.existsSync(resolved)) {
      return resolved;
    }
  }
  throw new Error(`AI asset "${fileName}" not found in any candidate path.`);
}

export function sanitizeText(text: string): string {
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
    if (fsSync.existsSync(path.join(dictPath, "base.dat.gz"))) {
      return dictPath;
    }
  }

  const fallbackRoot = candidates[0] ?? process.cwd();
  return path.join(fallbackRoot, "dict");
}

async function loadTokenizers(): Promise<{ ja?: KuromojiTokenizer; zh?: JiebaTokenizer }> {
  if (tokenizerPromise) {
    return tokenizerPromise;
  }

  tokenizerPromise = (async () => {
    const tokenizers: { ja?: KuromojiTokenizer; zh?: JiebaTokenizer } = {};

    try {
      const kuromoji = require("kuromoji") as {
        builder: (options: { dicPath: string }) => {
          build: (cb: (err: Error | null, tokenizer?: KuromojiTokenizer) => void) => void;
        };
      };
      const dicPath = resolveKuromojiDictPath();
      tokenizers.ja = await new Promise<KuromojiTokenizer>((resolve, reject) => {
        kuromoji.builder({ dicPath }).build((err, tokenizer) => {
          if (err || !tokenizer) {
            reject(err ?? new Error("Failed to build kuromoji tokenizer"));
            return;
          }
          resolve(tokenizer);
        });
      });
    } catch (error) {
      console.warn("[chatbot] Failed to initialize kuromoji tokenizer:", error);
    }

    try {
      const { Jieba } = require("@node-rs/jieba") as {
        Jieba: { withDict: (dict: Uint8Array) => JiebaTokenizer };
      };
      const { dict } = require("@node-rs/jieba/dict") as { dict: Uint8Array };
      tokenizers.zh = Jieba.withDict(dict);
    } catch (error) {
      console.warn("[chatbot] Failed to initialize jieba tokenizer:", error);
    }

    return tokenizers;
  })();

  return tokenizerPromise;
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

function addJapaneseTokens(tokens: Set<string>, value: string, tokenizer?: KuromojiTokenizer) {
  if (!tokenizer) {
    return;
  }

  const tokenList = tokenizer.tokenize(value);
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

function addChineseTokens(tokens: Set<string>, value: string, tokenizer?: JiebaTokenizer) {
  if (!tokenizer) {
    return;
  }

  const segments = tokenizer.cut(value, true);
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

export async function tokenize(text: string, locale: Locale): Promise<string[]> {
  const normalized = sanitizeText(text).toLowerCase();
  const tokens = new Set<string>();

  for (const match of normalized.matchAll(LATIN_TOKEN)) {
    addLatinToken(tokens, match[0]);
  }

  if (locale === "ja" || locale === "zh") {
    const tokenizers = await loadTokenizers();
    if (locale === "ja") {
      addJapaneseTokens(tokens, text, tokenizers.ja);
    } else {
      addChineseTokens(tokens, text, tokenizers.zh);
    }
  }

  addNameAliasTokens(tokens, text);

  return Array.from(tokens);
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  const addAll = (values: string[]) => values.forEach((value) => expanded.add(value));

  for (const token of tokens) {
    if (token.endsWith("ship")) {
      expanded.add(token.replace(/ship$/, ""));
    }
    if (token.endsWith("ing")) {
      expanded.add(token.replace(/ing$/, ""));
    }
    if (token.endsWith("ed")) {
      expanded.add(token.replace(/ed$/, ""));
    }

    switch (token) {
      case "leadership":
        addAll(["lead", "leader", "mentoring", "mentor", "team"]);
        break;
      case "mentor":
      case "mentoring":
        addAll(["mentor", "mentored", "mentoring", "ta", "assistant"]);
        break;
      case "teaching":
      case "assistant":
      case "ta":
        addAll(["ta", "teaching", "assistant", "mentor", "mentoring"]);
        break;
      case "cost":
      case "costs":
      case "saving":
      case "savings":
      case "save":
      case "spend":
      case "budget":
      case "efficiency":
      case "efficient":
      case "optimize":
      case "optimization":
      case "reduce":
      case "reducing":
      case "money":
        addAll(["performance", "reliability", "observability", "efficiency"]);
        break;
      default:
        break;
    }
  }

  return Array.from(expanded);
}

async function loadInstructions() {
  if (cachedInstructions) {
    return cachedInstructions;
  }
  const instructionsPath = resolveAiPath("chatbot-instructions.md");
  cachedInstructions = await fs.readFile(instructionsPath, "utf8");
  return cachedInstructions;
}

async function loadAnchors() {
  if (cachedAnchors) {
    return cachedAnchors;
  }
  const anchorsPath = resolveAiPath("tech-anchors.json");
  const raw = await fs.readFile(anchorsPath, "utf8");
  const parsed = JSON.parse(raw) as {
    anchors?: Array<{
      id: string;
      category: AnchorEntry["category"];
      source: string;
      locales?: Partial<
        Record<
          Locale | string,
          {
            name?: string;
            href?: string;
          }
        >
      >;
    }>;
  };

  const flattened: AnchorEntry[] = [];
  for (const anchor of parsed.anchors ?? []) {
    const localeEntries = Object.entries(anchor.locales ?? {});
    for (const [localeKey, localeData] of localeEntries) {
      if (!localeData?.href || !localeData?.name) {
        continue;
      }
      if (!SUPPORTED_LOCALES.includes(localeKey as Locale)) {
        continue;
      }
      flattened.push({
        id: anchor.id,
        name: localeData.name,
        href: localeData.href,
        locale: localeKey as Locale,
        category: anchor.category,
        source: anchor.source
      });
    }
  }

  cachedAnchors = flattened;
  return cachedAnchors;
}

async function loadEmbeddingIndex(): Promise<EmbeddingIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }
  const indexPath = resolveAiPath("chatbot-embeddings.json");
  const raw = await fs.readFile(indexPath, "utf8");
  const parsed = JSON.parse(raw) as {
    chunks?: Array<{
      id: string;
      sourceType: EmbeddingChunk["sourceType"];
      sourceId: string;
      locales?: Partial<
        Record<
          Locale | string,
          {
            title?: string;
            href?: string;
            tokens?: string[];
            text?: string;
          }
        >
      >;
    }>;
  };

  const flattened: EmbeddingChunk[] = [];

  for (const entry of parsed.chunks ?? []) {
    const localeEntries = Object.entries(entry.locales ?? {});
    for (const [localeKey, localeData] of localeEntries) {
      if (!localeData?.href || !localeData?.title || !localeData?.tokens || !localeData?.text) {
        continue;
      }
      if (!SUPPORTED_LOCALES.includes(localeKey as Locale)) {
        continue;
      }
      flattened.push({
        id: `${entry.id}-${localeKey}`,
        locale: localeKey as Locale,
        title: localeData.title,
        href: localeData.href,
        sourceType: entry.sourceType,
        sourceId: entry.sourceId,
        tokens: localeData.tokens,
        text: localeData.text
      });
    }
  }

  cachedIndex = { chunks: flattened };
  return cachedIndex;
}

export async function loadChatResources(): Promise<Resources> {
  const [instructions, anchors, index] = await Promise.all([
    loadInstructions(),
    loadAnchors(),
    loadEmbeddingIndex()
  ]);

  return { instructions, anchors, index };
}

function scoreChunk(queryTokens: string[], chunkTokens: string[]): number {
  if (!queryTokens.length || !chunkTokens.length) {
    return 0;
  }

  let overlap = 0;
  const chunkSet = new Set(chunkTokens);

  for (const token of queryTokens) {
    if (chunkSet.has(token)) {
      overlap += 1;
    }
  }

  if (overlap === 0) {
    return 0;
  }

  const unionSize = new Set([...queryTokens, ...chunkTokens]).size;
  return overlap / unionSize;
}

function pickLocaleChunks(index: EmbeddingIndex, locale: Locale): EmbeddingChunk[] {
  const localized = index.chunks.filter((chunk) => chunk.locale === locale);
  if (localized.length) {
    return localized;
  }
  return index.chunks.filter((chunk) => chunk.locale === defaultLocale);
}

function stripLeadingTitle(title: string, text: string): string {
  const cleanText = sanitizeText(text);
  const cleanTitle = sanitizeText(title);
  if (!cleanTitle) {
    return cleanText;
  }

  let working = cleanText;
  const titleLower = cleanTitle.toLowerCase();

  while (
    working.toLowerCase().startsWith(titleLower) ||
    working.toLowerCase().startsWith(`${titleLower} `)
  ) {
    working = working.slice(cleanTitle.length).trimStart();
    // Avoid infinite loop if the string is only the title.
    if (!working.length) {
      break;
    }
  }

  return working.trim() || cleanText;
}

function extractDateRange(text: string): string | null {
  const normalized = sanitizeText(text);
  const datePatterns = [
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2}\s*[–-]\s*(?:present|now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2})\b/i,
    /\b(?:19|20)\d{2}(?:-\d{2})?\s*[–-]\s*(?:present|now|(?:19|20)\d{2}(?:-\d{2})?)\b/i,
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2}\b/i,
    /\b(?:19|20)\d{2}\b/
  ];

  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match?.[0]) {
      return match[0].trim();
    }
  }

  return null;
}

function summarizeTimelineDetail(title: string, text: string, dateOnly: boolean): string {
  const collapsed = stripLeadingTitle(title, text);
  const dateRange = dateOnly ? extractDateRange(collapsed) : null;
  if (dateOnly && dateRange) {
    return dateRange;
  }
  return collapsed.length > 220 ? `${collapsed.slice(0, 220)}...` : collapsed;
}

export async function buildWorkEducationFacts(
  question: string,
  locale: Locale,
  index: EmbeddingIndex,
  limit = 4
): Promise<ContextFact[]> {
  const cleaned = sanitizeText(question);
  const queryTokens = await tokenize(cleaned, locale);
  const localeChunks = pickLocaleChunks(index, locale);

  const WORK_SOURCE_IDS = new Set([
    "captech-logistics",
    "bam-logistics",
    "ser321",
    "arizona-state-university"
  ]);

  const workCandidates = localeChunks.filter(
    (chunk) => chunk.sourceType === "experience" && WORK_SOURCE_IDS.has(chunk.sourceId)
  );
  const educationCandidates = localeChunks.filter((chunk) => chunk.sourceType === "education");

  const scoreAndSort = (chunks: EmbeddingChunk[]) =>
    chunks
      .map((chunk) => ({ chunk, score: scoreChunk(queryTokens, chunk.tokens) }))
      .sort((a, b) => b.score - a.score);

  const workScored = scoreAndSort(workCandidates);
  const educationScored = scoreAndSort(educationCandidates);
  const EDUCATION_PRIORITY = [
    "arizona-state-university-ira-a-fulton-schools-of-engineering"
  ];
  const workDedupKey = (sourceId: string) => {
    if (sourceId === "ser321" || sourceId === "arizona-state-university") {
      return "ta-asu";
    }
    return sourceId;
  };
  const TITLE_OVERRIDES: Record<string, string> = {
    ser321: "Teaching Assistant for Distributed Software Systems (SER 321)",
    "arizona-state-university": "Teaching Assistant for Distributed Software Systems (SER 321)"
  };

  const results: ContextFact[] = [];
  const seenWorkKeys = new Set<string>();
  const pushFact = (chunk: EmbeddingChunk, dateOnly: boolean) => {
    const displayTitle = TITLE_OVERRIDES[chunk.sourceId] ?? chunk.title;
    results.push({
      title: displayTitle,
      detail: summarizeTimelineDetail(displayTitle, chunk.text, dateOnly),
      href: chunk.href,
      sourceType: chunk.sourceType,
      sourceId: chunk.sourceId
    });
  };

  const WORK_TOKENS = new Set([
    "work", "worked", "employment", "employed", "job", "jobs", "intern", "internship", "ta",
    "teaching", "assistant", "captech", "bam"
  ]);
  const EDUCATION_TOKENS = new Set([
    "school", "college", "university", "education", "degree", "bachelor", "bs", "gpa"
  ]);
  const DATE_QUERY_TOKENS = new Set([
    "when", "date", "dates", "year", "years", "duration", "tenure", "time", "timeline", "period", "range",
    "start", "end", "since", "until", "during", "long"
  ]);

  const wantsWork = queryTokens.some((token) => WORK_TOKENS.has(token));
  const wantsEducation = queryTokens.some((token) => EDUCATION_TOKENS.has(token));
  const loweredQuestion = cleaned.toLowerCase();
  const wantsDates =
    loweredQuestion.includes("how long") ||
    loweredQuestion.includes("when") ||
    loweredQuestion.includes("since") ||
    loweredQuestion.includes("until") ||
    queryTokens.some((token) => DATE_QUERY_TOKENS.has(token));

  const workBudget = wantsWork ? (wantsEducation ? Math.max(1, limit - 1) : limit) : 0;

  if (wantsWork) {
    const bestWorkByKey = new Map<
      string,
      { chunk: EmbeddingChunk; score: number; hasDate: boolean }
    >();

    for (const item of workScored) {
      const key = workDedupKey(item.chunk.sourceId);
      const hasDate = Boolean(extractDateRange(item.chunk.text));
      const existing = bestWorkByKey.get(key);
      if (
        !existing ||
        item.score > existing.score ||
        (!existing.hasDate && hasDate)
      ) {
        bestWorkByKey.set(key, { chunk: item.chunk, score: item.score, hasDate });
      }
    }

    const dedupedWork = Array.from(bestWorkByKey.values()).sort((a, b) => b.score - a.score);

    for (const item of dedupedWork) {
      if (results.length >= workBudget) break;
      const key = workDedupKey(item.chunk.sourceId);
      if (seenWorkKeys.has(key)) {
        continue;
      }
      seenWorkKeys.add(key);
      pushFact(item.chunk, wantsDates);
    }
  }

  if (wantsEducation && results.length < limit) {
    const prioritizedEducation =
      educationScored.find((item) => EDUCATION_PRIORITY.includes(item.chunk.sourceId)) ??
      educationScored[0];
    if (prioritizedEducation) {
      pushFact(prioritizedEducation.chunk, wantsDates);
    }
  }

  return results.slice(0, limit);
}

function buildBridgeHints(
  queryTokens: string[],
  locale: Locale,
  anchors: AnchorEntry[]
): RetrievalHit[] {
  const hits: RetrievalHit[] = [];
  const anchorById = new Map(anchors.map((anchor) => [`${anchor.id}-${anchor.locale}`, anchor]));

  const kubernetesMatch = queryTokens.some((token) =>
    ["kubernetes", "k8s", "kube"].includes(token)
  );
  const leadershipMatch = queryTokens.some((token) =>
    ["leadership", "leader", "lead", "mentor", "mentoring", "ta", "teaching", "assistant", "team"].includes(token)
  );
  const costMatch = queryTokens.some((token) =>
    [
      "cost",
      "costs",
      "saving",
      "savings",
      "save",
      "spend",
      "budget",
      "money",
      "efficiency",
      "efficient",
      "optimize",
      "optimization",
      "reduce",
      "reducing",
      "コスト",
      "節約",
      "削減",
      "成本",
      "节省",
      "节约"
    ].includes(token)
  );

  if (kubernetesMatch) {
    const anchor =
      anchorById.get(`aws-${locale}`) ??
      anchorById.get(`docker-${locale}`) ??
      anchorById.get(`cloud-${locale}`) ??
      anchorById.get(`aws-${defaultLocale}`);

    const href = anchor?.href ?? `/${locale}/experience#tech-stack`;
    const text =
      "While Kubernetes is not listed, Jack ships containerized services with Docker/ECS patterns and can ramp to Kubernetes quickly. Link to closest container/cloud experience.";

    hits.push({
      chunk: {
        id: `bridge-kubernetes-${locale}`,
        locale,
        title: "Kubernetes adjacency",
        href,
        sourceType: "tech",
        sourceId: "bridge-kubernetes",
        tokens: ["kubernetes", "containers", "docker", "ecs", "cloud"],
        text
      },
      score: 0.35
    });
  }

  if (leadershipMatch) {
    const rollodexAnchor =
      anchorById.get(`rollodex-${locale}`) ??
      anchorById.get(`rollodex-${defaultLocale}`);
    const taAnchor =
      anchorById.get(`ser321-${locale}`) ??
      anchorById.get(`ser321-${defaultLocale}`);

    if (rollodexAnchor) {
      hits.push({
        chunk: {
          id: `bridge-leadership-rollodex-${locale}`,
          locale,
          title: "Team leadership — Rollodex",
          href: rollodexAnchor.href,
          sourceType: "experience",
          sourceId: "rollodex",
          tokens: ["leadership", "lead", "team", "co-lead", "mentor", "sprints"],
          text:
            "Co-led a remote fullstack team for the Rollodex product, owning API/data integrations and accessibility while running Git workflow and two-week sprints."
        },
        score: 0.38
      });
    }

    if (taAnchor) {
      hits.push({
        chunk: {
          id: `bridge-leadership-ta-${locale}`,
          locale,
          title: "Teaching assistant mentoring",
          href: taAnchor.href,
          sourceType: "experience",
          sourceId: "ser321",
          tokens: ["teaching", "assistant", "mentor", "mentoring", "leadership", "ta"],
          text:
            "Teaching Assistant for Distributed Software Systems (SER 321), supporting students, labs, and assignment design."
        },
        score: 0.34
      });
    }
  }

  if (costMatch) {
    const portfolioAnchor =
      anchorById.get(`portfolio-site-${locale}`) ??
      anchorById.get(`portfolio-site-${defaultLocale}`);
    const href = portfolioAnchor?.href ?? `/${locale}/experience#portfolio-site`;
    const title = portfolioAnchor?.name ?? "Performance & observability focus";
    const text =
      "Centered performance and observability with critical CSS, edge rendering, and structured data.";

    hits.push({
      chunk: {
        id: `bridge-cost-efficiency-${locale}`,
        locale,
        title,
        href,
        sourceType: "experience",
        sourceId: "portfolio-site",
        tokens: [
          "performance",
          "observability",
          "efficiency",
          "optimization",
          "cost",
          "savings",
          "save",
          "budget",
          "spend"
        ],
        text
      },
      score: 0.36
    });
  }

  return hits;
}

export async function retrieveContext(
  question: string,
  locale: Locale,
  limit = 5
): Promise<RetrievalHit[]> {
  const { anchors, index } = await loadChatResources();
  const cleaned = sanitizeText(question);
  const queryTokens = expandTokens(await tokenize(cleaned, locale));

  const candidates = pickLocaleChunks(index, locale);
  const scored: RetrievalHit[] = [];

  for (const chunk of candidates) {
    const score = scoreChunk(queryTokens, chunk.tokens);
    if (score > 0) {
      scored.push({ chunk, score });
    }
  }

  scored.push(...buildBridgeHints(queryTokens, locale, anchors));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function buildReferences(
  hits: RetrievalHit[],
  anchors: AnchorEntry[]
): Array<{ title: string; href: string }> {
  const references: Array<{ title: string; href: string }> = [];
  const seen = new Set<string>();
  const anchorByLocale = new Map(anchors.map((anchor) => [`${anchor.id}-${anchor.locale}`, anchor]));

  const resumeRef = { title: "Resume", href: "/resume.pdf" };
  let resumeAdded = false;

  for (const hit of hits) {
    const { chunk } = hit;
    const anchor = anchorByLocale.get(`${chunk.sourceId}-${chunk.locale}`);
    const href = anchor?.href ?? chunk.href;
    const title = anchor?.name ?? chunk.title;

    if (href === "/resume.pdf") {
      if (!resumeAdded) {
        references.push(resumeRef);
        resumeAdded = true;
      }
      continue;
    }

    if (seen.has(href)) {
      continue;
    }
    seen.add(href);
    references.push({ title, href });
  }

  if (!resumeAdded) {
    references.push(resumeRef);
  }

  return references;
}

export function buildContextBlock(
  hits: RetrievalHit[],
  options?: { maxChunkChars?: number; maxItems?: number }
): string {
  if (!hits.length) {
    return "No retrieved context.";
  }

  const maxItems = options?.maxItems ?? hits.length;
  const maxChunkChars = options?.maxChunkChars ?? 320;

  const trimmed = hits.slice(0, maxItems).map((hit, index) => {
    const text =
      hit.chunk.text.length > maxChunkChars
        ? `${hit.chunk.text.slice(0, maxChunkChars)}…`
        : hit.chunk.text;
    return `${index + 1}. ${hit.chunk.title} — ${text} (link: ${hit.chunk.href})`;
  });

  return trimmed.join("\n");
}
