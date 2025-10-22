#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version?: string };

const program = new Command();

program
  .name("portfolio")
  .description("Workspace utilities for the portfolio monorepo")
  .version(pkg.version ?? "0.0.0");

program
  .command("status")
  .description("Display the main workspace packages and their roles")
  .action(() => {
    const blurbs = [
      "apps/site – Next.js web experience",
      "packages/ui – Shared component library",
      "packages/config – Tooling presets",
      "packages/cli – CLI helpers"
    ];
    console.log("Portfolio workspace overview:\n" + blurbs.join("\n"));
  });

program.parse(process.argv);
