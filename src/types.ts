export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "message";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastTheme = "light" | "dark" | "system";

export type ToastId = string;

export type ToastCloseReason = "Manual" | "Auto";

export type ToastAction = {
  label: string;
  onClick: (event: MouseEvent) => void;
};

export type ToastOptions = {
  id?: ToastId;
  type?: ToastType;
  /** Optional heading. Uses title styling. */
  title?: string;
  duration?: number;
  /** Whether the toast auto-dismisses. Default true; loading defaults to false. */
  autoClose?: boolean;
  /**
   * Custom icon. A string is inserted as raw HTML (trusted markup only).
   * Prefer `HTMLElement` or `false` when the value is not developer-controlled.
   */
  icon?: string | HTMLElement | false;
  action?: ToastAction;
  cancel?: ToastAction;
  closeButton?: boolean;
  dismissible?: boolean;
  important?: boolean;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  onClose?: (toast: ToastRecord, reason: ToastCloseReason) => void;
};

export type ToastRecord = {
  id: ToastId;
  type: ToastType;
  /** Optional heading. Uses title styling. */
  title?: string;
  /** Main toast content. Uses message (former description) styling. */
  message: string;
  /** Custom body for `toast.custom()` only. Trusted markup / nodes. */
  customContent?: string | HTMLElement;
  duration: number;
  autoClose: boolean;
  icon?: string | HTMLElement | false;
  action?: ToastAction;
  cancel?: ToastAction;
  closeButton: boolean;
  dismissible: boolean;
  important: boolean;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  createdAt: number;
  pausedAt?: number;
  remaining: number;
  /** Bumps when the auto-close timer/progress should restart. */
  progressKey: number;
  height: number;
  onClose?: (toast: ToastRecord, reason: ToastCloseReason) => void;
};

export type ToasterConfig = {
  position: ToastPosition;
  theme: ToastTheme;
  duration: number;
  autoClose: boolean;
  closeButton: boolean;
  dismissible: boolean;
  richColors: boolean;
  visibleToasts: number;
  expand: boolean;
  gap: number;
  offset: number | string;
  dir: "ltr" | "rtl" | "auto";
  pauseOnHover: boolean;
  /** When true, hovering the toast group resets timers and progress together. */
  resetTimerOnHover: boolean;
  pauseOnWindowBlur: boolean;
  progressBar: boolean;
  toasterClassName?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
};

export type PromiseMessages<T> = {
  loading: string | ExternalToast;
  success:
    | string
    | ExternalToast
    | ((data: T) => string | ExternalToast);
  error:
    | string
    | ExternalToast
    | ((error: unknown) => string | ExternalToast);
};

export type ExternalToast = ToastOptions & {
  message?: string;
};

export type ToastListener = (toasts: readonly ToastRecord[]) => void;
