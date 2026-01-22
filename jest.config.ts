import type { Config } from "jest";
import createJestConfig from "next/jest.js";

const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/unit/**/*.test.ts?(x)", "<rootDir>/tests/unit/**/*.spec.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } }
        }
      }
    ]
  }
};

const nextJestConfig = createJestConfig({ dir: "./" });

export default nextJestConfig(config);