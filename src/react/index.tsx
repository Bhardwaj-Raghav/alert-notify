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
