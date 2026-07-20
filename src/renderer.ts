import { escapeHtml } from "./escape";
import { getDefaultIcon } from "./icons";
import type { ToastStore } from "./store";
import type { ToastPosition, ToastRecord, ToasterConfig } from "./types";

const PORTAL_ATTR = "data-alert-notify-portal";
const TOAST_ATTR = "data-an-toast-id";

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
      // Style keys from Partial<CSSStyleDeclaration>
      (el.style as unknown as Record<string, string>)[key] = String(value);
    } else {
      el.style.setProperty(key, String(value));
    }
  }
}

function positionClass(position: ToastPosition): string {
  return `an-toaster--${position}`;
}

export class ToastRenderer {
  private store: ToastStore;
  private portal: HTMLElement | null = null;
  private toaster: HTMLElement | null = null;
  private nodes = new Map<string, HTMLElement>();
  private expanded = false;
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
        this.store.dismiss(id);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    this.unsubscribers.push(() => document.removeEventListener("keydown", onKeyDown));
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.nodes.clear();
    this.portal?.remove();
    this.portal = null;
    this.toaster = null;
  }

  private ensurePortal(): void {
    if (!isBrowser() || this.portal) {
      return;
    }

    const portal = document.createElement("div");
    portal.setAttribute(PORTAL_ATTR, "");
    document.body.appendChild(portal);

    this.portal = portal;
    this.toaster = document.createElement("ol");
    this.toaster.className = "an-toaster";
    this.toaster.setAttribute("data-an-toaster", "");
    this.toaster.tabIndex = -1;
    portal.appendChild(this.toaster);
    this.applyConfig(this.store.getConfig());

    this.toaster.addEventListener("mouseenter", () => {
      this.expanded = true;
      this.updateStackLayout(this.store.getToasts());
      if (this.store.getConfig().pauseOnHover) {
        this.store.pauseAll();
      }
    });
    this.toaster.addEventListener("mouseleave", () => {
      this.expanded = false;
      this.updateStackLayout(this.store.getToasts());
      if (this.store.getConfig().pauseOnHover) {
        this.store.resumeAll();
      }
    });
  }

  private applyConfig(config: ToasterConfig): void {
    if (!this.toaster) {
      return;
    }

    const theme = resolveTheme(config.theme);
    this.toaster.className = [
      "an-toaster",
      positionClass(config.position),
      config.toasterClassName ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    this.toaster.dataset.theme = theme;
    this.toaster.dataset.richColors = config.richColors ? "true" : "false";
    this.toaster.dataset.expanded = this.expanded || config.expand ? "true" : "false";
    this.toaster.dataset.yPosition = config.position.startsWith("top") ? "top" : "bottom";
    this.toaster.dataset.xPosition = config.position.endsWith("left")
      ? "left"
      : config.position.endsWith("right")
        ? "right"
        : "center";

    this.toaster.style.setProperty("--an-gap", `${config.gap}px`);
    this.toaster.style.setProperty("--an-offset", offsetValue(config.offset));
    this.toaster.dir = config.dir === "auto" ? "" : config.dir;
    applyInlineStyles(this.toaster, config.style);
  }

  private render(toasts: readonly ToastRecord[]): void {
    if (!this.enabled || !isBrowser()) {
      return;
    }
    this.ensurePortal();
    if (!this.toaster) {
      return;
    }

    const ids = new Set(toasts.map((toast) => toast.id));
    for (const [id, node] of this.nodes) {
      if (!ids.has(id)) {
        node.dataset.removed = "true";
        const remove = () => {
          node.remove();
          this.nodes.delete(id);
        };
        node.addEventListener("transitionend", remove, { once: true });
        setTimeout(remove, 350);
      }
    }

    for (const toast of toasts) {
      let node = this.nodes.get(toast.id);
      if (!node) {
        node = this.createToastElement(toast);
        this.nodes.set(toast.id, node);
        this.toaster.appendChild(node);
      } else {
        this.updateToastElement(node, toast);
      }
    }

    this.updateStackLayout(toasts);
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
    li.setAttribute("aria-live", toast.type === "error" ? "assertive" : "polite");
    li.setAttribute("aria-atomic", "true");
    li.tabIndex = 0;

    this.fillToast(li, toast);
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
    this.fillToast(li, toast);
    requestAnimationFrame(() => {
      this.store.setHeight(toast.id, li.getBoundingClientRect().height);
    });
  }

  private fillToast(li: HTMLElement, toast: ToastRecord): void {
    const config = this.store.getConfig();
    li.className = ["an-toast", toast.className].filter(Boolean).join(" ");
    applyInlineStyles(li, toast.style);

    const titleHtml = toast.html
      ? toast.html
      : `<div class="an-toast__title">${escapeHtml(toast.title)}</div>`;

    const descriptionHtml = toast.description
      ? `<div class="an-toast__description">${escapeHtml(toast.description)}</div>`
      : "";

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

    const progressHtml =
      config.progressBar && Number.isFinite(toast.duration)
        ? `<div class="an-toast__progress" data-an-progress style="--an-duration: ${toast.remaining}ms"></div>`
        : "";

    li.innerHTML = `
      ${iconHtml}
      <div class="an-toast__content">
        ${titleHtml}
        ${descriptionHtml}
        ${actionHtml || cancelHtml ? `<div class="an-toast__actions">${actionHtml}${cancelHtml}</div>` : ""}
      </div>
      ${closeHtml}
      ${progressHtml}
    `;

    if (toast.icon instanceof HTMLElement) {
      const slot = li.querySelector("[data-custom-icon]");
      slot?.appendChild(toast.icon);
    }

    const actionBtn = li.querySelector("[data-an-action]");
    if (actionBtn instanceof HTMLButtonElement && toast.action) {
      actionBtn.addEventListener("click", (event) => {
        toast.action?.onClick(event);
        this.store.dismiss(toast.id);
      });
    }

    const cancelBtn = li.querySelector("[data-an-cancel]");
    if (cancelBtn instanceof HTMLButtonElement && toast.cancel) {
      cancelBtn.addEventListener("click", (event) => {
        toast.cancel?.onClick(event);
        this.store.dismiss(toast.id);
      });
    }

    const closeBtn = li.querySelector("[data-an-close]");
    if (closeBtn instanceof HTMLButtonElement) {
      closeBtn.addEventListener("click", () => this.store.dismiss(toast.id));
    }

    const progress = li.querySelector<HTMLElement>("[data-an-progress]");
    if (progress) {
      if (toast.pausedAt !== undefined) {
        progress.dataset.paused = "true";
      } else {
        delete progress.dataset.paused;
      }
    }
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
      li.setPointerCapture(event.pointerId);
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
        // already released
      }
      if (Math.abs(delta) > 80) {
        this.store.dismiss(id);
      }
    };

    li.addEventListener("pointerup", endSwipe);
    li.addEventListener("pointercancel", endSwipe);
  }

  private updateStackLayout(toasts: readonly ToastRecord[]): void {
    if (!this.toaster) {
      return;
    }

    const config = this.store.getConfig();
    const expanded = this.expanded || config.expand;
    this.toaster.dataset.expanded = expanded ? "true" : "false";

    const ordered = [...toasts].reverse();
    let offset = 0;

    ordered.forEach((toast, index) => {
      const node = this.nodes.get(toast.id);
      if (!node) {
        return;
      }

      const visible = index < config.visibleToasts;
      node.dataset.visible = visible ? "true" : "false";
      node.style.setProperty("--an-index", String(index));
      node.style.setProperty("--an-toasts-before", String(index));

      if (expanded) {
        node.style.setProperty("--an-offset", `${offset}px`);
        node.style.setProperty("--an-scale", "1");
        offset += (toast.height || 64) + config.gap;
      } else {
        const scale = Math.max(0.92, 1 - index * 0.05);
        const stackOffset = index * 12;
        node.style.setProperty("--an-offset", `${stackOffset}px`);
        node.style.setProperty("--an-scale", String(scale));
      }
    });
  }
}
