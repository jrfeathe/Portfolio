const path = require("node:path");

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: [path.join(__dirname, "jest.setup.ts")],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": path.join(__dirname, "jest.transform.cjs")
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  clearMocks: true,
  collectCoverageFrom: [
    "<rootDir>/src/lib/**/*.{ts,tsx}"
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "json-summary"]
};
