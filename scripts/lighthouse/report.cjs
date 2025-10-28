#!/usr/bin/env node

const runCollect = require("./collect.cjs");
const runSummarize = require("./summarize.cjs");

function run() {
  const previewUrl = process.env.PREVIEW_URL || process.argv[2];
  runCollect(previewUrl);
  runSummarize();
}

if (require.main === module) {
  run();
} else {
  module.exports = run;
}
