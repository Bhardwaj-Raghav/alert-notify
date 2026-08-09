import { createId } from "./escape";
import type {
  ToastCloseReason,
  ToastId,
  ToastListener,
  ToastOptions,
  ToastRecord,
  ToastType,
  ToasterConfig,
} from "./types";

export const DEFAULT_CONFIG: ToasterConfig = {
  position: "top-right",
  theme: "light",
  duration: 4000,
  autoClose: true,
  closeButton: true,
  dismissible: true,
  richColors: false,
  visibleToasts: 3,
  expand: false,
  gap: 12,
  offset: 16,
  dir: "auto",
  pauseOnHover: true,
  resetTimerOnHover: false,
  pauseOnWindowBlur: true,
  progressBar: true,
};

type TimerMap = Map<ToastId, ReturnType<typeof setTimeout>>;

export type StoreSnapshot = {
  toasts: readonly ToastRecord[];
  config: ToasterConfig;
};

function resolveAutoClose(
  type: ToastType,
  options: ToastOptions,
  config: ToasterConfig,
): boolean {
  if (options.autoClose !== undefined) {
    return options.autoClose;
  }
  if (type === "loading") {
    return false;
  }
  return config.autoClose;
}

function resolveDuration(
  type: ToastType,
  options: ToastOptions,
  config: ToasterConfig,
  autoClose: boolean,
): number {
  if (!autoClose) {
    return options.duration ?? config.duration;
  }
  return (
    options.duration ??
    (type === "loading" ? Number.POSITIVE_INFINITY : config.duration)
  );
}

export class ToastStore {
  private toasts: ToastRecord[] = [];
  private config: ToasterConfig;
  private listeners = new Set<ToastListener>();
  private configListeners = new Set<(config: ToasterConfig) => void>();
  private timers: TimerMap = new Map();
  private onCloseHandlers = new Map<
    ToastId,
    (toast: ToastRecord, reason: ToastCloseReason) => void
  >();

