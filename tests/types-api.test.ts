import { describe, expect, expectTypeOf, it } from "vitest";
import { createToaster } from "../src/create-toaster";
import type {
  ToastCloseReason,
  ToastOptions,
  ToastRecord,
} from "../src/types";

describe("TypeScript API surface", () => {
  it("types title, message, autoClose, and onClose correctly", () => {
    expectTypeOf<ToastOptions>().toHaveProperty("title");
    expectTypeOf<ToastOptions>().toHaveProperty("autoClose");
    expectTypeOf<ToastOptions>().toHaveProperty("onClose");
    expectTypeOf<ToastOptions>().toHaveProperty("onOpen");
    expectTypeOf<ToastOptions>().toHaveProperty("richColors");
    expectTypeOf<ToastOptions>().toHaveProperty("position");
    expectTypeOf<ToastOptions["title"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ToastOptions["autoClose"]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<ToastCloseReason>().toEqualTypeOf<"Manual" | "Auto">();

    type OnClose = NonNullable<ToastOptions["onClose"]>;
    expectTypeOf<OnClose>().parameters.toEqualTypeOf<
      [toast: ToastRecord, reason: ToastCloseReason]
    >();
  });

  it("rejects removed v2 option keys at the type level", () => {
    expectTypeOf<ToastOptions>().not.toHaveProperty("description");
    expectTypeOf<ToastOptions>().not.toHaveProperty("onDismiss");
    expectTypeOf<ToastOptions>().not.toHaveProperty("onAutoClose");
    expectTypeOf<ToastOptions>().not.toHaveProperty("html");
  });

  it("standard helpers accept string | undefined message", () => {
    const toaster = createToaster({}, { headless: true });
    expectTypeOf(toaster.success).parameter(0).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(toaster.custom).parameter(0).toEqualTypeOf<
      string | HTMLElement
    >();
    expectTypeOf(toaster.isActive).parameter(0).toEqualTypeOf<string>();
    toaster.destroy();
  });

  it("runtime smoke for typed options object", () => {
    const options: ToastOptions = {
      title: "Heading",
      autoClose: false,
      richColors: true,
      position: "bottom-left",
      onOpen: (_toast) => undefined,
      onClose: (_toast, reason) => {
        expect(reason === "Manual" || reason === "Auto").toBe(true);
      },
    };
    expect(options.title).toBe("Heading");
  });
});
