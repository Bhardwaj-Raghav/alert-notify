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
  redirects: {
    "/sitemap.xml": "/sitemap-index.xml",
  },
  integrations: [
    sitemap({
      changefreq: "weekly",
      lastmod: new Date(),
      filter: (page) => {
        const { pathname } = new URL(page);
        if (pathname === "/" || pathname === "") return true;
        return !page.endsWith("/");
      },
      serialize(item) {
        const { pathname } = new URL(item.url);
        if (pathname === "/" || pathname === "") {
          item.priority = 1;
        } else if (pathname === "/changelog") {
          item.priority = 0.5;
        } else {
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "alert-notify/style.css": path.resolve(root, "../src/styles/toast.css"),
        "alert-notify/react": path.resolve(root, "../src/react/index.tsx"),
        "alert-notify/vue": path.resolve(root, "../src/vue/index.ts"),
        "alert-notify": path.resolve(root, "../src/index.ts"),
      },
    },
  },
});
