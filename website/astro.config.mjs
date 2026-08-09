import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { loadEnv } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv(process.env.NODE_ENV ?? "development", root, "");
const site = env.SITE_URL || process.env.SITE_URL || "https://alert-notify.vercel.app";

export default defineConfig({
  site,
  base: "/",
  output: "static",
  trailingSlash: "never",
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 1,
      lastmod: new Date(),
      filter: (page) => {
        const { pathname } = new URL(page);
        if (pathname === "/" || pathname === "") return true;
        return !page.endsWith("/");
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "alert-notify/style.css": path.resolve(root, "../src/styles/toast.css"),
        "alert-notify": path.resolve(root, "../src/index.ts"),
      },
    },
  },
});
