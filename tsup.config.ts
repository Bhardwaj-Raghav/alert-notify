import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
  target: "es2020",
  outDir: "dist",
};

export default defineConfig([
  {
    ...shared,
    entry: ["src/index.ts"],
    clean: true,
  },
  {
    ...shared,
    entry: { react: "src/react/index.tsx" },
    clean: false,
    external: ["react", "react-dom", "react/jsx-runtime", "alert-notify"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  },
  {
    ...shared,
    entry: { vue: "src/vue/index.ts" },
    clean: false,
    external: ["vue", "alert-notify"],
  },
  {
    entry: { "alert-notify": "src/index.ts" },
    format: ["iife"],
    globalName: "AlertNotify",
    minify: true,
    treeshake: true,
    target: "es2020",
    outDir: "dist",
    outExtension: () => ({ js: ".global.js" }),
  },
]);
