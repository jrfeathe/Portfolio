const path = require("node:path");

module.exports = {
  extends: [
    path.join(__dirname, "base.cjs"),
    "next/core-web-vitals"
  ],
  rules: {
    "@next/next/no-img-element": "error"
  }
};
