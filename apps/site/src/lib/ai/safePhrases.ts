import fs from "node:fs";
import path from "node:path";

const PATH_CANDIDATES = [
  path.join(process.cwd(), "data", "moderation"),
  path.join(process.cwd(), "apps", "site", "data", "moderation")
];

let cached: string[] | null = null;

function resolveFile(): string | null {
  for (const base of PATH_CANDIDATES) {
    const full = path.join(base, "safe-phrases.txt");
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
