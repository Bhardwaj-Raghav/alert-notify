import { defineComponent, watch, onMounted, type PropType } from "vue";
import { toast } from "alert-notify";
import type { ToastPosition, ToastTheme, ToasterConfig } from "alert-notify";

/**
 * Optional Vue helper. Core auto-mounts — this syncs config from props.
 * Place once in your root layout/App.
 *
 * @example
 * import { toast } from "alert-notify"
 * import { Toaster } from "alert-notify/vue"
 * import "alert-notify/style.css"
 */
export const Toaster = defineComponent({
  name: "AlertNotifyToaster",
  props: {
    position: String as PropType<ToastPosition>,
    theme: String as PropType<ToastTheme>,
    duration: Number,
    closeButton: Boolean,
    dismissible: Boolean,
    richColors: Boolean,
    visibleToasts: Number,
    expand: Boolean,
    gap: Number,
    offset: [Number, String] as PropType<number | string>,
    dir: String as PropType<"ltr" | "rtl" | "auto">,
    pauseOnHover: Boolean,
    pauseOnWindowBlur: Boolean,
    progressBar: Boolean,
    toasterClassName: String,
  },
  setup(props) {
    const apply = () => {
      const config: Partial<ToasterConfig> = {};
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) {
          (config as Record<string, unknown>)[key] = value;
        }
      }
      toast.config(config);
    };

    onMounted(apply);
    watch(() => ({ ...props }), apply, { deep: true });

    return () => null;
  },
});

export type { ToasterConfig, ToastPosition, ToastTheme };
