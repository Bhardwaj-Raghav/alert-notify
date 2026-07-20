import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastStore } from "../src/store";

describe("ToastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds toasts and notifies subscribers", () => {
    const store = new ToastStore({ duration: 5000 });
    const seen: number[] = [];
    store.subscribe((toasts) => seen.push(toasts.length));

    const id = store.add("Hello", { type: "success" });
    expect(id).toBeTruthy();
    expect(store.getToasts()).toHaveLength(1);
    expect(store.getToasts()[0]?.title).toBe("Hello");
    expect(seen.at(-1)).toBe(1);
  });

  it("coalesces toasts with the same id", () => {
    const store = new ToastStore();
    store.add("First", { id: "save", type: "loading" });
    store.add("Second", { id: "save", type: "success" });

    const toasts = store.getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toBe("Second");
    expect(toasts[0]?.type).toBe("success");
  });

  it("puts important toasts at the front", () => {
    const store = new ToastStore();
    store.add("Normal");
    store.add("Urgent", { important: true });
    expect(store.getToasts()[0]?.title).toBe("Urgent");
  });

  it("auto-dismisses after duration", () => {
    const store = new ToastStore({ duration: 1000 });
    const onAutoClose = vi.fn();
    store.add("Temp", { onAutoClose });
    expect(store.getToasts()).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(store.getToasts()).toHaveLength(0);
    expect(onAutoClose).toHaveBeenCalledOnce();
  });

  it("does not auto-dismiss infinite duration", () => {
    const store = new ToastStore();
    store.add("Sticky", { duration: Number.POSITIVE_INFINITY });
    vi.advanceTimersByTime(60_000);
    expect(store.getToasts()).toHaveLength(1);
  });

  it("pauses and resumes timers", () => {
    const store = new ToastStore({ duration: 1000 });
    const id = store.add("Paused");
    vi.advanceTimersByTime(400);
    store.pause(id);
    vi.advanceTimersByTime(2000);
    expect(store.getToasts()).toHaveLength(1);

    store.resume(id);
    vi.advanceTimersByTime(600);
    expect(store.getToasts()).toHaveLength(0);
  });

  it("dismisses by id and all", () => {
    const store = new ToastStore({ duration: Number.POSITIVE_INFINITY });
    const onDismiss = vi.fn();
    const a = store.add("A", { onDismiss });
    store.add("B");
    store.dismiss(a);
    expect(store.getToasts()).toHaveLength(1);
    expect(onDismiss).toHaveBeenCalledOnce();
    store.dismiss();
    expect(store.getToasts()).toHaveLength(0);
  });

  it("updates config", () => {
    const store = new ToastStore();
    store.setConfig({ position: "bottom-left", richColors: true });
    expect(store.getConfig().position).toBe("bottom-left");
    expect(store.getConfig().richColors).toBe(true);
  });
});
