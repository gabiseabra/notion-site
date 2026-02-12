/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import type { Config } from "jest";

export default {
  projects: (["web", "api", "common"] as const).map(
    (workspace): Config => ({
      displayName: workspace,
      rootDir: process.cwd(),
      testEnvironment: workspace === "web" ? "jsdom" : "node",
      testMatch:
        workspace === "web"
          ? [
              `${process.cwd()}/${workspace}/src/**/*.test.ts`,
              `${process.cwd()}/${workspace}/src/**/*.test.tsx`,
              `${process.cwd()}/${workspace}/src/**/*.spec.ts`,
              `${process.cwd()}/${workspace}/src/**/*.spec.tsx`,
            ]
          : [
              `${process.cwd()}/${workspace}/src/**/*.test.ts`,
              `${process.cwd()}/${workspace}/src/**/*.spec.ts`,
            ],
      extensionsToTreatAsEsm: workspace === "web" ? [".ts", ".tsx"] : [".ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            tsconfig: `${process.cwd()}/${workspace}/${workspace === "web" ? `tsconfig.build` : "tsconfig"}.json`,
            diagnostics: false,
          },
        ] as const,
      },
      moduleNameMapper: {
        "^.+/env(\\.js)?$": `${process.cwd()}/${workspace}/src/test-utils/env.ts`,
        // Strip .js from relative imports so Jest can resolve TS sources.
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "\\.(css|scss|sass)$": "identity-obj-proxy",
      },
      ...(workspace === "web"
        ? {
            setupFiles: [
              `${process.cwd()}/${workspace}/src/test-utils/setup.ts`,
            ],
            setupFilesAfterEnv: [
              "@testing-library/jest-dom",
              `${process.cwd()}/${workspace}/src/test-utils/setup-after-env.ts`,
            ],
          }
        : {}),
    }),
  ),
};
