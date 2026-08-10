/** Visual / semantic variant of a toast. */
export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "message";

/** Screen corner or edge where the toaster stack is anchored. */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Color scheme for the toaster.
 * `"system"` follows `html[data-theme]` / `.dark`/`.light`, then `prefers-color-scheme`, else light.
 */
export type ToastTheme = "light" | "dark" | "system";

/** Stable id returned by toast helpers; reuse to update an existing toast in place. */
export type ToastId = string;

/**
 * Why a toast closed.
 * `"Manual"`: dismiss, close button, swipe, Escape, action/cancel.
 * `"Auto"`: timer completed.
 */
export type ToastCloseReason = "Manual" | "Auto";

/** Button shown on a toast. After `onClick`, the toast is always dismissed. */
export type ToastAction = {
  /** Visible button label. */
  label: string;
  /** Click handler. The toast dismisses after this runs. */
  onClick: (event: MouseEvent) => void;
};

/** Per-toast overrides passed to `toast()` and typed helpers. */
export type ToastOptions = {
  /**
   * Reuse an existing toast id to update it in place (same index; no `onClose` on the old toast).
   * @default generated id
   */
  id?: ToastId;
  /**
   * Toast variant. Typed helpers (`toast.success`, …) set this for you.
   * @default "message"
   */
  type?: ToastType;
  /** Optional heading above the message body. */
  title?: string;
  /**
   * Auto-dismiss duration in ms when `autoClose` is true.
   * Ignored for dismissal when `autoClose` is false (value may still be stored).
   * @default from toaster config (`4000`), or `Infinity` while type is `"loading"`
   */
  duration?: number;
  /**
   * Whether the toast auto-dismisses.
   * Prefer `autoClose: false` for sticky toasts over `duration: Infinity`.
   * @default `true`, except `"loading"` defaults to `false`
   */
  autoClose?: boolean;
  /**
   * Custom icon. A string is inserted as raw HTML (trusted markup only).
   * Prefer `HTMLElement` or `false` when the value is not developer-controlled.
   * For `toast.custom()`, omitting `icon` defaults to `false` (no default icon).
   */
  icon?: string | HTMLElement | false;
  /** Primary action button. Click runs `onClick`, then dismisses. */
  action?: ToastAction;
  /** Secondary action button. Click runs `onClick`, then dismisses. */
  cancel?: ToastAction;
  /**
   * Show the × button. Effective only when `dismissible` is also true.
   * @default from toaster config (`true`)
   */
  closeButton?: boolean;
  /**
   * Allow the × button (with `closeButton`). Swipe uses the **global** toaster
   * `dismissible` only; Escape on a focused toast is not gated by this flag.
   * @default from toaster config (`true`)
   */
  dismissible?: boolean;
  /**
   * When true, the toast is prepended to the queue (shown toward the front of the stack).
   * @default false
   */
  important?: boolean;
  /** Extra CSS class on the toast element. */
  className?: string;
  /** Inline styles on the toast element. */
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  /** Called once when the toast closes, with the close reason. */
  onClose?: (toast: ToastRecord, reason: ToastCloseReason) => void;
};

/**
 * Read-only snapshot of an active toast from `getToasts`, `subscribe`, or `onClose`.
 * Layout and timer fields are runtime state for headless UIs, not settable options.
 */
export type ToastRecord = {
  /** Toast id. */
  id: ToastId;
  /** Resolved toast variant. */
  type: ToastType;
  /** Optional heading. Uses title styling. */
  title?: string;
  /** Main toast content. Uses message (former description) styling. */
  message: string;
  /** Custom body for `toast.custom()` only. Trusted markup / nodes. */
  customContent?: string | HTMLElement;
  /** Resolved duration in ms (may be unused for dismissal when `autoClose` is false). */
  duration: number;
  /** Whether this toast auto-dismisses. */
  autoClose: boolean;
  /** Resolved icon (`false` hides the icon). */
  icon?: string | HTMLElement | false;
  /** Primary action button, if any. */
  action?: ToastAction;
  /** Secondary action button, if any. */
  cancel?: ToastAction;
  /** Whether the × button is enabled for this toast. */
  closeButton: boolean;
  /** Whether this toast allows the × button (with `closeButton`). */
  dismissible: boolean;
  /** Whether this toast was prepended as important. */
  important: boolean;
  /** Extra CSS class on the toast element. */
  className?: string;
  /** Inline styles on the toast element. */
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  /** Epoch ms when the toast was created or last fully replaced. */
  createdAt: number;
  /** Epoch ms when the auto-close timer was paused, if paused. */
  pausedAt?: number;
  /** Milliseconds left on the auto-close timer. */
  remaining: number;
  /** Bumps when the auto-close timer/progress should restart. */
  progressKey: number;
  /** Measured toast height in px (for stacking). */
  height: number;
  /** Close callback registered when the toast was created. */
  onClose?: (toast: ToastRecord, reason: ToastCloseReason) => void;
};

