const shared = require("@portfolio/config/tailwind");

module.exports = {
  ...shared,
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
};
