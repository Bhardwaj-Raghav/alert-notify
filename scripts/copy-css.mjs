import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

function ensureStyleImport(filePath, styleLine, { useClient = false } = {}) {
  if (!existsSync(filePath)) {
    return;
  }
  let code = readFileSync(filePath, "utf8");
  code = code.replace(/^["']use client["'];\r?\n/gm, "");
  code = code.replace(/^import\s+["']\.\/style\.css["'];\r?\n/gm, "");
  code = code.replace(/^require\(["']\.\/style\.css["'];\r?\n/gm, "");

  const parts = [];
  if (useClient) {
    parts.push('"use client";');
  }
  parts.push(styleLine);
  parts.push(code);
  writeFileSync(filePath, parts.join("\n"));
}

ensureStyleImport(join(dist, "index.js"), 'import "./style.css";');
ensureStyleImport(join(dist, "index.cjs"), 'require("./style.css");');
ensureStyleImport(join(dist, "vue.js"), 'import "./style.css";');
ensureStyleImport(join(dist, "vue.cjs"), 'require("./style.css");');
ensureStyleImport(join(dist, "react.js"), 'import "./style.css";', {
  useClient: true,
});
ensureStyleImport(join(dist, "react.cjs"), 'require("./style.css");', {
  useClient: true,
});

const css = readFileSync(join(dist, "style.css"), "utf8");
const globalPath = join(dist, "alert-notify.global.js");
if (existsSync(globalPath)) {
  let globalCode = readFileSync(globalPath, "utf8");
  if (!globalCode.includes("data-alert-notify-style")) {
    const inject = `(function(){if(typeof document==="undefined")return;if(document.querySelector("[data-alert-notify-style]"))return;var s=document.createElement("style");s.setAttribute("data-alert-notify-style","");s.textContent=${JSON.stringify(css)};(document.head||document.documentElement).appendChild(s);})();`;
    writeFileSync(globalPath, `${inject}${globalCode}`);
  }
}

/** Strip CSS side-effect imports / use client so size reflects runtime code only. */
function stripMeta(code) {
  return code
    .replace(/^["']use client["'];\r?\n/gm, "")
    .replace(/^import\s+["']\.\/style\.css["'];\r?\n/gm, "")
    .replace(/^require\(["']\.\/style\.css["'];\r?\n/gm, "");
}

function readDist(...parts) {
  return stripMeta(readFileSync(join(dist, ...parts), "utf8"));
}

/**
 * Size = code needed for one framework path (core + optional adapter).
 * Headline number is the max of those paths — not all frameworks summed.
 */
const entrySources = {
  vanilla: readDist("index.js"),
  react: `${readDist("index.js")}\n${readDist("react.js")}`,
  vue: `${readDist("index.js")}\n${readDist("vue.js")}`,
  svelte: `${readDist("index.js")}\n${readDist("svelte", "Toaster.svelte")}`,
};

const entrySizes = Object.fromEntries(
  Object.entries(entrySources).map(([name, source]) => {
    const raw = Buffer.byteLength(source);
    const gzip = gzipSync(source).length;
    return [
      name,
      {
        raw,
        gzip,
        gzipKb: Number((gzip / 1024).toFixed(1)),
      },
    ];
  }),
);

const heaviest = Object.entries(entrySizes).reduce(
  (best, [name, size]) =>
    size.gzip > best.size.gzip ? { name, size } : best,
  { name: "vanilla", size: { raw: 0, gzip: -1, gzipKb: 0 } },
);

const cssBuf = readFileSync(join(dist, "style.css"));
const gzCss = gzipSync(cssBuf);
const cssGzip = gzCss.length;
const cssGzipKb = Number((cssGzip / 1024).toFixed(1));

// Separate JS + CSS requests ≈ sum of gzip sizes (what users pay on the wire).
const totalGzip = heaviest.size.gzip + cssGzip;
const totalGzipKb = Number((totalGzip / 1024).toFixed(1));

const sizes = {
  measuredEntry: heaviest.name,
  entries: entrySizes,
  jsRaw: heaviest.size.raw,
  jsGzip: heaviest.size.gzip,
  cssRaw: cssBuf.length,
  cssGzip,
  jsGzipKb: heaviest.size.gzipKb,
  cssGzipKb,
  totalGzip,
  totalGzipKb,
};

mkdirSync(websiteData, { recursive: true });
writeFileSync(join(websiteData, "size.json"), `${JSON.stringify(sizes, null, 2)}\n`);

console.log(
  `bundle: max single-impl JS (${heaviest.name}) ${sizes.jsGzipKb}KB gzip · css ${sizes.cssGzipKb}KB gzip · total ~${sizes.totalGzipKb}KB`,
);
for (const [name, size] of Object.entries(entrySizes)) {
  console.log(`  ${name.padEnd(8)} ${size.gzipKb}KB gzip`);
}
