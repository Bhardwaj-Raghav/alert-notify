import { describe, expect, it } from "vitest";
import { escapeHtml, createId } from "../src/escape";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('xss')">`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;",
    );
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });
});

describe("createId", () => {
  it("returns a non-empty string", () => {
    expect(createId().length).toBeGreaterThan(0);
  });
});