/** Global toaster defaults. Merged by `toast.config` / `createToaster`. */
export type ToasterConfig = {
  /**
   * Stack anchor on screen.
   * @default "top-right"
   */
  position: ToastPosition;
  /**
   * Color scheme. `"system"` follows document theme / prefers-color-scheme.
   * @default "light"
   */
  theme: ToastTheme;
  /**
   * Default auto-dismiss duration in ms.
   * @default 4000
   */
  duration: number;
  /**
   * Default auto-dismiss for new toasts (loading still defaults sticky unless overridden).
   * @default true
   */
  autoClose: boolean;
  /**
   * Default × button visibility (still requires per-toast `dismissible`).
   * @default true
   */
  closeButton: boolean;
  /**
   * Default dismissibility. Swipe always uses this global flag; × uses per-toast values.
   * @default true
   */
  dismissible: boolean;
  /**
   * Stronger success/error/warning/info colors. Does not affect loading or message.
   * @default false
   */
  richColors: boolean;
  /**
   * Max toasts shown in the stack at once.
   * @default 3
   */
  visibleToasts: number;
  /**
   * Expand the stack so gaps use `gap` instead of the collapsed offset.
   * @default false
   */
  expand: boolean;
  /**
   * Gap in px between toasts when expanded / hover-expanded.
   * @default 12
   */
  gap: number;
  /**
   * Distance from the viewport edge (number = px, or CSS length string).
   * @default 16
   */
  offset: number | string;
  /**
   * Text direction for the toaster.
   * @default "auto"
   */
  dir: "ltr" | "rtl" | "auto";
  /**
   * Pause auto-close timers while the pointer is over the toast group.
   * Combines with `resetTimerOnHover` (neither replaces the other).
   * @default true
   */
  pauseOnHover: boolean;
  /**
   * When true, hovering the toast group resets timers and progress together.
   * @default false
   */
  resetTimerOnHover: boolean;
  /**
   * Pause auto-close while the window is blurred.
   * @default true
   */
  pauseOnWindowBlur: boolean;
  /**
   * Show the progress bar when auto-close is active with a finite duration.
   * @default true
   */
  progressBar: boolean;
  /** Extra class on the toaster portal root. */
  toasterClassName?: string;
  /** Inline styles on the toaster portal root (via `toast.config`). */
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
};

/**
 * Messages for `toast.promise`.
 * Strings are the toast body. Objects may include `message`, `title`, and other {@link ToastOptions}.
 * If an object has only `title` (no `message`), that title becomes the message body.
 */
export type PromiseMessages<T> = {
  /** Shown while pending. Defaults to `"Loading…"` when empty. */
  loading: string | ExternalToast;
  /** Shown on resolve. Defaults to `"Done"`. May be a function of the resolved value. */
  success:
    | string
    | ExternalToast
    | ((data: T) => string | ExternalToast);
  /** Shown on reject. Defaults to `"Error"`. May be a function of the error. Promise still rethrows. */
  error:
    | string
    | ExternalToast
    | ((error: unknown) => string | ExternalToast);
};

/**
 * Object form for promise stages and similar helpers.
 * Provide `message` for the body; `title` alone (without `message`) is treated as the body.
 */
export type ExternalToast = ToastOptions & {
  /** Toast body. If omitted and only `title` is set, that title becomes the body. */
  message?: string;
};

/**
 * Listener for toast list changes.
 * `subscribe` invokes it immediately with the current list, then on every update.
 */
export type ToastListener = (toasts: readonly ToastRecord[]) => void;
