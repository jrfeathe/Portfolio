#!/usr/bin/env node

const { spawn } = require("node:child_process");

const args = process.argv.slice(2);

if (args[0] === "--") {
  args.shift();
}

const child = spawn("playwright", ["test", ...args], {
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
