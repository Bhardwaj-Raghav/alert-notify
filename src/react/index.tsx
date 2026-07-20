import { useEffect } from "react";
import { toast } from "alert-notify";
import type { ToasterConfig } from "alert-notify";

export type ToasterProps = Partial<ToasterConfig>;

/**
 * Optional React helper. The core auto-mounts a portal — this only syncs
 * config from props (Sonner-style DX). Place once near your app root.
 *
 * @example
 * import { toast } from "alert-notify"
 * import { Toaster } from "alert-notify/react"
 * import "alert-notify/style.css"
 */
export function Toaster(props: ToasterProps): null {
  useEffect(() => {
    toast.config(props);
  }, [
    props.position,
    props.theme,
    props.duration,
    props.closeButton,
    props.dismissible,
    props.richColors,
    props.visibleToasts,
    props.expand,
    props.gap,
    props.offset,
    props.dir,
    props.pauseOnHover,
    props.pauseOnWindowBlur,
    props.progressBar,
    props.toasterClassName,
  ]);

  return null;
}
