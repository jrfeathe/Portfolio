#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const { spawn } = require("node:child_process");

const argv = process.argv.slice(2);

function hasFlag(flag) {
  return argv.includes(flag);
}

function getArgValue(flag) {
  const directIndex = argv.indexOf(flag);
  if (directIndex !== -1) {
    return argv[directIndex + 1];
  }
  const prefix = `${flag}=`;
  const withEquals = argv.find((arg) => arg.startsWith(prefix));
  return withEquals ? withEquals.slice(prefix.length) : undefined;
}

if (hasFlag("--help") || hasFlag("-h")) {
  console.log(
    [
      "Export JSON-LD emitted by the site for key routes.",
      "",
      "Usage:",
      "  node scripts/seo/export-jsonld.cjs [--port 3010] [--output path]",
      "  node scripts/seo/export-jsonld.cjs --base-url http://127.0.0.1:3000 --no-start",
      "",
      "Options:",
      "  --port <number>       Port for Next dev server (default: 3010)",
      "  --base-url <url>      Use an existing server instead of starting one",
      "  --output <path>       Output JSON path (default: docs/seo/jsonld-emitted.json)",
      "  --no-start            Do not start Next dev server",
      "  --help                Show this help"
    ].join("\n")
  );
  process.exit(0);
}

const defaultPort = 3010;
const port = Number(process.env.JSONLD_PORT ?? getArgValue("--port") ?? defaultPort);
const baseUrlFromArgs = process.env.JSONLD_BASE_URL ?? getArgValue("--base-url");
const baseUrl = baseUrlFromArgs ?? `http://127.0.0.1:${port}`;
const outputPath =
  process.env.JSONLD_OUTPUT ??
  getArgValue("--output") ??
  path.join(process.cwd(), "docs", "seo", "jsonld-emitted.json");
const shouldStartServer = !baseUrlFromArgs && !hasFlag("--no-start");

const locales = ["en", "ja", "zh"];
const routes = locales.map((locale) => `/${locale}`);

function fetchHtml(route) {
  return new Promise((resolve, reject) => {
    const url = new URL(route, baseUrl);
    const client = url.protocol === "https:" ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${route}`));
        return;
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
  });
}

function extractJsonLd(html, route) {
  const match = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) {
    throw new Error(`JSON-LD script not found for ${route}`);
  }
  const raw = match[1].trim();
  return JSON.parse(raw);
}

async function fetchJsonLdWithRetry(route, retries = 40) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const html = await fetchHtml(route);
      return extractJsonLd(html, route);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

function startDevServer() {
  if (!shouldStartServer) {
    return null;
  }
  const child = spawn(
    "pnpm",
    ["-C", "apps/site", "exec", "next", "dev", "-p", String(port)],
    {
      stdio: "inherit",
      detached: true
    }
  );
  return child;
}

function stopDevServer(child) {
  if (!child || !child.pid) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        // ignore
      }
      resolve();
    }, 5000);

    child.on("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      clearTimeout(timeout);
      resolve();
    }
  });
}

async function main() {
  let child;
  try {
    child = startDevServer();
    const output = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      routes: {}
    };

    for (const route of routes) {
      output.routes[route] = await fetchJsonLdWithRetry(route);
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(`Wrote JSON-LD to ${outputPath}`);
  } finally {
    await stopDevServer(child);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
