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

const locales = ["en", "ja", "zh"];
const themeOrder = ["light", "light-hc", "dark", "dark-hc"];
const sections = [];

for (const locale of locales) {
  for (const theme of themeOrder) {
    const key = `${theme}-${locale}`;
    if (colors[key]) {
      sections.push([key, colors[key]]);
    }
  }
}

const standaloneThemes = ["dreamland", "dreamland-hc"];
for (const theme of standaloneThemes) {
  if (colors[theme]) {
    sections.push([theme, colors[theme]]);
  }
}

if (colors.print) {
  sections.push(["print", colors.print]);
}

const toRgb = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const isShort = hex.length === 3;
    const normalize = (index) =>
      isShort ? hex[index] + hex[index] : hex.slice(index * 2, index * 2 + 2);
    const r = Number.parseInt(normalize(0), 16);
    const g = Number.parseInt(normalize(1), 16);
    const b = Number.parseInt(normalize(2), 16);
    return `${r} ${g} ${b}`;
  }

  const rgbMatch = trimmed.match(/^rgba?\((.+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((part) => part.trim());
    if (parts.length < 3) return null;
    const [r, g, b] = parts.slice(0, 3).map((part) => Number.parseFloat(part));
    if ([r, g, b].some((channel) => Number.isNaN(channel))) {
      return null;
    }
    return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
  }

  return null;
};

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
    const rgb = toRgb(value);
    if (rgb) {
      lines.push(`  --${name}-rgb: ${rgb};`);
      defined.add(`${name}-rgb`);
    }
  }
  lines.push("");
}

const buildLocaleAliases = (locale) => {
  const aliasLines = [];
  for (const theme of themeOrder) {
    const paletteKey = `${theme}-${locale}`;
    const palette = colors[paletteKey];
    if (!palette) continue;
    for (const key of Object.keys(palette)) {
      const targetName = `${theme}-${key}`;
      const sourceName = `${paletteKey}-${key}`;
      aliasLines.push(`  --${targetName}: var(--${sourceName});`);
      if (defined.has(`${sourceName}-rgb`)) {
        aliasLines.push(`  --${targetName}-rgb: var(--${sourceName}-rgb);`);
      }
    }
  }
  return aliasLines;
};

const defaultAliases = buildLocaleAliases("en");
if (defaultAliases.length) {
  lines.push("  /* Locale theme aliases (default) */");
  lines.push(...defaultAliases, "");
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

for (const locale of locales) {
  if (locale === "en") continue;
  const localeAliases = buildLocaleAliases(locale);
  if (!localeAliases.length) continue;
  lines.push(`:root:lang(${locale}) {`);
  lines.push(...localeAliases);
  lines.push("}", "");
}
writeFileSync(outputPath, lines.join("\n"));
console.log(`Wrote ${outputPath}`);
