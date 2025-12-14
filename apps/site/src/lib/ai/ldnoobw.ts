import fs from "node:fs";
import path from "node:path";

const FILE_MAP: Record<string, string> = {
  english: "ldnoobw-en.txt",
  japanese: "ldnoobw-ja.txt",
  chinese: "ldnoobw-zh.txt"
};

const PATH_CANDIDATES = [
  path.join(process.cwd(), "data", "moderation"),
  path.join(process.cwd(), "apps", "site", "data", "moderation")
];

const cache = new Map<string, Set<string>>();

function resolveFile(fileName: string): string | null {
  for (const base of PATH_CANDIDATES) {
    const full = path.join(base, fileName);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return null;
}

export function loadLdnoobwWords(languages: string[]): Set<string> {
  const combined = new Set<string>();

  for (const lang of languages) {
    const file = FILE_MAP[lang];
    if (!file) continue;

    const cacheKey = file;
    if (!cache.has(cacheKey)) {
      const resolved = resolveFile(file);
      if (!resolved) {
        console.error("[moderation] LDNOOBW list not found for", lang);
        cache.set(cacheKey, new Set());
        continue;
      }
      try {
        const raw = fs.readFileSync(resolved, "utf8");
        const words = raw
          .split(/\r?\n/)
          .map((line) => line.trim().toLowerCase())
          .filter(Boolean);
        cache.set(cacheKey, new Set(words));
      } catch (error) {
        console.error("[moderation] Failed to load LDNOOBW list:", lang, error);
        cache.set(cacheKey, new Set());
      }
    }

    for (const word of cache.get(cacheKey) ?? []) {
      combined.add(word);
    }
  }

  return combined;
}
