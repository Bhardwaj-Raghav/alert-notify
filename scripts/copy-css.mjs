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
  code = code.replace(/^require\(["']\.\/style\.css["']\);\r?\n/gm, "");

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

// Measure JS without counting the CSS side-effect import line as "bundle bloat"
const jsSource = readFileSync(join(dist, "index.js"), "utf8").replace(
  /^import\s+["']\.\/style\.css["'];\r?\n/,
  "",
);
const js = Buffer.from(jsSource);
const cssBuf = readFileSync(join(dist, "style.css"));
const gzJs = gzipSync(js);
const gzCss = gzipSync(cssBuf);
const sizes = {
  jsRaw: js.length,
  jsGzip: gzJs.length,
  cssRaw: cssBuf.length,
  cssGzip: gzCss.length,
  jsGzipKb: Number((gzJs.length / 1024).toFixed(1)),
  cssGzipKb: Number((gzCss.length / 1024).toFixed(1)),
};

mkdirSync(websiteData, { recursive: true });
writeFileSync(join(websiteData, "size.json"), `${JSON.stringify(sizes, null, 2)}\n`);

console.log(
  `bundle: js ${sizes.jsGzipKb}KB gzip · css ${sizes.cssGzipKb}KB gzip`,
);
