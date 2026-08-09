import { useEffect, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast as coreToast } from "alert-notify";
import type { ToastId, ToastOptions, ToasterConfig } from "alert-notify";

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
 * import { toast } from "alert-notify"
 * import { Toaster } from "alert-notify/react"
 *
 * <Toaster position="top-center" theme="system" />
 * toast.success("Saved")
 */
export function Toaster(props: ToasterProps): null {
  useEffect(() => {
    coreToast.config(props);
  }, [
    props.position,
    props.theme,
    props.duration,
    props.autoClose,
    props.closeButton,
    props.dismissible,
    props.richColors,
    props.visibleToasts,
    props.expand,
    props.gap,
    props.offset,
    props.dir,
    props.pauseOnHover,
    props.resetTimerOnHover,
    props.pauseOnWindowBlur,
    props.progressBar,
    props.toasterClassName,
  ]);

  return null;
}

const customRoots = new Map<ToastId, Root>();

/**
 * Show a toast with custom React content. Mounts into a DOM node owned by the
 * core custom toast path. Unmounts when the toast closes.
 *
 * @param content - React tree rendered inside the custom toast host.
 * @param options - Per-toast options (same as core `toast.custom`).
 */
export function custom(
  content: ReactNode,
  options: ToastOptions = {},
): ToastId {
  const host = document.createElement("div");
  host.className = "an-toast__react-root";
  const root = createRoot(host);

  const userOnClose = options.onClose;
  const id = coreToast.custom(host, {
    ...options,
    onClose: (record, reason) => {
      const mounted = customRoots.get(record.id);
      if (mounted) {
        mounted.unmount();
        customRoots.delete(record.id);
      }
      userOnClose?.(record, reason);
    },
  });

  customRoots.set(id, root);
  root.render(content);
  return id;
}

export { coreToast as toast };
