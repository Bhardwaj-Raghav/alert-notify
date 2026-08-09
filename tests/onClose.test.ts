import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToaster } from "../src/create-toaster";

describe("onClose lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("close button → Manual", () => {
    const toaster = createToaster({ autoClose: false });
    const onClose = vi.fn();
    toaster.success("Close me", { onClose });
    document.querySelector<HTMLButtonElement>("[data-an-close]")?.click();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    toaster.destroy();
  });

  it("toast.dismiss → Manual", () => {
    const toaster = createToaster({ autoClose: false }, { headless: true });
    const onClose = vi.fn();
    const id = toaster.success("Dismiss me", { onClose });
    toaster.dismiss(id);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    toaster.destroy();
  });

  it("swipe → Manual", () => {
    const toaster = createToaster({ autoClose: false, dismissible: true });
    const onClose = vi.fn();
    toaster.success("Swipe me", { onClose });
    const li = document.querySelector<HTMLElement>("[data-an-toast-id]");
    expect(li).toBeTruthy();

    const fire = (type: string, clientX: number) => {
      const event = new Event(type, { bubbles: true }) as Event & {
        clientX: number;
        pointerId: number;
      };
      Object.defineProperty(event, "clientX", { value: clientX });
      Object.defineProperty(event, "pointerId", { value: 1 });
      li!.dispatchEvent(event);
    };

    fire("pointerdown", 0);
    fire("pointermove", 120);
    fire("pointerup", 120);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    toaster.destroy();
  });

  it("timeout → Auto", () => {
    const toaster = createToaster({ duration: 1000 }, { headless: true });
    const onClose = vi.fn();
    toaster.success("Auto me", { onClose });
    vi.advanceTimersByTime(1000);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Auto");
    expect(onClose.mock.calls[0]?.[0].message).toBe("Auto me");
    toaster.destroy();
  });

  it("does not fire while toast remains open", () => {
    const toaster = createToaster({ duration: 5000 }, { headless: true });
    const onClose = vi.fn();
    toaster.success("Still open", { onClose });
    vi.advanceTimersByTime(1000);
    expect(onClose).not.toHaveBeenCalled();
    toaster.destroy();
  });

  it("custom toasts trigger onClose", () => {
    const toaster = createToaster({ autoClose: false }, { headless: true });
    const onClose = vi.fn();
    toaster.custom("<b>X</b>", { onClose });
    toaster.dismiss();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0]?.[1]).toBe("Manual");
    toaster.destroy();
  });
});
