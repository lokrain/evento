import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts?(x)",
    "<rootDir>/tests/unit/**/*.spec.ts?(x)",
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
