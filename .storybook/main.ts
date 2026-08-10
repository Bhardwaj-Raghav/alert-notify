import type { StorybookConfig } from "@storybook/html-vite";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|ts)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  async viteFinal(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "alert-notify": join(root, "../src/index.ts"),
      "alert-notify/style.css": join(root, "../src/styles/toast.css"),
    };
    // esbuild 0.28+ refuses to emit destructuring for safari14 (JSC bug fixed in 14.1).
    // Vite 6 / Storybook still default to safari14, which breaks build-storybook.
    config.build = {
      ...config.build,
      target: ["chrome87", "edge88", "firefox78", "safari14.1", "es2020"],
    };
    return config;
  },
};

export default config;
