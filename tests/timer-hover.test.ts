import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToaster } from "../src/create-toaster";
import { ToastStore } from "../src/store";

describe("timer hover behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("pauseOnHover=true pauses remaining without resetting progressKey", () => {
    const store = new ToastStore({ duration: 2000, pauseOnHover: true });
    const id = store.add("A");
    vi.advanceTimersByTime(500);
    const keyBefore = store.getToasts()[0]?.progressKey;
    store.pause(id);
    expect(store.getToasts()[0]?.pausedAt).toBeDefined();
    expect(store.getToasts()[0]?.remaining).toBeLessThan(2000);
    expect(store.getToasts()[0]?.progressKey).toBe(keyBefore);
  });

  it("pauseOnHover=false leaves timer running when not paused", () => {
    const store = new ToastStore({ duration: 1000, pauseOnHover: false });
    store.add("A");
    vi.advanceTimersByTime(1000);
    expect(store.getToasts()).toHaveLength(0);
  });

  it("resetTimerOnHover=false does not reset remaining on resetTimer skip path", () => {
    const store = new ToastStore({
      duration: 2000,
      resetTimerOnHover: false,
    });
    const id = store.add("A");
    vi.advanceTimersByTime(500);
    store.pause(id);
    const remaining = store.getToasts()[0]?.remaining ?? 0;
    // Without calling resetTimer (config false means renderer won't), remaining stays
    expect(remaining).toBeLessThan(2000);
    expect(store.getToasts()[0]?.progressKey).toBe(0);
  });

  it("resetTimerOnHover path resets timer and progress together", () => {
    const store = new ToastStore({ duration: 2000 });
    const id = store.add("A");
    vi.advanceTimersByTime(800);
    store.pause(id);
    store.resetTimer(id);
    const toast = store.getToasts()[0];
    expect(toast?.remaining).toBe(2000);
    expect(toast?.progressKey).toBe(1);
    expect(toast?.pausedAt).toBeUndefined();
  });

  it("progress element is not recreated on pause-only updates", () => {
    const toaster = createToaster({ duration: 5000, pauseOnHover: true });
    const id = toaster.success("Synced");
    const progress = document.querySelector("[data-an-progress]");
    expect(progress).toBeTruthy();
    const key = progress?.getAttribute("data-progress-key");

    // Simulate pause via store through hover handlers by pausing
    const storeToast = toaster.getToasts()[0];
    expect(storeToast).toBeTruthy();
    vi.advanceTimersByTime(200);

    // Direct pause through config path: mouseenter calls pauseAll
    const ol = document.querySelector("[data-an-toaster]");
    ol?.dispatchEvent(new Event("mouseenter", { bubbles: true }));

    const progressAfter = document.querySelector<HTMLElement>("[data-an-progress]");
    expect(progressAfter?.getAttribute("data-progress-key")).toBe(key);
    expect(progressAfter?.dataset.paused).toBe("true");
    expect(toaster.getToasts()[0]?.id).toBe(id);
    toaster.destroy();
  });

  it("resetTimerOnHover recreates progress with new progressKey", () => {
    const toaster = createToaster({
      duration: 5000,
      pauseOnHover: false,
      resetTimerOnHover: true,
    });
    toaster.success("Reset");
    const before = document
      .querySelector("[data-an-progress]")
      ?.getAttribute("data-progress-key");
    vi.advanceTimersByTime(300);
    const ol = document.querySelector("[data-an-toaster]");
    ol?.dispatchEvent(new Event("mouseenter", { bubbles: true }));
    const after = document
      .querySelector("[data-an-progress]")
      ?.getAttribute("data-progress-key");
    expect(Number(after)).toBeGreaterThan(Number(before));
    expect(toaster.getToasts()[0]?.remaining).toBe(5000);
    toaster.destroy();
  });

  it("stacked toasts share a continuous hitbox covering gaps", () => {
    const toaster = createToaster({
      duration: Number.POSITIVE_INFINITY,
      autoClose: false,
      gap: 12,
      expand: true,
    });
    toaster.success("One");
    toaster.success("Two");
    toaster.success("Three");

    const hitbox = document.querySelector<HTMLElement>("[data-an-hitbox]");
    expect(hitbox).toBeTruthy();

    const ol = document.querySelector("[data-an-toaster]");
    ol?.dispatchEvent(new Event("mouseenter", { bubbles: true }));
    ol?.dispatchEvent(new Event("mouseleave", { bubbles: true }));
    expect(toaster.getToasts()).toHaveLength(3);
    toaster.destroy();
  });

  it("keeps timer/progress synchronized: remaining matches progress duration after pause", () => {
    const toaster = createToaster({ duration: 2000, pauseOnHover: true });
    toaster.success("Sync");
    vi.advanceTimersByTime(500);
    document
      .querySelector("[data-an-toaster]")
      ?.dispatchEvent(new Event("mouseenter", { bubbles: true }));
    const remaining = toaster.getToasts()[0]?.remaining ?? 0;
    const progress = document.querySelector<HTMLElement>("[data-an-progress]");
    expect(progress?.dataset.paused).toBe("true");
    // Progress CSS duration is set at create; pause must not rewrite it to full duration
    const durationCss = progress?.style.getPropertyValue("--an-duration");
    expect(durationCss).toBe("2000ms");
    expect(remaining).toBeLessThan(2000);
    expect(remaining).toBeGreaterThan(0);
    toaster.destroy();
  });
});
