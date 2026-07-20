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
    return config;
  },
};

export default config;
