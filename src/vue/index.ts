import {
  defineComponent,
  watch,
  onMounted,
  type PropType,
  type VNode,
  render as vueRender,
} from "vue";
import { toast as coreToast } from "alert-notify";
import type {
  ToastId,
  ToastOptions,
  ToastPosition,
  ToastTheme,
  ToasterConfig,
} from "alert-notify";

/**
 * Optional Vue helper. Core auto-mounts. This syncs config from props.
 * Place once in your root layout/App.
 *
 * @example
 * import { toast } from "alert-notify"
 * import { Toaster } from "alert-notify/vue"
 */
export const Toaster = defineComponent({
  name: "AlertNotifyToaster",
  props: {
    position: String as PropType<ToastPosition>,
    theme: String as PropType<ToastTheme>,
    duration: Number,
    autoClose: Boolean,
    closeButton: Boolean,
    dismissible: Boolean,
    richColors: Boolean,
    visibleToasts: Number,
    expand: Boolean,
    gap: Number,
    offset: [Number, String] as PropType<number | string>,
    dir: String as PropType<"ltr" | "rtl" | "auto">,
    pauseOnHover: Boolean,
    resetTimerOnHover: Boolean,
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
      coreToast.config(config);
    };

    onMounted(apply);
    watch(() => ({ ...props }), apply, { deep: true });

    return () => null;
  },
});

/**
 * Show a toast with custom Vue VNode content.
 * Pass a VNode or a factory `() => VNode`. Unmounts when the toast closes.
 *
 * @param content - VNode or factory that returns a VNode.
 * @param options - Per-toast options (same as core `toast.custom`).
 */
export function custom(
  content: VNode | (() => VNode),
  options: ToastOptions = {},
): ToastId {
  const host = document.createElement("div");
  host.className = "an-toast__vue-root";
  const vnode = typeof content === "function" ? content() : content;

  const userOnClose = options.onClose;
  const id = coreToast.custom(host, {
    ...options,
    onClose: (record, reason) => {
      vueRender(null, host);
      userOnClose?.(record, reason);
    },
  });

  vueRender(vnode, host);
  return id;
}

export { coreToast as toast };
export type { ToasterConfig, ToastPosition, ToastTheme };
