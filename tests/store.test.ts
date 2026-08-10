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
    expect(store.getToasts()[0]?.message).toBe("Hello");
    expect(seen.at(-1)).toBe(1);
  });

  it("stores optional title separately from message", () => {
    const store = new ToastStore();
    store.add("Your profile was saved.", {
      title: "Profile updated",
      type: "success",
    });
    const toast = store.getToasts()[0];
    expect(toast?.title).toBe("Profile updated");
    expect(toast?.message).toBe("Your profile was saved.");
  });

  it("coalesces toasts with the same id", () => {
    const store = new ToastStore();
    store.add("First", { id: "save", type: "loading" });
    store.add("Second", { id: "save", type: "success" });

    const toasts = store.getToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Second");
    expect(toasts[0]?.type).toBe("success");
  });

  it("puts important toasts at the front", () => {
    const store = new ToastStore();
    store.add("Normal");
    store.add("Urgent", { important: true });
    expect(store.getToasts()[0]?.message).toBe("Urgent");
  });

  it("auto-dismisses after duration with onClose Auto", () => {
    const store = new ToastStore({ duration: 1000 });
    const onClose = vi.fn();
    store.add("Temp", { onClose });
    expect(store.getToasts()).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(store.getToasts()).toHaveLength(0);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Auto");
  });

  it("does not auto-dismiss when autoClose is false", () => {
    const store = new ToastStore({ duration: 1000 });
    store.add("Sticky", { autoClose: false, duration: 1000 });
    vi.advanceTimersByTime(60_000);
    expect(store.getToasts()).toHaveLength(1);
  });

  it("does not auto-dismiss infinite duration with autoClose true", () => {
    const store = new ToastStore();
    store.add("Sticky", {
      autoClose: true,
      duration: Number.POSITIVE_INFINITY,
    });
    vi.advanceTimersByTime(60_000);
    expect(store.getToasts()).toHaveLength(1);
  });

  it("defaults loading toasts to autoClose false", () => {
    const store = new ToastStore({ duration: 1000 });
    store.add("Loading…", { type: "loading" });
    expect(store.getToasts()[0]?.autoClose).toBe(false);
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

  it("resetTimer restarts remaining and progressKey", () => {
    const store = new ToastStore({ duration: 1000 });
    const id = store.add("Reset me");
    vi.advanceTimersByTime(400);
    store.pause(id);
    const before = store.getToasts()[0];
    expect(before?.remaining).toBeLessThan(1000);

    store.resetTimer(id);
    const after = store.getToasts()[0];
    expect(after?.remaining).toBe(1000);
    expect(after?.progressKey).toBe((before?.progressKey ?? 0) + 1);
    expect(after?.pausedAt).toBeUndefined();
  });

  it("does not pause or reset when autoClose is false", () => {
    const store = new ToastStore();
    const id = store.add("Manual only", { autoClose: false, duration: 1000 });
    store.pause(id);
    expect(store.getToasts()[0]?.pausedAt).toBeUndefined();
    store.resetTimer(id);
    expect(store.getToasts()[0]?.progressKey).toBe(0);
  });

  it("dismisses by id with onClose Manual", () => {
    const store = new ToastStore({ autoClose: false });
    const onClose = vi.fn();
    const a = store.add("A", { onClose });
    store.add("B");
    store.dismiss(a);
    expect(store.getToasts()).toHaveLength(1);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[0].message).toBe("A");
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    store.dismiss();
    expect(store.getToasts()).toHaveLength(0);
  });

  it("fires onClose exactly once", () => {
    const store = new ToastStore({ duration: 500 });
    const onClose = vi.fn();
    const id = store.add("Once", { onClose });
    store.dismiss(id);
    store.dismiss(id);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("defaults theme to light", () => {
    const store = new ToastStore();
    expect(store.getConfig().theme).toBe("light");
    expect(store.getConfig().autoClose).toBe(true);
    expect(store.getConfig().resetTimerOnHover).toBe(false);
  });

  it("updates config", () => {
    const store = new ToastStore();
    store.setConfig({
      position: "bottom-left",
      richColors: true,
      resetTimerOnHover: true,
    });
    expect(store.getConfig().position).toBe("bottom-left");
    expect(store.getConfig().richColors).toBe(true);
    expect(store.getConfig().resetTimerOnHover).toBe(true);
  });

  it("supports custom content records", () => {
    const store = new ToastStore({ autoClose: false });
    store.addCustom("<strong>Hi</strong>", { type: "info" });
    expect(store.getToasts()[0]?.customContent).toBe("<strong>Hi</strong>");
    expect(store.getToasts()[0]?.icon).toBe(false);
  });
});
