import { escapeHtml } from "./escape";
import { getDefaultIcon } from "./icons";
import type { ToastStore } from "./store";
import type { ToastPosition, ToastRecord, ToasterConfig } from "./types";

const PORTAL_ATTR = "data-alert-notify-portal";
const TOAST_ATTR = "data-an-toast-id";

type ToasterStack = {
  toaster: HTMLElement;
  hitbox: HTMLElement;
  expanded: boolean;
};

function isBrowser(): boolean {
  return typeof document !== "undefined" && typeof window !== "undefined";
}

function offsetValue(offset: number | string): string {
  return typeof offset === "number" ? `${offset}px` : offset;
}

function resolveTheme(theme: ToasterConfig["theme"]): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const attr = root.getAttribute("data-theme");
    if (attr === "dark" || root.classList.contains("dark")) {
      return "dark";
    }
    if (attr === "light" || root.classList.contains("light")) {
      return "light";
    }
  }

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyInlineStyles(
  el: HTMLElement,
  style?: Partial<CSSStyleDeclaration> | Record<string, string>,
): void {
  if (!style) {
    return;
  }
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (key in el.style) {
      (el.style as unknown as Record<string, string>)[key] = String(value);
    } else {
      el.style.setProperty(key, String(value));
    }
  }
}

function positionClass(position: ToastPosition): string {
  return `an-toaster--${position}`;
}

function resolvePosition(
  toast: ToastRecord,
  config: ToasterConfig,
): ToastPosition {
  return toast.position ?? config.position;
}

function resolveRichColors(toast: ToastRecord, config: ToasterConfig): boolean {
  return toast.richColors ?? config.richColors;
}

function contentKey(toast: ToastRecord, config: ToasterConfig): string {
  const custom =
    toast.customContent === undefined
      ? ""
      : typeof toast.customContent === "string"
        ? `s:${toast.customContent}`
        : `n:${toast.customContent === null ? "null" : "el"}`;
  const icon =
    toast.icon === false
      ? "false"
      : typeof toast.icon === "string"
        ? `s:${toast.icon}`
        : toast.icon instanceof HTMLElement
          ? "el"
          : "default";
  return [
    toast.type,
    toast.title ?? "",
    toast.message,
    custom,
    icon,
    toast.action?.label ?? "",
    toast.cancel?.label ?? "",
    String(toast.closeButton),
    String(toast.dismissible),
    toast.className ?? "",
    String(toast.autoClose),
    String(toast.duration),
    String(toast.progressKey),
    String(config.progressBar),
    resolvePosition(toast, config),
    String(resolveRichColors(toast, config)),
  ].join("|");
}

function shouldShowProgress(toast: ToastRecord, config: ToasterConfig): boolean {
  return (
    config.progressBar &&
    toast.autoClose &&
    Number.isFinite(toast.duration)
  );
}

export class ToastRenderer {
  private store: ToastStore;
  private portal: HTMLElement | null = null;
  private stacks = new Map<ToastPosition, ToasterStack>();
  private nodes = new Map<string, HTMLElement>();
  private nodePositions = new Map<string, ToastPosition>();
  private contentKeys = new Map<string, string>();
  private unsubscribers: Array<() => void> = [];
  private mediaQuery: MediaQueryList | null = null;
  private dragging: {
    id: string;
    startX: number;
    currentX: number;
  } | null = null;
  private enabled: boolean;

