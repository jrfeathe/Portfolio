const sharedNextConfig = require.resolve("@portfolio/config/eslint/next");

module.exports = {
  root: true,
  extends: [sharedNextConfig],
  parserOptions: {
    tsconfigRootDir: __dirname
  }
};
