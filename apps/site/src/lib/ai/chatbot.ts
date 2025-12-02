import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

import { defaultLocale, type Locale } from "../../utils/i18n";

export type AnchorEntry = {
  id: string;
  name: string;
  href: string;
  locale: Locale;
  category: "tech" | "experience" | "resume";
  source: string;
};

export type EmbeddingChunk = {
  id: string;
  locale: Locale;
  title: string;
  href: string;
  sourceType: AnchorEntry["category"];
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

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "was", "were", "have", "has",
  "had", "from", "into", "about", "while", "without", "can", "will", "would", "could",
  "a", "an", "of", "to", "in", "on", "by", "at", "as", "is", "it", "be", "or", "but",
  "not", "than", "then", "so", "if", "when", "what", "which", "who", "whom", "how",
  "do", "did", "done", "just", "also"
]);

const AI_PATH_CANDIDATES = [
  path.join(process.cwd(), "apps", "site", "data", "ai"),
  path.join(process.cwd(), "data", "ai")
];

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

export function tokenize(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return Array.from(new Set(tokens));
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
  const parsed = JSON.parse(raw) as { anchors?: AnchorEntry[] };
  cachedAnchors = parsed.anchors ?? [];
  return cachedAnchors;
}

async function loadEmbeddingIndex(): Promise<EmbeddingIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }
  const indexPath = resolveAiPath("chatbot-embeddings.json");
  const raw = await fs.readFile(indexPath, "utf8");
  const parsed = JSON.parse(raw) as EmbeddingIndex;
  cachedIndex = parsed;
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

  return hits;
}

export async function retrieveContext(
  question: string,
  locale: Locale,
  limit = 5
): Promise<RetrievalHit[]> {
  const { anchors, index } = await loadChatResources();
  const cleaned = sanitizeText(question);
  const queryTokens = tokenize(cleaned);

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

  for (const hit of hits) {
    const { chunk } = hit;
    const anchor = anchorByLocale.get(`${chunk.sourceId}-${chunk.locale}`);
    const href = anchor?.href ?? chunk.href;
    const title = anchor?.name ?? chunk.title;
    if (seen.has(href)) {
      continue;
    }
    seen.add(href);
    references.push({ title, href });
  }

  return references;
}

export function buildContextBlock(hits: RetrievalHit[]): string {
  if (!hits.length) {
    return "No retrieved context.";
  }

  return hits
    .map(
      (hit, index) =>
        `${index + 1}. ${hit.chunk.title} — ${hit.chunk.text} (link: ${hit.chunk.href})`
    )
    .join("\n");
}
