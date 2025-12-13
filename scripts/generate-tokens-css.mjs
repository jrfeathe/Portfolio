import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, "..");
const tokensPath = join(repoRoot, "packages/ui/tokens.json");
const outputPath = join(repoRoot, "packages/ui/tokens.css");

const raw = JSON.parse(readFileSync(tokensPath, "utf8"));
const colors = raw.colors || {};
const colorAliases = raw.colorAliases || {};

const sections = [
  ["light", colors.light],
  ["light-hc", colors.print || {}],
  ["dark", colors.dark],
  ["dark-hc", colors.dark]
];

const lines = [
  "/* Generated from packages/ui/tokens.json via scripts/generate-tokens-css.mjs. Do not edit by hand. */",
  ":root {",
  "  color-scheme: light dark;",
  ""
];
const defined = new Set();

for (const [prefix, palette] of sections) {
  if (!palette) continue;
  for (const [key, value] of Object.entries(palette)) {
    const name = `${prefix}-${key}`;
    lines.push(`  --${name}: ${value};`);
    defined.add(name);
  }
  lines.push("");
}

if (Object.keys(colorAliases).length > 0) {
  lines.push("  /* Aliases for globals.css overrides */");
  for (const [name, value] of Object.entries(colorAliases)) {
    if (defined.has(name)) {
      continue;
    }
    lines.push(`  --${name}: ${value};`);
  }
}

lines.push("}", "");
writeFileSync(outputPath, lines.join("\n"));
console.log(`Wrote ${outputPath}`);
