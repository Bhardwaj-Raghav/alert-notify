import { useEffect, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast as coreToast } from "alert-notify";
import type {
  ToastId,
  ToastOptions,
  ToastRecord,
  ToastCloseReason,
  ToasterConfig,
  ToasterInstance,
} from "alert-notify";

/**
 * Props for {@link Toaster}. Same fields as {@link ToasterConfig}; only provided
 * keys are synced via `toast.config`. See `ToasterConfig` for defaults and meaning.
 */
export type ToasterProps = Partial<ToasterConfig>;

/**
 * Optional React helper. The core auto-mounts a portal. This only syncs
 * config from props (Sonner-style DX). Place once near your app root.
 *
 * The published `alert-notify/react` entry is a Client Component
 * (`"use client"` is prepended at build time for Next.js App Router).
 *
 * @example
 * import { toast, Toaster } from "alert-notify/react"
 *
 * <Toaster position="top-center" theme="system" />
 * toast.success("Saved")
 */
export function Toaster({
  position,
  theme,
  duration,
  autoClose,
  closeButton,
  dismissible,
  richColors,
  visibleToasts,
  expand,
  gap,
  offset,
  dir,
  pauseOnHover,
  resetTimerOnHover,
  pauseOnWindowBlur,
  progressBar,
  toasterClassName,
}: ToasterProps): null {
  useEffect(() => {
    const config: Partial<ToasterConfig> = {};
    if (position !== undefined) config.position = position;
    if (theme !== undefined) config.theme = theme;
    if (duration !== undefined) config.duration = duration;
    if (autoClose !== undefined) config.autoClose = autoClose;
    if (closeButton !== undefined) config.closeButton = closeButton;
    if (dismissible !== undefined) config.dismissible = dismissible;
    if (richColors !== undefined) config.richColors = richColors;
    if (visibleToasts !== undefined) config.visibleToasts = visibleToasts;
    if (expand !== undefined) config.expand = expand;
    if (gap !== undefined) config.gap = gap;
    if (offset !== undefined) config.offset = offset;
    if (dir !== undefined) config.dir = dir;
    if (pauseOnHover !== undefined) config.pauseOnHover = pauseOnHover;
    if (resetTimerOnHover !== undefined) config.resetTimerOnHover = resetTimerOnHover;
    if (pauseOnWindowBlur !== undefined) config.pauseOnWindowBlur = pauseOnWindowBlur;
    if (progressBar !== undefined) config.progressBar = progressBar;
    if (toasterClassName !== undefined) config.toasterClassName = toasterClassName;
    coreToast.config(config);
  }, [
    position,
    theme,
    duration,
    autoClose,
    closeButton,
    dismissible,
    richColors,
    visibleToasts,
    expand,
    gap,
    offset,
    dir,
    pauseOnHover,
    resetTimerOnHover,
    pauseOnWindowBlur,
    progressBar,
    toasterClassName,
  ]);

  return null;
}

const customRoots = new Map<ToastId, Root>();
const iconRoots = new Map<ToastId, Root>();

/**
 * Per-toast options with React node icons.
 */
export type ReactToastOptions = Omit<ToastOptions, "icon"> & {
  icon?: ToastOptions["icon"] | ReactNode;
};

function isCoreIcon(
  icon: ReactToastOptions["icon"],
): icon is string | HTMLElement | false | undefined {
  return (
    icon === undefined ||
    icon === false ||
    typeof icon === "string" ||
    (typeof HTMLElement !== "undefined" && icon instanceof HTMLElement)
  );
}

function mountReactIcon(icon: ReactNode): HTMLElement {
  const host = document.createElement("span");
  host.className = "an-toast__react-icon";
  const root = createRoot(host);
  root.render(icon);
  (host as HTMLElement & { __anRoot?: Root }).__anRoot = root;
  return host;
}

function unwrapIconRoot(host: HTMLElement): Root | undefined {
  return (host as HTMLElement & { __anRoot?: Root }).__anRoot;
}

function toCoreOptions(options: ReactToastOptions = {}): ToastOptions {
  const { icon, onClose, ...rest } = options;
  if (isCoreIcon(icon)) {
    return { ...rest, icon, onClose };
  }

  const host = mountReactIcon(icon);
  const root = unwrapIconRoot(host);
  return {
    ...rest,
    icon: host,
    onClose: (record: ToastRecord, reason: ToastCloseReason) => {
      if (root) {
        root.unmount();
      }
      iconRoots.delete(record.id);
      onClose?.(record, reason);
    },
  };
}

function trackIconRoot(id: ToastId, options: ReactToastOptions): void {
  const icon = options.icon;
  if (isCoreIcon(icon)) {
    return;
  }
  const toast = coreToast.getToasts().find((item) => item.id === id);
  if (toast?.icon instanceof HTMLElement) {
    const root = unwrapIconRoot(toast.icon);
    if (root) {
      iconRoots.set(id, root);
    }
  }
}

type ReactToasterInstance = {
  (message: string | undefined, options?: ReactToastOptions): ToastId;
  success: (message: string | undefined, options?: ReactToastOptions) => ToastId;
  error: (message: string | undefined, options?: ReactToastOptions) => ToastId;
  warning: (message: string | undefined, options?: ReactToastOptions) => ToastId;
  info: (message: string | undefined, options?: ReactToastOptions) => ToastId;
  loading: (message: string | undefined, options?: ReactToastOptions) => ToastId;
  message: (message: string | undefined, options?: ReactToastOptions) => ToastId;
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
): (message: string | undefined, options?: ReactToastOptions) => ToastId {
  return (message, options = {}) => {
    const id = coreToast[type](message, toCoreOptions(options));
    trackIconRoot(id, options);
    return id;
  };
}

/**
 * React-aware toast API. Accepts `ReactNode` icons and `string | undefined` messages.
 * Import from `alert-notify/react` when passing JSX icons.
 */
export const toast: ReactToasterInstance = Object.assign(
  (message: string | undefined, options: ReactToastOptions = {}) => {
    const id = coreToast(message, toCoreOptions(options));
    trackIconRoot(id, options);
    return id;
  },
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
 * Show a toast with custom React content. Mounts into a DOM node owned by the
 * core custom toast path. Unmounts when the toast closes.
 *
 * @param content - React tree rendered inside the custom toast host.
 * @param options - Per-toast options (same as core `toast.custom`, plus React icons).
 */
export function custom(
  content: ReactNode,
  options: ReactToastOptions = {},
): ToastId {
  const host = document.createElement("div");
  host.className = "an-toast__react-root";
  const root = createRoot(host);

  const coreOptions = toCoreOptions(options);
  const userOnClose = coreOptions.onClose;
  const id = coreToast.custom(host, {
    ...coreOptions,
    onClose: (record, reason) => {
      const mounted = customRoots.get(record.id);
      if (mounted) {
        mounted.unmount();
        customRoots.delete(record.id);
      }
      const iconRoot = iconRoots.get(record.id);
      if (iconRoot) {
        iconRoot.unmount();
        iconRoots.delete(record.id);
      }
      userOnClose?.(record, reason);
    },
  });

  customRoots.set(id, root);
  trackIconRoot(id, options);
  root.render(content);
  return id;
}

export type { ToasterConfig, ToastId, ToastOptions };
