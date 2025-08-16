import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/test"],
    testMatch: ["**/test/**/*.test.ts"],
    maxWorkers: 1,
    detectOpenHandles: true
};

export default config;