  constructor(store: ToastStore, options: { enabled?: boolean } = {}) {
    this.store = store;
    this.enabled = options.enabled !== false;

    if (!this.enabled || !isBrowser()) {
      return;
    }

    this.ensurePortal();
    this.unsubscribers.push(
      this.store.subscribe((toasts) => this.render(toasts)),
      this.store.subscribeConfig((config) => this.applyConfig(config)),
    );

    if (typeof window.matchMedia === "function") {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const onScheme = () => this.applyConfig(this.store.getConfig());
      this.mediaQuery.addEventListener("change", onScheme);
      this.unsubscribers.push(() =>
        this.mediaQuery?.removeEventListener("change", onScheme),
      );
    }

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => {
        if (this.store.getConfig().theme === "system") {
          this.applyConfig(this.store.getConfig());
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      this.unsubscribers.push(() => observer.disconnect());
    }

    const onBlur = () => {
      if (this.store.getConfig().pauseOnWindowBlur) {
        this.store.pauseAll();
      }
    };
    const onFocus = () => {
      if (this.store.getConfig().pauseOnWindowBlur) {
        this.store.resumeAll();
      }
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    this.unsubscribers.push(() => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) {
        return;
      }
      const toastEl = active.closest(`[${TOAST_ATTR}]`);
      if (!(toastEl instanceof HTMLElement)) {
        return;
      }
      const id = toastEl.getAttribute(TOAST_ATTR);
      if (id) {
        this.store.dismiss(id, "Manual");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    this.unsubscribers.push(() =>
      document.removeEventListener("keydown", onKeyDown),
    );
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.nodes.clear();
    this.nodePositions.clear();
    this.contentKeys.clear();
    this.stacks.clear();
    this.portal?.remove();
    this.portal = null;
  }

  private ensurePortal(): void {
    if (!isBrowser() || this.portal) {
      return;
    }

    const portal = document.createElement("div");
    portal.setAttribute(PORTAL_ATTR, "");
    document.body.appendChild(portal);
    this.portal = portal;
    this.applyConfig(this.store.getConfig());
  }

  private ensureStack(position: ToastPosition): ToasterStack {
    const existing = this.stacks.get(position);
    if (existing) {
      return existing;
    }

    if (!this.portal) {
      this.ensurePortal();
    }

    const toaster = document.createElement("ol");
    toaster.className = "an-toaster";
    toaster.setAttribute("data-an-toaster", "");
    toaster.dataset.position = position;
    toaster.tabIndex = -1;

    const hitbox = document.createElement("div");
    hitbox.className = "an-toaster__hitbox";
    hitbox.setAttribute("data-an-hitbox", "");
    hitbox.setAttribute("aria-hidden", "true");
    toaster.appendChild(hitbox);

    const stack: ToasterStack = { toaster, hitbox, expanded: false };

    toaster.addEventListener("mouseenter", () => {
      stack.expanded = true;
      this.updateStackLayout(this.store.getToasts());
      const config = this.store.getConfig();
      if (config.resetTimerOnHover) {
        this.resetTimersForPosition(position);
      }
      if (config.pauseOnHover) {
        this.pauseToastsForPosition(position);
      }
    });
    toaster.addEventListener("mouseleave", () => {
      stack.expanded = false;
      this.updateStackLayout(this.store.getToasts());
      if (this.store.getConfig().pauseOnHover) {
        this.resumeToastsForPosition(position);
      }
    });

    this.portal?.appendChild(toaster);
    this.stacks.set(position, stack);
    this.applyConfigToStack(stack, position, this.store.getConfig());
    return stack;
  }

  private pauseToastsForPosition(position: ToastPosition): void {
    const config = this.store.getConfig();
    for (const toast of this.store.getToasts()) {
      if (resolvePosition(toast, config) === position) {
        this.store.pause(toast.id);
      }
    }
  }

  private resumeToastsForPosition(position: ToastPosition): void {
    const config = this.store.getConfig();
    for (const toast of this.store.getToasts()) {
      if (resolvePosition(toast, config) === position) {
        this.store.resume(toast.id);
      }
    }
  }

  private resetTimersForPosition(position: ToastPosition): void {
    const config = this.store.getConfig();
    for (const toast of this.store.getToasts()) {
      if (resolvePosition(toast, config) === position) {
        this.store.resetTimer(toast.id);
      }
    }
  }

  private applyConfig(config: ToasterConfig): void {
    for (const [position, stack] of this.stacks) {
      this.applyConfigToStack(stack, position, config);
    }
  }

  private applyConfigToStack(
    stack: ToasterStack,
    position: ToastPosition,
    config: ToasterConfig,
  ): void {
    const theme = resolveTheme(config.theme);
    stack.toaster.className = [
      "an-toaster",
      positionClass(position),
      config.toasterClassName ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    stack.toaster.dataset.theme = theme;
    stack.toaster.dataset.position = position;
    stack.toaster.dataset.expanded =
      stack.expanded || config.expand ? "true" : "false";
    stack.toaster.dataset.yPosition = position.startsWith("top")
      ? "top"
      : "bottom";
    stack.toaster.dataset.xPosition = position.endsWith("left")
      ? "left"
      : position.endsWith("right")
        ? "right"
        : "center";

    stack.toaster.style.setProperty("--an-gap", `${config.gap}px`);
    stack.toaster.style.setProperty("--an-offset", offsetValue(config.offset));
    stack.toaster.dir = config.dir === "auto" ? "" : config.dir;
    applyInlineStyles(stack.toaster, config.style);
  }

  private render(toasts: readonly ToastRecord[]): void {
    if (!this.enabled || !isBrowser()) {
      return;
    }
    this.ensurePortal();

    const config = this.store.getConfig();
    const ids = new Set(toasts.map((toast) => toast.id));
    for (const [id, node] of this.nodes) {
      if (!ids.has(id)) {
        node.dataset.removed = "true";
        this.contentKeys.delete(id);
        this.nodePositions.delete(id);
        const remove = () => {
          node.remove();
          this.nodes.delete(id);
        };
        node.addEventListener("transitionend", remove, { once: true });
        setTimeout(remove, 350);
      }
    }

    for (const toast of toasts) {
      const position = resolvePosition(toast, config);
      const stack = this.ensureStack(position);
      let node = this.nodes.get(toast.id);
      if (!node) {
        node = this.createToastElement(toast);
        this.nodes.set(toast.id, node);
        this.nodePositions.set(toast.id, position);
        stack.toaster.appendChild(node);
      } else {
        const previousPosition = this.nodePositions.get(toast.id);
        if (previousPosition !== position) {
          stack.toaster.appendChild(node);
          this.nodePositions.set(toast.id, position);
        }
        this.updateToastElement(node, toast);
      }
    }

    this.pruneEmptyStacks(toasts);
    this.updateStackLayout(toasts);
  }

  private pruneEmptyStacks(toasts: readonly ToastRecord[]): void {
    const config = this.store.getConfig();
    const active = new Set(
      toasts.map((toast) => resolvePosition(toast, config)),
    );
    for (const [position, stack] of this.stacks) {
      if (active.has(position)) {
        continue;
      }
      const hasNodes = [...this.nodePositions.values()].includes(position);
      if (!hasNodes) {
        stack.toaster.remove();
        this.stacks.delete(position);
      }
    }
  }

  private createToastElement(toast: ToastRecord): HTMLElement {
    const li = document.createElement("li");
    li.className = "an-toast";
    li.setAttribute(TOAST_ATTR, toast.id);
    li.setAttribute("data-type", toast.type);
    li.setAttribute(
      "role",
      toast.type === "error" || toast.type === "warning" ? "alert" : "status",
    );
    li.setAttribute(
      "aria-live",
      toast.type === "error" ? "assertive" : "polite",
    );
    li.setAttribute("aria-atomic", "true");
    li.tabIndex = 0;

    this.fillToast(li, toast);
    this.contentKeys.set(toast.id, contentKey(toast, this.store.getConfig()));
    this.bindInteractions(li, toast.id);
    requestAnimationFrame(() => {
      li.dataset.mounted = "true";
      this.store.setHeight(toast.id, li.getBoundingClientRect().height);
    });
    return li;
  }

  private updateToastElement(li: HTMLElement, toast: ToastRecord): void {
    li.setAttribute("data-type", toast.type);
    li.setAttribute(
      "role",
      toast.type === "error" || toast.type === "warning" ? "alert" : "status",
    );

    const key = contentKey(toast, this.store.getConfig());
    const previous = this.contentKeys.get(toast.id);
    if (previous !== key) {
      this.fillToast(li, toast);
      this.contentKeys.set(toast.id, key);
      requestAnimationFrame(() => {
        this.store.setHeight(toast.id, li.getBoundingClientRect().height);
      });
    } else {
      this.syncProgressPause(li, toast);
    }
  }

  private syncProgressPause(li: HTMLElement, toast: ToastRecord): void {
    const progress = li.querySelector<HTMLElement>("[data-an-progress]");
    if (!progress) {
      return;
    }
    if (toast.pausedAt !== undefined) {
      progress.dataset.paused = "true";
    } else {
      delete progress.dataset.paused;
    }
  }

  private fillToast(li: HTMLElement, toast: ToastRecord): void {
    const config = this.store.getConfig();
    li.className = ["an-toast", toast.className].filter(Boolean).join(" ");
    li.dataset.richColors = resolveRichColors(toast, config) ? "true" : "false";
    applyInlineStyles(li, toast.style);

    let bodyHtml = "";
    if (toast.customContent !== undefined) {
      if (typeof toast.customContent === "string") {
        bodyHtml = `<div class="an-toast__custom">${toast.customContent}</div>`;
      } else {
        bodyHtml = `<div class="an-toast__custom" data-custom-body></div>`;
      }
    } else {
      const titleHtml = toast.title
        ? `<div class="an-toast__title">${escapeHtml(toast.title)}</div>`
        : "";
      const messageHtml = toast.message
        ? `<div class="an-toast__message">${escapeHtml(toast.message)}</div>`
        : "";
      bodyHtml = `${titleHtml}${messageHtml}`;
    }

    let iconHtml = "";
    if (toast.icon === false) {
      iconHtml = "";
    } else if (typeof toast.icon === "string") {
      iconHtml = `<div class="an-toast__icon">${toast.icon}</div>`;
    } else if (toast.icon instanceof HTMLElement) {
      iconHtml = `<div class="an-toast__icon" data-custom-icon></div>`;
    } else {
      iconHtml = `<div class="an-toast__icon">${getDefaultIcon(toast.type)}</div>`;
    }

    const actionHtml = toast.action
      ? `<button type="button" class="an-toast__action" data-an-action>${escapeHtml(toast.action.label)}</button>`
      : "";
    const cancelHtml = toast.cancel
      ? `<button type="button" class="an-toast__cancel" data-an-cancel>${escapeHtml(toast.cancel.label)}</button>`
      : "";

    const closeHtml =
      toast.closeButton && toast.dismissible
        ? `<button type="button" class="an-toast__close" data-an-close aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`
        : "";

    const progressHtml = shouldShowProgress(toast, config)
      ? `<div class="an-toast__progress" data-an-progress data-progress-key="${toast.progressKey}" style="--an-duration: ${toast.remaining}ms"></div>`
      : "";

    li.innerHTML = `
      ${iconHtml}
      <div class="an-toast__content">
        ${bodyHtml}
        ${actionHtml || cancelHtml ? `<div class="an-toast__actions">${actionHtml}${cancelHtml}</div>` : ""}
      </div>
      ${closeHtml}
      ${progressHtml}
    `;

    if (toast.customContent instanceof HTMLElement) {
      const slot = li.querySelector("[data-custom-body]");
      slot?.appendChild(toast.customContent);
    }

    if (toast.icon instanceof HTMLElement) {
      const slot = li.querySelector("[data-custom-icon]");
      slot?.appendChild(toast.icon);
    }

    const actionBtn = li.querySelector("[data-an-action]");
    if (actionBtn instanceof HTMLButtonElement && toast.action) {
      actionBtn.addEventListener("click", (event) => {
        toast.action?.onClick(event);
        this.store.dismiss(toast.id, "Manual");
      });
    }

    const cancelBtn = li.querySelector("[data-an-cancel]");
    if (cancelBtn instanceof HTMLButtonElement && toast.cancel) {
      cancelBtn.addEventListener("click", (event) => {
        toast.cancel?.onClick(event);
        this.store.dismiss(toast.id, "Manual");
      });
    }

    const closeBtn = li.querySelector("[data-an-close]");
    if (closeBtn instanceof HTMLButtonElement) {
      closeBtn.addEventListener("click", () =>
        this.store.dismiss(toast.id, "Manual"),
      );
    }

    this.syncProgressPause(li, toast);
  }

  private bindInteractions(li: HTMLElement, id: string): void {
    li.addEventListener("pointerdown", (event) => {
      if (!this.store.getConfig().dismissible) {
        return;
      }
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      this.dragging = { id, startX: event.clientX, currentX: event.clientX };
      if (typeof li.setPointerCapture === "function") {
        try {
          li.setPointerCapture(event.pointerId);
        } catch {
          // jsdom / unsupported environments
        }
      }
      li.dataset.swiping = "true";
    });

    li.addEventListener("pointermove", (event) => {
      if (!this.dragging || this.dragging.id !== id) {
        return;
      }
      this.dragging.currentX = event.clientX;
      const delta = this.dragging.currentX - this.dragging.startX;
      li.style.setProperty("--an-swipe-x", `${delta}px`);
      li.style.opacity = String(Math.max(0.2, 1 - Math.abs(delta) / 200));
    });

    const endSwipe = (event: PointerEvent) => {
      if (!this.dragging || this.dragging.id !== id) {
        return;
      }
      const delta = this.dragging.currentX - this.dragging.startX;
      this.dragging = null;
      delete li.dataset.swiping;
      li.style.removeProperty("--an-swipe-x");
      li.style.opacity = "";
      try {
        li.releasePointerCapture(event.pointerId);
      } catch {
        // already released / unsupported
      }
      if (Math.abs(delta) > 80) {
        this.store.dismiss(id, "Manual");
      }
    };

    li.addEventListener("pointerup", endSwipe);
    li.addEventListener("pointercancel", endSwipe);
  }

  private updateStackLayout(toasts: readonly ToastRecord[]): void {
    const config = this.store.getConfig();
    const byPosition = new Map<ToastPosition, ToastRecord[]>();

    for (const toast of toasts) {
      const position = resolvePosition(toast, config);
      const list = byPosition.get(position) ?? [];
      list.push(toast);
      byPosition.set(position, list);
    }

    for (const [position, stack] of this.stacks) {
      const group = byPosition.get(position) ?? [];
      const expanded = stack.expanded || config.expand;
      stack.toaster.dataset.expanded = expanded ? "true" : "false";

      const ordered = [...group].reverse();
      let offset = 0;
      let stackHeight = 0;

      ordered.forEach((toast, index) => {
        const node = this.nodes.get(toast.id);
        if (!node) {
          return;
        }

        const visible = index < config.visibleToasts;
        node.dataset.visible = visible ? "true" : "false";
        node.style.setProperty("--an-index", String(index));
        node.style.setProperty("--an-toasts-before", String(index));

        const height = toast.height || 64;

        if (expanded) {
          node.style.setProperty("--an-offset", `${offset}px`);
          node.style.setProperty("--an-scale", "1");
          offset += height + config.gap;
          if (visible) {
            stackHeight = offset - config.gap;
          }
        } else {
          const scale = Math.max(0.92, 1 - index * 0.05);
          const stackOffset = index * 12;
          node.style.setProperty("--an-offset", `${stackOffset}px`);
          node.style.setProperty("--an-scale", String(scale));
          if (visible) {
            stackHeight = Math.max(stackHeight, height + stackOffset);
          }
        }
      });

      const height = Math.max(0, stackHeight);
      stack.hitbox.style.height = `${height}px`;
      stack.toaster.style.minHeight = height > 0 ? `${height}px` : "";
    }
  }
}