  constructor(config: Partial<ToasterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getConfig(): ToasterConfig {
    return this.config;
  }

  setConfig(partial: Partial<ToasterConfig>): void {
    this.config = { ...this.config, ...partial };
    for (const listener of this.configListeners) {
      listener(this.config);
    }
  }

  getToasts(): readonly ToastRecord[] {
    return this.toasts;
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeConfig(listener: (config: ToasterConfig) => void): () => void {
    this.configListeners.add(listener);
    listener(this.config);
    return () => {
      this.configListeners.delete(listener);
    };
  }

  add(message: string, options: ToastOptions = {}): ToastId {
    const id = options.id ?? createId();
    const type: ToastType = options.type ?? "message";
    const autoClose = resolveAutoClose(type, options, this.config);
    const duration = resolveDuration(type, options, this.config, autoClose);

    const existingIndex = this.toasts.findIndex((toast) => toast.id === id);
    const record: ToastRecord = {
      id,
      type,
      title: options.title,
      message,
      duration,
      autoClose,
      icon: options.icon,
      action: options.action,
      cancel: options.cancel,
      closeButton: options.closeButton ?? this.config.closeButton,
      dismissible: options.dismissible ?? this.config.dismissible,
      important: options.important ?? false,
      className: options.className,
      style: options.style,
      createdAt: Date.now(),
      remaining: duration,
      progressKey: 0,
      height: 0,
      onClose: options.onClose,
    };

    if (options.onClose) {
      this.onCloseHandlers.set(id, options.onClose);
    }

    if (existingIndex >= 0) {
      this.clearTimer(id);
      const previous = this.toasts[existingIndex];
      if (previous) {
        record.height = previous.height;
      }
      this.toasts = [
        ...this.toasts.slice(0, existingIndex),
        record,
        ...this.toasts.slice(existingIndex + 1),
      ];
    } else if (record.important) {
      this.toasts = [record, ...this.toasts];
    } else {
      this.toasts = [...this.toasts, record];
    }

    this.emit();
    this.schedule(id);
    return id;
  }

  addCustom(
    content: string | HTMLElement,
    options: ToastOptions = {},
  ): ToastId {
    const id = options.id ?? createId();
    const type: ToastType = options.type ?? "message";
    const autoClose = resolveAutoClose(type, options, this.config);
    const duration = resolveDuration(type, options, this.config, autoClose);

    const existingIndex = this.toasts.findIndex((toast) => toast.id === id);
    const record: ToastRecord = {
      id,
      type,
      title: options.title,
      message: "",
      customContent: content,
      duration,
      autoClose,
      icon: options.icon === undefined ? false : options.icon,
      action: options.action,
      cancel: options.cancel,
      closeButton: options.closeButton ?? this.config.closeButton,
      dismissible: options.dismissible ?? this.config.dismissible,
      important: options.important ?? false,
      className: options.className,
      style: options.style,
      createdAt: Date.now(),
      remaining: duration,
      progressKey: 0,
      height: 0,
      onClose: options.onClose,
    };

    if (options.onClose) {
      this.onCloseHandlers.set(id, options.onClose);
    }

    if (existingIndex >= 0) {
      this.clearTimer(id);
      const previous = this.toasts[existingIndex];
      if (previous) {
        record.height = previous.height;
      }
      this.toasts = [
        ...this.toasts.slice(0, existingIndex),
        record,
        ...this.toasts.slice(existingIndex + 1),
      ];
    } else if (record.important) {
      this.toasts = [record, ...this.toasts];
    } else {
      this.toasts = [...this.toasts, record];
    }

    this.emit();
    this.schedule(id);
    return id;
  }

  update(
    id: ToastId,
    patch: Partial<ToastOptions> & {
      message?: string;
      type?: ToastType;
      customContent?: string | HTMLElement;
    },
  ): void {
    const index = this.toasts.findIndex((toast) => toast.id === id);
    if (index < 0) {
      return;
    }

    const current = this.toasts[index];
    if (!current) {
      return;
    }

    const nextType = patch.type ?? current.type;
    const nextAutoClose =
      patch.autoClose !== undefined
        ? patch.autoClose
        : patch.type !== undefined && patch.type !== "loading" && current.type === "loading"
          ? this.config.autoClose
          : patch.type === "loading"
            ? false
            : current.autoClose;

    let nextDuration = current.duration;
    if (patch.duration !== undefined) {
      nextDuration = patch.duration;
    } else if (patch.type === "loading") {
      nextDuration = Number.POSITIVE_INFINITY;
    } else if (current.type === "loading" && patch.type !== undefined) {
      nextDuration = this.config.duration;
    }

    const next: ToastRecord = {
      ...current,
      title: patch.title !== undefined ? patch.title : current.title,
      message: patch.message ?? current.message,
      customContent:
        patch.customContent !== undefined
          ? patch.customContent
          : current.customContent,
      type: nextType,
      autoClose: nextAutoClose,
      duration: nextDuration,
      remaining: nextDuration,
      progressKey: current.progressKey + 1,
      icon: patch.icon !== undefined ? patch.icon : current.icon,
      action: patch.action ?? current.action,
      cancel: patch.cancel ?? current.cancel,
      closeButton: patch.closeButton ?? current.closeButton,
      dismissible: patch.dismissible ?? current.dismissible,
      important: patch.important ?? current.important,
      className: patch.className ?? current.className,
      style: patch.style ?? current.style,
      onClose: patch.onClose ?? current.onClose,
      createdAt: Date.now(),
      pausedAt: undefined,
    };

    if (patch.onClose) {
      this.onCloseHandlers.set(id, patch.onClose);
    }

    this.clearTimer(id);
    this.toasts = [
      ...this.toasts.slice(0, index),
      next,
      ...this.toasts.slice(index + 1),
    ];
    this.emit();
    this.schedule(id);
  }

  /**
   * Central close pipeline. Fires `onClose` exactly once with the given reason.
   */
  dismiss(id?: ToastId, reason: ToastCloseReason = "Manual"): void {
    if (id === undefined) {
      const all = [...this.toasts];
      for (const toast of all) {
        this.dismiss(toast.id, reason);
      }
      return;
    }

    const toast = this.toasts.find((item) => item.id === id);
    if (!toast) {
      return;
    }

    this.clearTimer(id);
    this.toasts = this.toasts.filter((item) => item.id !== id);
    this.emit();

    const onClose = this.onCloseHandlers.get(id) ?? toast.onClose;
    onClose?.(toast, reason);
    this.onCloseHandlers.delete(id);
  }

  setHeight(id: ToastId, height: number): void {
    const index = this.toasts.findIndex((toast) => toast.id === id);
    if (index < 0) {
      return;
    }
    const current = this.toasts[index];
    if (!current || current.height === height) {
      return;
    }
    this.toasts = [
      ...this.toasts.slice(0, index),
      { ...current, height },
      ...this.toasts.slice(index + 1),
    ];
    this.emit();
  }

  pause(id: ToastId): void {
    const toast = this.toasts.find((item) => item.id === id);
    if (
      !toast ||
      !toast.autoClose ||
      toast.pausedAt !== undefined ||
      !Number.isFinite(toast.duration)
    ) {
      return;
    }

    this.clearTimer(id);
    const elapsed = Date.now() - toast.createdAt;
    const remaining = Math.max(0, toast.remaining - elapsed);
    const index = this.toasts.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }

    this.toasts = [
      ...this.toasts.slice(0, index),
      { ...toast, pausedAt: Date.now(), remaining },
      ...this.toasts.slice(index + 1),
    ];
    this.emit();
  }

  resume(id: ToastId): void {
    const toast = this.toasts.find((item) => item.id === id);
    if (!toast || !toast.autoClose || toast.pausedAt === undefined) {
      return;
    }

    const index = this.toasts.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }

    this.toasts = [
      ...this.toasts.slice(0, index),
      { ...toast, pausedAt: undefined, createdAt: Date.now() },
      ...this.toasts.slice(index + 1),
    ];
    this.emit();
    this.schedule(id);
  }

  resetTimer(id: ToastId): void {
    const toast = this.toasts.find((item) => item.id === id);
    if (!toast || !toast.autoClose || !Number.isFinite(toast.duration)) {
      return;
    }

    const index = this.toasts.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }

    this.clearTimer(id);
    this.toasts = [
      ...this.toasts.slice(0, index),
      {
        ...toast,
        remaining: toast.duration,
        createdAt: Date.now(),
        pausedAt: undefined,
        progressKey: toast.progressKey + 1,
      },
      ...this.toasts.slice(index + 1),
    ];
    this.emit();
    this.schedule(id);
  }

  pauseAll(): void {
    for (const toast of this.toasts) {
      this.pause(toast.id);
    }
  }

  resumeAll(): void {
    for (const toast of this.toasts) {
      this.resume(toast.id);
    }
  }

  resetAllTimers(): void {
    for (const toast of this.toasts) {
      this.resetTimer(toast.id);
    }
  }

  private schedule(id: ToastId): void {
    const toast = this.toasts.find((item) => item.id === id);
    if (
      !toast ||
      !toast.autoClose ||
      !Number.isFinite(toast.remaining) ||
      toast.remaining <= 0
    ) {
      return;
    }

    this.clearTimer(id);
    const timer = setTimeout(() => {
      this.dismiss(id, "Auto");
    }, toast.remaining);
    this.timers.set(id, timer);
  }

  private clearTimer(id: ToastId): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private emit(): void {
    const snapshot = [...this.toasts];
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
