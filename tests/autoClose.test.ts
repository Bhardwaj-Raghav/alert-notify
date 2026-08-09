import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToaster } from "../src/create-toaster";

describe("autoClose", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("autoClose=true with finite duration closes", () => {
    const toaster = createToaster({ duration: 2000 }, { headless: true });
    const onClose = vi.fn();
    toaster.success("Go", { autoClose: true, duration: 2000, onClose });
    vi.advanceTimersByTime(2000);
    expect(toaster.getToasts()).toHaveLength(0);
    expect(onClose.mock.calls[0]?.[1]).toBe("Auto");
    toaster.destroy();
  });

  it("autoClose=false with finite duration stays open", () => {
    const toaster = createToaster({}, { headless: true });
    toaster.success("Stay", { autoClose: false, duration: 5000 });
    vi.advanceTimersByTime(60_000);
    expect(toaster.getToasts()).toHaveLength(1);
    toaster.destroy();
  });

  it("autoClose=false with Infinity stays open", () => {
    const toaster = createToaster({}, { headless: true });
    toaster.success("Stay", {
      autoClose: false,
      duration: Number.POSITIVE_INFINITY,
    });
    vi.advanceTimersByTime(60_000);
    expect(toaster.getToasts()).toHaveLength(1);
    toaster.destroy();
  });

  it("autoClose=true with Infinity stays open", () => {
    const toaster = createToaster({}, { headless: true });
    toaster.success("Forever", {
      autoClose: true,
      duration: Number.POSITIVE_INFINITY,
    });
    vi.advanceTimersByTime(60_000);
    expect(toaster.getToasts()).toHaveLength(1);
    toaster.destroy();
  });

  it("ignores duration for dismissal when autoClose=false", () => {
    const toaster = createToaster({ duration: 100 }, { headless: true });
    toaster.success("Ignore", { autoClose: false, duration: 100 });
    vi.advanceTimersByTime(10_000);
    expect(toaster.getToasts()).toHaveLength(1);
    toaster.destroy();
  });

  it("does not render progress when autoClose=false", () => {
    const toaster = createToaster({ progressBar: true, autoClose: false });
    toaster.success("No bar", { autoClose: false, duration: 5000 });
    expect(document.querySelector("[data-an-progress]")).toBeNull();
    toaster.destroy();
  });

  it("renders progress when autoClose=true and finite duration", () => {
    const toaster = createToaster({ progressBar: true, duration: 4000 });
    toaster.success("Bar");
    expect(document.querySelector("[data-an-progress]")).toBeTruthy();
    toaster.destroy();
  });

  it("allows manual dismissal when autoClose=false", () => {
    const toaster = createToaster({}, { headless: true });
    const onClose = vi.fn();
    const id = toaster.success("Manual", { autoClose: false, onClose });
    toaster.dismiss(id);
    expect(toaster.getToasts()).toHaveLength(0);
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    toaster.destroy();
  });

  it("loading defaults to autoClose false", () => {
    const toaster = createToaster({ duration: 500 }, { headless: true });
    toaster.loading("Wait");
    expect(toaster.getToasts()[0]?.autoClose).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(toaster.getToasts()).toHaveLength(1);
    toaster.destroy();
  });
});
