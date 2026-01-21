import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/tests/component/**/*.test.ts?(x)",
    "<rootDir>/tests/component/**/*.spec.ts?(x)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
};

export default config;
