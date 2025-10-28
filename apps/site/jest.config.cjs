const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)",
    "<rootDir>/src/**/*.(spec|test).[jt]s?(x)"
  ],
  moduleNameMapper: {
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^.+\\.(png|jpg|jpeg|gif|svg|webp|avif)$": "<rootDir>/test-utils/fileMock.ts"
  },
  collectCoverageFrom: [
    "<rootDir>/src/utils/**/*.{ts,tsx}"
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "json-summary", "lcov", "text-summary"],
  coverageThreshold: {
    global: {
      branches: 0.8,
      functions: 0.9,
      lines: 0.9,
      statements: 0.9
    }
  }
};

module.exports = createJestConfig(customJestConfig);
