import fs from "node:fs";
import path from "node:path";

const PATH_CANDIDATES = [
  path.join(process.cwd(), "data", "moderation"),
  path.join(process.cwd(), "apps", "site", "data", "moderation")
];

let cached: string[] | null = null;
let cachedPatternStrings: string[] | null = null;
let cachedPatterns: RegExp[] | null = null;

function resolveFile(): string | null {
  for (const base of PATH_CANDIDATES) {
    const full = path.join(base, "safe-phrases.txt");
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
}

function resolvePatternFile(): string | null {
  for (const base of PATH_CANDIDATES) {
    const full = path.join(base, "safe-phrase-patterns.txt");
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
}

export function loadSafePhrases(): string[] {
  if (cached) return cached;
  const file = resolveFile();
  if (!file) {
    console.error("[moderation] safe-phrases.txt not found");
    cached = [];
    return cached;
  }
  try {
    const raw = fs.readFileSync(file, "utf8");
    cached = raw
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean);
  } catch (error) {
    console.error("[moderation] Failed to load safe phrases:", error);
    cached = [];
  }
  return cached;
}

export function loadSafePhrasePatternStrings(): string[] {
  if (cachedPatternStrings) return cachedPatternStrings;
  const file = resolvePatternFile();
  if (!file) {
    cachedPatternStrings = [];
    return cachedPatternStrings;
  }
  try {
    const raw = fs.readFileSync(file, "utf8");
    cachedPatternStrings = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch (error) {
    console.error("[moderation] Failed to load safe phrase patterns:", error);
    cachedPatternStrings = [];
  }
  return cachedPatternStrings;
}

export function loadSafePhrasePatterns(): RegExp[] {
  if (cachedPatterns) return cachedPatterns;
  const rawPatterns = loadSafePhrasePatternStrings();
  cachedPatterns = rawPatterns
    .map((pattern) => {
      try {
        return new RegExp(pattern, "i");
      } catch (error) {
        console.error("[moderation] Invalid safe phrase pattern:", pattern, error);
        return null;
      }
    })
    .filter((pattern): pattern is RegExp => Boolean(pattern));
  return cachedPatterns;
}
