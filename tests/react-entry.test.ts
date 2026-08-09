import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("built package entry contracts", () => {
  it("react entry starts with use client and imports style.css", () => {
    const path = join(process.cwd(), "dist/react.js");
    let code: string;
    try {
      code = readFileSync(path, "utf8");
    } catch {
      expect.fail("dist/react.js missing. Run npm run build first");
      return;
    }
    expect(code.startsWith('"use client";')).toBe(true);
    expect(code).toContain('import "./style.css";');
  });

  it("main ESM entry side-effect imports style.css", () => {
    const path = join(process.cwd(), "dist/index.js");
    let code: string;
    try {
      code = readFileSync(path, "utf8");
    } catch {
      expect.fail("dist/index.js missing. Run npm run build first");
      return;
    }
    expect(code.startsWith('import "./style.css";')).toBe(true);
  });

  it("CDN build injects styles once", () => {
    const path = join(process.cwd(), "dist/alert-notify.global.js");
    let code: string;
    try {
      code = readFileSync(path, "utf8");
    } catch {
      expect.fail("dist/alert-notify.global.js missing. Run npm run build first");
      return;
    }
    expect(code).toContain("data-alert-notify-style");
  });
});
