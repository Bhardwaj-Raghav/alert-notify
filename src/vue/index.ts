import {
  defineComponent,
  watch,
  onMounted,
  type PropType,
  type VNode,
  render as vueRender,
  isVNode,
} from "vue";
import { toast as coreToast } from "alert-notify";
import type {
  ToastCloseReason,
  ToastId,
  ToastOptions,
  ToastPosition,
  ToastRecord,
  ToastTheme,
  ToasterConfig,
  ToasterInstance,
} from "alert-notify";

/**
 * Optional Vue helper. Core auto-mounts. This syncs config from props.
 * Place once in your root layout/App.
 *
 * @example
 * import { toast, Toaster } from "alert-notify/vue"
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
 * Per-toast options with Vue VNode icons.
 */
export type VueToastOptions = Omit<ToastOptions, "icon"> & {
  icon?: ToastOptions["icon"] | VNode | (() => VNode);
};

type VueIconHost = HTMLElement & { __anUnmount?: () => void };

function isCoreIcon(
  icon: VueToastOptions["icon"],
): icon is string | HTMLElement | false | undefined {
  return (
    icon === undefined ||
    icon === false ||
    typeof icon === "string" ||
    (typeof HTMLElement !== "undefined" && icon instanceof HTMLElement)
  );
}

function isVueIcon(
  icon: VueToastOptions["icon"],
): icon is VNode | (() => VNode) {
  if (isCoreIcon(icon) || icon === null) {
    return false;
  }
  return typeof icon === "function" || isVNode(icon);
}

function mountVueIcon(icon: VNode | (() => VNode)): HTMLElement {
  const host = document.createElement("span") as VueIconHost;
  host.className = "an-toast__vue-icon";
  const vnode = typeof icon === "function" ? icon() : icon;
  vueRender(vnode, host);
  host.__anUnmount = () => {
    vueRender(null, host);
  };
  return host;
}

function toCoreOptions(options: VueToastOptions = {}): ToastOptions {
  const { icon, onClose, ...rest } = options;
  if (!isVueIcon(icon)) {
    return { ...rest, icon, onClose };
  }

  const host = mountVueIcon(icon) as VueIconHost;
  return {
    ...rest,
    icon: host,
    onClose: (record: ToastRecord, reason: ToastCloseReason) => {
      host.__anUnmount?.();
      onClose?.(record, reason);
    },
  };
}

type VueToasterInstance = {
  (message: string | undefined, options?: VueToastOptions): ToastId;
  success: (message: string | undefined, options?: VueToastOptions) => ToastId;
  error: (message: string | undefined, options?: VueToastOptions) => ToastId;
  warning: (message: string | undefined, options?: VueToastOptions) => ToastId;
  info: (message: string | undefined, options?: VueToastOptions) => ToastId;
  loading: (message: string | undefined, options?: VueToastOptions) => ToastId;
  message: (message: string | undefined, options?: VueToastOptions) => ToastId;
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
): (message: string | undefined, options?: VueToastOptions) => ToastId {
  return (message, options = {}) => coreToast[type](message, toCoreOptions(options));
}

/**
 * Vue-aware toast API. Accepts VNode icons and `string | undefined` messages.
 * Import from `alert-notify/vue` when passing Vue nodes as icons.
 */
export const toast: VueToasterInstance = Object.assign(
  (message: string | undefined, options: VueToastOptions = {}) =>
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
 * Show a toast with custom Vue VNode content.
 * Pass a VNode or a factory `() => VNode`. Unmounts when the toast closes.
 *
 * @param content - VNode or factory that returns a VNode.
 * @param options - Per-toast options (same as core `toast.custom`, plus Vue icons).
 */
export function custom(
  content: VNode | (() => VNode),
  options: VueToastOptions = {},
): ToastId {
  const host = document.createElement("div");
  host.className = "an-toast__vue-root";
  const vnode = typeof content === "function" ? content() : content;

  const coreOptions = toCoreOptions(options);
  const userOnClose = coreOptions.onClose;
  const id = coreToast.custom(host, {
    ...coreOptions,
    onClose: (record, reason) => {
      vueRender(null, host);
      userOnClose?.(record, reason);
    },
  });

  vueRender(vnode, host);
  return id;
}

export type { ToasterConfig, ToastPosition, ToastTheme };
