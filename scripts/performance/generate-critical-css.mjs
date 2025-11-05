#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..", "..");
const SITE_DIR = resolve(REPO_ROOT, "apps/site");
const INPUT_CSS = resolve(SITE_DIR, "app/critical.css.src");
const OUTPUT_CSS = resolve(SITE_DIR, "app/critical.css");
const MANIFEST_PATH = resolve(SITE_DIR, "app/critical-css.manifest.json");

const CRITICAL_ROUTES = [
  {
    id: "home-en",
    path: "/en",
    contentGlobs: [
      "app/[locale]/page.tsx",
      "src/components/Shell/**/*.tsx",
      "src/components/ContrastToggle.tsx",
      "src/components/ThemeToggle.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/ResponsiveImage.tsx",
      "../../packages/ui/src/lib/Button.tsx"
    ],
    output: OUTPUT_CSS
  },
  {
    id: "home-ja",
    path: "/ja",
    contentGlobs: [
      "app/[locale]/page.tsx",
      "src/components/Shell/**/*.tsx",
      "src/components/ContrastToggle.tsx",
      "src/components/ThemeToggle.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/ResponsiveImage.tsx",
      "../../packages/ui/src/lib/Button.tsx"
    ],
    output: OUTPUT_CSS
  },
  {
    id: "home-zh",
    path: "/zh",
    contentGlobs: [
      "app/[locale]/page.tsx",
      "src/components/Shell/**/*.tsx",
      "src/components/ContrastToggle.tsx",
      "src/components/ThemeToggle.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/ResponsiveImage.tsx",
      "../../packages/ui/src/lib/Button.tsx"
    ],
    output: OUTPUT_CSS
  }
];

function ensureInputs() {
  if (!existsSync(INPUT_CSS)) {
    throw new Error(
      `Missing critical CSS input at ${INPUT_CSS}. Add the file and re-run.`
    );
  }
}

function runTailwind({ contentGlobs, output }) {
  const args = [
    "exec",
    "tailwindcss",
    "-i",
    INPUT_CSS,
    "-o",
    output,
    "--config",
    "tailwind.config.cjs",
    "--minify",
    "--content",
    contentGlobs.join(",")
  ];

  execFileSync("pnpm", args, {
    cwd: SITE_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production"
    }
  });
}

function main() {
  ensureInputs();

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    routes: {}
  };
  let combinedCss = "";
  let combinedBytes = 0;

  for (const route of CRITICAL_ROUTES) {
    console.log(`Generating critical CSS for ${route.path}`);
    runTailwind(route);

    const css = readFileSync(route.output, "utf8").trim();
    const bytes = Buffer.byteLength(css, "utf8");
    const cssBase64 = Buffer.from(css, "utf8").toString("base64");

    manifest.routes[route.path] = {
      id: route.id,
      bytes,
      kilobytes: Number((bytes / 1024).toFixed(2)),
      cssBase64
    };

    console.log(
      `Inline CSS ready for ${route.path}: ${(bytes / 1024).toFixed(2)} KB`
    );
    combinedCss += css;
    combinedBytes += bytes;
  }

  if (combinedCss) {
    manifest.combined = {
      bytes: combinedBytes,
      kilobytes: Number((combinedBytes / 1024).toFixed(2)),
      cssBase64: Buffer.from(combinedCss, "utf8").toString("base64")
    };
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

main();
