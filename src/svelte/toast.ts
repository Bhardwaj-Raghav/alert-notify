import { mount, unmount, type Component } from "svelte";
import { toast as coreToast } from "alert-notify";
import type {
  ToastCloseReason,
  ToastId,
  ToastOptions,
  ToastRecord,
  ToasterConfig,
  ToasterInstance,
} from "alert-notify";

/**
 * Mount a Svelte component into a toast icon or custom body.
 */
export type SvelteMountable = {
  component: Component;
  props?: Record<string, unknown>;
};

/**
 * Factory that mounts into `target` and optionally returns an unmount function.
 */
export type SvelteMountFactory = (
  target: HTMLElement,
) => void | (() => void);

export type SvelteToastOptions = Omit<ToastOptions, "icon"> & {
  icon?: ToastOptions["icon"] | SvelteMountable | SvelteMountFactory;
};

type SvelteHost = HTMLElement & { __anUnmount?: () => void };

function isCoreIcon(
  icon: SvelteToastOptions["icon"],
): icon is string | HTMLElement | false | undefined {
  return (
    icon === undefined ||
    icon === false ||
    typeof icon === "string" ||
    (typeof HTMLElement !== "undefined" && icon instanceof HTMLElement)
  );
}

function isMountable(
  icon: SvelteToastOptions["icon"],
): icon is SvelteMountable {
  return (
    typeof icon === "object" &&
    icon !== null &&
    !(icon instanceof HTMLElement) &&
    "component" in icon
  );
}

function mountSvelteContent(
  content: SvelteMountable | SvelteMountFactory,
  className: string,
): HTMLElement {
  const host = document.createElement("span") as SvelteHost;
  host.className = className;

  if (typeof content === "function") {
    const cleanup = content(host);
    host.__anUnmount = typeof cleanup === "function" ? cleanup : undefined;
    return host;
  }

  const instance = mount(content.component, {
    target: host,
    props: content.props ?? {},
  });
  host.__anUnmount = () => {
    unmount(instance);
  };
  return host;
}

function toCoreOptions(options: SvelteToastOptions = {}): ToastOptions {
  const { icon, onClose, ...rest } = options;
  if (isCoreIcon(icon)) {
    return { ...rest, icon, onClose };
  }

  const host = mountSvelteContent(
    icon,
    "an-toast__svelte-icon",
  ) as SvelteHost;
  return {
    ...rest,
    icon: host,
    onClose: (record: ToastRecord, reason: ToastCloseReason) => {
      host.__anUnmount?.();
      onClose?.(record, reason);
    },
  };
}

type SvelteToasterInstance = {
  (message: string | undefined, options?: SvelteToastOptions): ToastId;
  success: (
    message: string | undefined,
    options?: SvelteToastOptions,
  ) => ToastId;
  error: (message: string | undefined, options?: SvelteToastOptions) => ToastId;
  warning: (
    message: string | undefined,
    options?: SvelteToastOptions,
  ) => ToastId;
  info: (message: string | undefined, options?: SvelteToastOptions) => ToastId;
  loading: (
    message: string | undefined,
    options?: SvelteToastOptions,
  ) => ToastId;
  message: (
    message: string | undefined,
    options?: SvelteToastOptions,
  ) => ToastId;
  custom: ToasterInstance["custom"];
  promise: ToasterInstance["promise"];
  dismiss: ToasterInstance["dismiss"];
  isActive: ToasterInstance["isActive"];
  config: ToasterInstance["config"];
  getConfig: ToasterInstance["getConfig"];
  getToasts: ToasterInstance["getToasts"];
  subscribe: ToasterInstance["subscribe"];
  destroy: ToasterInstance["destroy"];
};

function createTyped(
  type: "success" | "error" | "warning" | "info" | "loading" | "message",
): (message: string | undefined, options?: SvelteToastOptions) => ToastId {
  return (message, options = {}) =>
    coreToast[type](message, toCoreOptions(options));
}

/**
 * Svelte-aware toast API. Accepts Svelte component icons and `string | undefined` messages.
 * Import from `alert-notify/svelte` when mounting Svelte components as icons.
 */
export const toast: SvelteToasterInstance = Object.assign(
  (message: string | undefined, options: SvelteToastOptions = {}) =>
    coreToast(message, toCoreOptions(options)),
  {
    success: createTyped("success"),
    error: createTyped("error"),
    warning: createTyped("warning"),
    info: createTyped("info"),
    loading: createTyped("loading"),
    message: createTyped("message"),
    custom: coreToast.custom.bind(coreToast),
    promise: coreToast.promise.bind(coreToast),
    dismiss: coreToast.dismiss.bind(coreToast),
    isActive: coreToast.isActive.bind(coreToast),
    config: coreToast.config.bind(coreToast),
    getConfig: coreToast.getConfig.bind(coreToast),
    getToasts: coreToast.getToasts.bind(coreToast),
    subscribe: coreToast.subscribe.bind(coreToast),
    destroy: coreToast.destroy.bind(coreToast),
  },
);

/**
 * Show a toast with custom Svelte content.
 * Pass `{ component, props }` or a mount factory. Unmounts when the toast closes.
 */
export function custom(
  content: SvelteMountable | SvelteMountFactory,
  options: SvelteToastOptions = {},
): ToastId {
  const host = mountSvelteContent(content, "an-toast__svelte-root") as SvelteHost;
  const coreOptions = toCoreOptions(options);
  const userOnClose = coreOptions.onClose;

  return coreToast.custom(host, {
    ...coreOptions,
    onClose: (record, reason) => {
      host.__anUnmount?.();
      userOnClose?.(record, reason);
    },
  });
}

export type { ToasterConfig, ToastId, ToastOptions };
