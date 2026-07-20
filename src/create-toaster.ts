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
  fallbackTitle = "Done",
): { title: string; options: ToastOptions } {
  if (typeof content === "function") {
    const resolved = content(value as never);
    if (typeof resolved === "string") {
      return { title: resolved, options: {} };
    }
    const { title, ...options } = resolved;
    return {
      title: title ?? fallbackTitle,
      options,
    };
  }
  if (typeof content === "string") {
    return { title: content, options: {} };
  }
  const { title, ...options } = content;
  return {
    title: title ?? fallbackTitle,
    options,
  };
}

export type ToasterInstance = {
  (title: string, options?: ToastOptions): ToastId;
  success: (title: string, options?: ToastOptions) => ToastId;
  error: (title: string, options?: ToastOptions) => ToastId;
  warning: (title: string, options?: ToastOptions) => ToastId;
  info: (title: string, options?: ToastOptions) => ToastId;
  loading: (title: string, options?: ToastOptions) => ToastId;
  message: (title: string, options?: ToastOptions) => ToastId;
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
): (title: string, options?: ToastOptions) => ToastId {
  return (title, options = {}) => store.add(title, { ...options, type });
}

export function createToaster(
  initialConfig: Partial<ToasterConfig> = {},
  options: { headless?: boolean } = {},
): ToasterInstance {
  const store = new ToastStore(initialConfig);
  const renderer = options.headless
    ? null
    : new ToastRenderer(store, { enabled: true });

  const base = ((title: string, opts: ToastOptions = {}) =>
    store.add(title, opts)) as ToasterInstance;

  base.success = createTyped(store, "success");
  base.error = createTyped(store, "error");
  base.warning = createTyped(store, "warning");
  base.info = createTyped(store, "info");
  base.loading = createTyped(store, "loading");
  base.message = createTyped(store, "message");

  base.promise = async <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
  ): Promise<T> => {
    const loading = normalizeContent(messages.loading, undefined, "Loading…");
    const id = store.add(loading.title, {
      ...loading.options,
      type: "loading",
      duration: Number.POSITIVE_INFINITY,
    });

    try {
      const data = await promise;
      const success = normalizeContent(messages.success, data, "Done");
      store.update(id, {
        ...success.options,
        title: success.title,
        type: "success",
        duration: success.options.duration,
      });
      return data;
    } catch (error) {
      const failure = normalizeContent(messages.error, error, "Error");
      store.update(id, {
        ...failure.options,
        title: failure.title,
        type: "error",
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
