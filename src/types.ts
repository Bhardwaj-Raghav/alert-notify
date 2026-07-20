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

export type ToastAction = {
  label: string;
  onClick: (event: MouseEvent) => void;
};

export type ToastOptions = {
  id?: ToastId;
  type?: ToastType;
  description?: string;
  duration?: number;
  icon?: string | HTMLElement | false;
  /** Opt-in unescaped HTML for title. Prefer plain text. */
  html?: string;
  action?: ToastAction;
  cancel?: ToastAction;
  closeButton?: boolean;
  dismissible?: boolean;
  important?: boolean;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  onDismiss?: (toast: ToastRecord) => void;
  onAutoClose?: (toast: ToastRecord) => void;
};

export type ToastRecord = {
  id: ToastId;
  type: ToastType;
  title: string;
  description?: string;
  html?: string;
  duration: number;
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
  height: number;
  onDismiss?: (toast: ToastRecord) => void;
  onAutoClose?: (toast: ToastRecord) => void;
};

export type ToasterConfig = {
  position: ToastPosition;
  theme: ToastTheme;
  duration: number;
  closeButton: boolean;
  dismissible: boolean;
  richColors: boolean;
  visibleToasts: number;
  expand: boolean;
  gap: number;
  offset: number | string;
  dir: "ltr" | "rtl" | "auto";
  pauseOnHover: boolean;
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
  title?: string;
};

export type ToastListener = (toasts: readonly ToastRecord[]) => void;
