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
    expect(toaster.getToasts().find((t) => t.type === "loading")?.autoClose).toBe(
      false,
    );
    toaster.destroy();
  });

  it("uses message as primary argument and optional title", () => {
    const toaster = createToaster({}, { headless: true });
    toaster.success("Your profile was saved.", { title: "Profile updated" });
    const toast = toaster.getToasts()[0];
    expect(toast?.message).toBe("Your profile was saved.");
    expect(toast?.title).toBe("Profile updated");
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
    expect(toaster.getToasts()[0]?.autoClose).toBe(false);
    resolve("file.png");
    await resultPromise;

    expect(toaster.getToasts()[0]?.type).toBe("success");
    expect(toaster.getToasts()[0]?.message).toBe("Uploaded file.png");
    expect(toaster.getToasts()[0]?.autoClose).toBe(true);
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
    expect(toaster.getToasts()[0]?.message).toBe("boom");
    toaster.destroy();
  });

  it("supports toast.custom with string HTML", () => {
    const toaster = createToaster({ autoClose: false }, { headless: true });
    const onClose = vi.fn();
    toaster.custom("<em>Custom</em>", { onClose });
    expect(toaster.getToasts()[0]?.customContent).toBe("<em>Custom</em>");
    toaster.dismiss();
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ customContent: "<em>Custom</em>" }),
      "Manual",
    );
    toaster.destroy();
  });

  it("supports toast.custom with HTMLElement", () => {
    const toaster = createToaster({ autoClose: false }, { headless: true });
    const el = document.createElement("div");
    el.textContent = "Node content";
    toaster.custom(el);
    expect(toaster.getToasts()[0]?.customContent).toBe(el);
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
    expect(document.querySelector(".an-toast__message")?.textContent).toBe(
      "Visible",
    );
    toaster.destroy();
  });

  it("renders title and message with correct classes", () => {
    const toaster = createToaster({ autoClose: false });
    toaster.success("Body text", { title: "Heading" });
    expect(document.querySelector(".an-toast__title")?.textContent).toBe(
      "Heading",
    );
    expect(document.querySelector(".an-toast__message")?.textContent).toBe(
      "Body text",
    );
    toaster.destroy();
  });
});
