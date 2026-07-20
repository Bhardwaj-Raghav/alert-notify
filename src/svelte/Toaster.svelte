<script lang="ts">
  import { toast } from "alert-notify";
  import type { ToasterConfig } from "alert-notify";

  type Props = Partial<ToasterConfig>;

  let {
    position,
    theme,
    duration,
    closeButton,
    dismissible,
    richColors,
    visibleToasts,
    expand,
    gap,
    offset,
    dir,
    pauseOnHover,
    pauseOnWindowBlur,
    progressBar,
    toasterClassName,
  }: Props = $props();

  $effect(() => {
    const config: Partial<ToasterConfig> = {};
    if (position !== undefined) config.position = position;
    if (theme !== undefined) config.theme = theme;
    if (duration !== undefined) config.duration = duration;
    if (closeButton !== undefined) config.closeButton = closeButton;
    if (dismissible !== undefined) config.dismissible = dismissible;
    if (richColors !== undefined) config.richColors = richColors;
    if (visibleToasts !== undefined) config.visibleToasts = visibleToasts;
    if (expand !== undefined) config.expand = expand;
    if (gap !== undefined) config.gap = gap;
    if (offset !== undefined) config.offset = offset;
    if (dir !== undefined) config.dir = dir;
    if (pauseOnHover !== undefined) config.pauseOnHover = pauseOnHover;
    if (pauseOnWindowBlur !== undefined) config.pauseOnWindowBlur = pauseOnWindowBlur;
    if (progressBar !== undefined) config.progressBar = progressBar;
    if (toasterClassName !== undefined) config.toasterClassName = toasterClassName;
    toast.config(config);
  });
</script>
