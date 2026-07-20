import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToaster } from "../src/create-toaster";

describe("createToaster API", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("exposes typed helpers", () => {
    const toaster = createToaster({}, { headless: true });
    toaster.success("ok");
    toaster.error("bad");
    toaster.warning("careful");
    toaster.info("tip");
    toaster.loading("wait");
    toaster.message("hi");
    expect(toaster.getToasts()).toHaveLength(6);
    toaster.destroy();
  });

  it("supports promise flow", async () => {
    const toaster = createToaster({ duration: 5000 }, { headless: true });
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((res) => {
      resolve = res;
    });

    const resultPromise = toaster.promise(promise, {
      loading: "Uploading…",
      success: (data) => `Uploaded ${data}`,
      error: "Failed",
    });

    expect(toaster.getToasts()[0]?.type).toBe("loading");
    resolve("file.png");
    await resultPromise;

    expect(toaster.getToasts()[0]?.type).toBe("success");
    expect(toaster.getToasts()[0]?.title).toBe("Uploaded file.png");
    toaster.destroy();
  });

  it("rejects promise toast on failure", async () => {
    const toaster = createToaster({ duration: 5000 }, { headless: true });
    const failing = Promise.reject(new Error("boom"));

    await expect(
      toaster.promise(failing, {
        loading: "Working…",
        success: "Done",
        error: (err) => (err instanceof Error ? err.message : "Failed"),
      }),
    ).rejects.toThrow("boom");

    expect(toaster.getToasts()[0]?.type).toBe("error");
    expect(toaster.getToasts()[0]?.title).toBe("boom");
    toaster.destroy();
  });

  it("subscribes to toast changes", () => {
    const toaster = createToaster({}, { headless: true });
    const lengths: number[] = [];
    const unsub = toaster.subscribe((toasts) => lengths.push(toasts.length));
    toaster("One");
    toaster("Two");
    unsub();
    toaster("Three");
    expect(lengths).toContain(1);
    expect(lengths).toContain(2);
    expect(lengths.at(-1)).toBe(2);
    toaster.destroy();
  });

  it("mounts a portal when not headless", () => {
    const toaster = createToaster();
    toaster.success("Visible");
    expect(document.querySelector("[data-alert-notify-portal]")).toBeTruthy();
    expect(document.querySelector("[data-an-toast-id]")).toBeTruthy();
    toaster.destroy();
  });
});
