import { afterEach, describe, expect, it } from "vitest";
import { createToaster } from "../src/create-toaster";
import { getDefaultIcon } from "../src/icons";
import { DEFAULT_CONFIG } from "../src/store";

describe("theme defaults", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("default theme is light", () => {
    expect(DEFAULT_CONFIG.theme).toBe("light");
    const toaster = createToaster({}, { headless: true });
    expect(toaster.getConfig().theme).toBe("light");
    toaster.destroy();
  });

  it("explicit light / dark / system apply to toaster dataset", () => {
    const toaster = createToaster({ theme: "light", autoClose: false });
    toaster.success("Light");
    expect(
      document.querySelector("[data-an-toaster]")?.getAttribute("data-theme"),
    ).toBe("light");
    toaster.config({ theme: "dark" });
    expect(
      document.querySelector("[data-an-toaster]")?.getAttribute("data-theme"),
    ).toBe("dark");
    toaster.config({ theme: "system" });
    const theme = document
      .querySelector("[data-an-toaster]")
      ?.getAttribute("data-theme");
    expect(theme === "light" || theme === "dark").toBe(true);
    toaster.destroy();
  });
});

describe("icon colors", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("default icons do not use stroke=currentColor", () => {
    for (const type of [
      "success",
      "error",
      "warning",
      "info",
      "loading",
      "message",
    ] as const) {
      expect(getDefaultIcon(type)).not.toContain('stroke="currentColor"');
    }
  });

  it("renders type-colored icons in the DOM", () => {
    const toaster = createToaster({ autoClose: false, richColors: true });
    for (const type of [
      "success",
      "error",
      "warning",
      "info",
      "loading",
      "message",
    ] as const) {
      toaster.dismiss();
      toaster[type](`${type} toast`);
      const icon = document.querySelector(".an-toast__icon svg");
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute("stroke")).toBeNull();
      expect(
        document.querySelector(`[data-type="${type}"] .an-toast__icon`),
      ).toBeTruthy();
      expect(
        document
          .querySelector(`[data-type="${type}"]`)
          ?.getAttribute("data-rich-colors"),
      ).toBe("true");
    }
    toaster.destroy();
  });

  it("per-toast richColors overrides container", () => {
    const toaster = createToaster({ autoClose: false, richColors: false });
    toaster.success("Tinted", { richColors: true });
    expect(
      document
        .querySelector('[data-type="success"]')
        ?.getAttribute("data-rich-colors"),
    ).toBe("true");
    toaster.dismiss();
    toaster.error("Plain", { richColors: false });
    expect(
      document
        .querySelector('[data-type="error"]')
        ?.getAttribute("data-rich-colors"),
    ).toBe("false");
    toaster.destroy();
  });
});
