import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const websiteData = join(root, "website/src/data");

mkdirSync(dist, { recursive: true });
copyFileSync(join(root, "src/styles/toast.css"), join(dist, "style.css"));

const svelteDist = join(dist, "svelte");
mkdirSync(svelteDist, { recursive: true });
copyFileSync(
  join(root, "src/svelte/Toaster.svelte"),
  join(svelteDist, "Toaster.svelte"),
);

const js = readFileSync(join(dist, "index.js"));
const css = readFileSync(join(dist, "style.css"));
const gzJs = gzipSync(js);
const gzCss = gzipSync(css);
const sizes = {
  jsRaw: js.length,
  jsGzip: gzJs.length,
  cssRaw: css.length,
  cssGzip: gzCss.length,
  jsGzipKb: Number((gzJs.length / 1024).toFixed(1)),
  cssGzipKb: Number((gzCss.length / 1024).toFixed(1)),
};

mkdirSync(websiteData, { recursive: true });
writeFileSync(join(websiteData, "size.json"), `${JSON.stringify(sizes, null, 2)}\n`);

console.log(
  `bundle: js ${sizes.jsGzipKb}KB gzip · css ${sizes.cssGzipKb}KB gzip`,
);
