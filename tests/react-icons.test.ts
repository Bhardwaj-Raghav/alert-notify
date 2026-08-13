import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

vi.mock("alert-notify", async () => {
  const actual = await vi.importActual<typeof import("../src/index")>(
    "../src/index",
  );
  return actual;
});

describe("react toast icons", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("accepts a React element as icon", async () => {
    const { toast } = await import("../src/react/index");
    toast.config({ autoClose: false });
    const id = toast.info("Payment", {
      icon: createElement("img", {
        src: "https://example.com/pay.png",
        alt: "pay",
      }),
    });
    expect(toast.isActive(id)).toBe(true);
    const host = document.querySelector(".an-toast__react-icon");
    expect(host).toBeTruthy();
    toast.dismiss(id);
    expect(toast.isActive(id)).toBe(false);
  });
});
