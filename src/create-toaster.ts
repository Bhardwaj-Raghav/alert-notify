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
      message: message ?? "",
      options: title !== undefined ? { ...rest, title } : { ...rest },
    };
  }
  if (title !== undefined) {
    return { message: title, options: { ...rest } };
  }
  return { message: fallbackMessage, options: { ...rest } };
}

/** Imperative toaster API returned by {@link createToaster} and the default {@link toast}. */
export type ToasterInstance = {
  /**
   * Show a `"message"` toast.
   * @returns Toast id (reuse via `options.id` to update in place).
   *
   * @example
   * toast("Saved", { title: "Profile" })
   * toast("Stay open", { autoClose: false })
   */
  (message: string | undefined, options?: ToastOptions): ToastId;
  /** Show a success toast. */
  success: (message: string | undefined, options?: ToastOptions) => ToastId;
  /** Show an error toast. */
  error: (message: string | undefined, options?: ToastOptions) => ToastId;
  /** Show a warning toast. */
  warning: (message: string | undefined, options?: ToastOptions) => ToastId;
  /** Show an info toast. */
  info: (message: string | undefined, options?: ToastOptions) => ToastId;
  /**
   * Show a loading toast. Defaults to sticky (`autoClose: false`) until updated or dismissed.
   */
  loading: (message: string | undefined, options?: ToastOptions) => ToastId;
  /** Show a neutral message toast (same as calling the instance directly). */
  message: (message: string | undefined, options?: ToastOptions) => ToastId;
  /**
   * Show a custom toast. String HTML is not escaped (trusted markup only).
   * Default icon is hidden unless you pass `icon`.
   *
   * @example
   * toast.custom('<strong>Hello</strong>')
   * toast.custom(document.createElement('div'))
   */
  custom: (
    content: string | HTMLElement,
    options?: ToastOptions,
  ) => ToastId;
  /**
   * Show loading → success/error for a promise. Updates the same toast id.
   * On failure, shows the error toast then rethrows.
   *
   * @example
   * await toast.promise(save(), {
   *   loading: 'Saving…',
   *   success: 'Saved',
   *   error: 'Failed',
   * })
   */
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) => Promise<T>;
  /**
   * Dismiss one toast by id, or all toasts when `id` is omitted.
   * Public dismiss always uses close reason `"Manual"`.
   */
  dismiss: (id?: ToastId) => void;
  /**
   * Whether a toast with the given id is currently in the active list.
   */
  isActive: (id: ToastId) => boolean;
  /** Shallow-merge global toaster config. */
  config: (partial: Partial<ToasterConfig>) => void;
  /** Current merged toaster config. */
  getConfig: () => ToasterConfig;
  /** Snapshot of active toasts (read-only {@link ToastRecord}s). */
  getToasts: () => readonly ToastRecord[];
  /**
   * Subscribe to toast list changes.
   * Fires immediately with the current list; returns an unsubscribe function.
   */
  subscribe: (listener: ToastListener) => () => void;
  /** Dismiss all toasts and tear down the portal (no-op portal in headless mode). */
  destroy: () => void;
};

function createTyped(
  store: ToastStore,
  type: ToastType,
): (message: string | undefined, options?: ToastOptions) => ToastId {
  return (message, options = {}) =>
    store.add(message ?? "", { ...options, type });
}

/**
 * Create an isolated toaster instance (separate store and optional portal).
 *
 * @param initialConfig - Merged over built-in defaults.
 * @param options.headless - When true, no DOM portal; drive UI via `subscribe` / `getToasts`.
 *
 * @example
 * const toaster = createToaster({ position: 'bottom-center' }, { headless: true })
 * toaster.subscribe((list) => renderCustomUi(list))
 * toaster.success('Done')
 */
export function createToaster(
  initialConfig: Partial<ToasterConfig> = {},
  options: { headless?: boolean } = {},
): ToasterInstance {
  const store = new ToastStore(initialConfig);
  const renderer = options.headless
    ? null
    : new ToastRenderer(store, { enabled: true });

  const base = ((message: string | undefined, opts: ToastOptions = {}) =>
    store.add(message ?? "", opts)) as ToasterInstance;

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
  base.isActive = (id: ToastId) => store.isActive(id);
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
