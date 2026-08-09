import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      "alert-notify/style.css": path.resolve(root, "../src/styles/toast.css"),
      "alert-notify": path.resolve(root, "../src/index.ts"),
    },
  },
});
