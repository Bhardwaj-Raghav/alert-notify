import { ToastRenderer } from "./renderer";
import { ToastStore } from "./store";
import type {
  ExternalToast,
  PromiseMessages,
  ToastId,
  ToastListener,
  ToastOptions,
  ToastRecord,
  ToastType,
  ToasterConfig,
} from "./types";

function normalizeContent(
  content:
    | string
    | ExternalToast
    | ((value: never) => string | ExternalToast),
  value?: unknown,
  fallbackMessage = "Done",
): { message: string; options: ToastOptions } {
  if (typeof content === "function") {
    return normalizeContent(
      content(value as never),
      undefined,
      fallbackMessage,
    );
  }
  if (typeof content === "string") {
    return { message: content, options: {} };
  }
  const { message, title, ...rest } = content;
  if (message !== undefined) {
    return {
      message,
      options: title !== undefined ? { ...rest, title } : { ...rest },
    };
  }
  if (title !== undefined) {
    return { message: title, options: { ...rest } };
  }
  return { message: fallbackMessage, options: { ...rest } };
}

export type ToasterInstance = {
  (message: string, options?: ToastOptions): ToastId;
  success: (message: string, options?: ToastOptions) => ToastId;
  error: (message: string, options?: ToastOptions) => ToastId;
  warning: (message: string, options?: ToastOptions) => ToastId;
  info: (message: string, options?: ToastOptions) => ToastId;
  loading: (message: string, options?: ToastOptions) => ToastId;
  message: (message: string, options?: ToastOptions) => ToastId;
  custom: (
    content: string | HTMLElement,
    options?: ToastOptions,
  ) => ToastId;
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) => Promise<T>;
  dismiss: (id?: ToastId) => void;
  config: (partial: Partial<ToasterConfig>) => void;
  getConfig: () => ToasterConfig;
  getToasts: () => readonly ToastRecord[];
  subscribe: (listener: ToastListener) => () => void;
  destroy: () => void;
};

function createTyped(
  store: ToastStore,
  type: ToastType,
): (message: string, options?: ToastOptions) => ToastId {
  return (message, options = {}) => store.add(message, { ...options, type });
}

export function createToaster(
  initialConfig: Partial<ToasterConfig> = {},
  options: { headless?: boolean } = {},
): ToasterInstance {
  const store = new ToastStore(initialConfig);
  const renderer = options.headless
    ? null
    : new ToastRenderer(store, { enabled: true });

  const base = ((message: string, opts: ToastOptions = {}) =>
    store.add(message, opts)) as ToasterInstance;

  base.success = createTyped(store, "success");
  base.error = createTyped(store, "error");
  base.warning = createTyped(store, "warning");
  base.info = createTyped(store, "info");
  base.loading = createTyped(store, "loading");
  base.message = createTyped(store, "message");
  base.custom = (content, opts = {}) => store.addCustom(content, opts);

  base.promise = async <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
  ): Promise<T> => {
    const loading = normalizeContent(messages.loading, undefined, "Loading…");
    const id = store.add(loading.message, {
      ...loading.options,
      type: "loading",
      autoClose: false,
    });

    try {
      const data = await promise;
      const success = normalizeContent(messages.success, data, "Done");
      store.update(id, {
        ...success.options,
        message: success.message,
        type: "success",
        autoClose: success.options.autoClose ?? true,
        duration: success.options.duration,
      });
      return data;
    } catch (error) {
      const failure = normalizeContent(messages.error, error, "Error");
      store.update(id, {
        ...failure.options,
        message: failure.message,
        type: "error",
        autoClose: failure.options.autoClose ?? true,
        duration: failure.options.duration,
      });
      throw error;
    }
  };

  base.dismiss = (id?: ToastId) => store.dismiss(id);
  base.config = (partial) => store.setConfig(partial);
  base.getConfig = () => store.getConfig();
  base.getToasts = () => store.getToasts();
  base.subscribe = (listener) => store.subscribe(listener);
  base.destroy = () => {
    store.dismiss();
    renderer?.destroy();
  };

  return base;
}
