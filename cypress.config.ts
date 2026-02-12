import { defineConfig } from "cypress";
import viteConfig from "./web/vite.config.js";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: () =>
        viteConfig({
          command: "build",
          mode: "test",
        }),
    },
    excludeSpecPattern: ["**/dist/**/*"],
  },

  // why not set this to false by default . . . ?
  allowCypressEnv: false,
});
