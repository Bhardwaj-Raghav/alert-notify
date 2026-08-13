import { afterEach, describe, expect, it } from "vitest";
import { createToaster } from "../src/create-toaster";

describe("per-toast position stacks", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("places toasts into separate position stacks", () => {
    const toaster = createToaster({
      position: "top-right",
      autoClose: false,
    });
    toaster.success("Default corner");
    toaster.info("Other corner", { position: "bottom-left" });

    const stacks = document.querySelectorAll("[data-an-toaster]");
    expect(stacks.length).toBe(2);
    expect(
      document.querySelector('.an-toaster--top-right [data-an-toast-id]'),
    ).toBeTruthy();
    expect(
      document.querySelector('.an-toaster--bottom-left [data-an-toast-id]'),
    ).toBeTruthy();
    toaster.destroy();
  });

  it("isActive tracks rendered toast ids", () => {
    const toaster = createToaster({ autoClose: false });
    const id = toaster.success("Hello");
    expect(toaster.isActive(id)).toBe(true);
    toaster.dismiss(id);
    expect(toaster.isActive(id)).toBe(false);
    toaster.destroy();
  });

  it("applies per-toast className", () => {
    const toaster = createToaster({ autoClose: false });
    toaster.success("Styled", { className: "my-custom-toast" });
    expect(document.querySelector(".an-toast.my-custom-toast")).toBeTruthy();
    toaster.destroy();
  });
});
