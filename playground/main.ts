import { toast } from "alert-notify";
import type { ToastPosition, ToastTheme, ToastType } from "alert-notify";
import "alert-notify/style.css";
import "./style.css";

type PlaygroundState = {
  message: string;
  title: string;
  type: ToastType;
  position: ToastPosition;
  theme: ToastTheme;
  duration: number;
  richColors: boolean;
  autoClose: boolean;
  closeButton: boolean;
  progressBar: boolean;
  pauseOnHover: boolean;
  resetTimerOnHover: boolean;
  expand: boolean;
};

const state: PlaygroundState = {
  message: "Your changes are live.",
  title: "Saved successfully",
  type: "success",
  position: "top-right",
  theme: "system",
  duration: 4000,
  richColors: true,
  autoClose: true,
  closeButton: true,
  progressBar: true,
  pauseOnHover: true,
  resetTimerOnHover: false,
  expand: false,
};

const positions: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const themes: ToastTheme[] = ["light", "dark", "system"];
const types: ToastType[] = [
  "success",
  "error",
  "warning",
  "info",
  "message",
  "loading",
];

function applyConfig(): void {
  toast.config({
    position: state.position,
    theme: state.theme,
    richColors: state.richColors,
    progressBar: state.progressBar,
    closeButton: state.closeButton,
    duration: state.duration,
    autoClose: state.autoClose,
    pauseOnHover: state.pauseOnHover,
    resetTimerOnHover: state.resetTimerOnHover,
    expand: state.expand,
  });
}

function showToast(): void {
  applyConfig();
  toast[state.type](state.message, {
    title: state.title || undefined,
    duration: state.duration,
    autoClose: state.type === "loading" ? false : state.autoClose,
    closeButton: state.closeButton,
  });
}

function showPromise(): void {
  applyConfig();
  const work = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.25) resolve("report.csv");
      else reject(new Error("network"));
    }, 1400);
  });
  toast.promise(work, {
    loading: "Uploading…",
    success: (name) => `Uploaded ${name}`,
    error: "Upload failed",
  });
}

function showUndo(): void {
  applyConfig();
  toast.success("You can restore this item.", {
    title: "Deleted",
    action: {
      label: "Undo",
      onClick: () => toast.message("Restored"),
    },
  });
}

function showCustom(): void {
  applyConfig();
  toast.custom("<strong>Custom</strong> markup toast", { autoClose: false });
}

function snippet(): string {
  return `import { toast } from "alert-notify";
import "alert-notify/style.css";

toast.config({
  position: "${state.position}",
  theme: "${state.theme}",
  richColors: ${state.richColors},
  duration: ${state.duration},
});

toast.${state.type}("${state.message.replace(/"/g, '\\"')}", {
  title: "${state.title.replace(/"/g, '\\"')}",
});`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function textField(
  label: string,
  key: "message" | "title",
  onChange: () => void,
): HTMLElement {
  const input = el("input", {
    type: "text",
    value: state[key],
  }) as HTMLInputElement;
  input.addEventListener("input", () => {
    state[key] = input.value;
    onChange();
  });
  return el("div", { className: "field" }, [el("label", {}, [label]), input]);
}

function selectField<T extends string>(
  label: string,
  options: T[],
  value: T,
  onPick: (next: T) => void,
): HTMLElement {
  const select = el("select") as HTMLSelectElement;
  for (const option of options) {
    const opt = el("option", { value: option }, [option]);
    if (option === value) opt.selected = true;
    select.append(opt);
  }
  select.addEventListener("change", () => onPick(select.value as T));
  return el("div", { className: "field" }, [el("label", {}, [label]), select]);
}

function numberField(
  label: string,
  value: number,
  onPick: (next: number) => void,
): HTMLElement {
  const input = el("input", {
    type: "number",
    min: "500",
    max: "15000",
    step: "500",
    value: String(value),
  }) as HTMLInputElement;
  input.addEventListener("input", () => onPick(Number(input.value) || 4000));
  return el("div", { className: "field" }, [el("label", {}, [label]), input]);
}

function check(
  label: string,
  checked: boolean,
  onPick: (next: boolean) => void,
): HTMLElement {
  const input = el("input", { type: "checkbox" }) as HTMLInputElement;
  input.checked = checked;
  input.addEventListener("change", () => onPick(input.checked));
  return el("label", {}, [input, label]);
}

const app = document.querySelector("#app");
if (!app) throw new Error("Missing #app");

const code = el("pre", { className: "snippet" }, [snippet()]);

function refreshCode(): void {
  code.textContent = snippet();
}

function syncConfig(): void {
  applyConfig();
  refreshCode();
}

const controls = el("section", { className: "panel" }, [
  el("h2", {}, ["Options"]),
  textField("Title", "title", refreshCode),
  textField("Message", "message", refreshCode),
  selectField("Type", types, state.type, (next) => {
    state.type = next;
    refreshCode();
  }),
  selectField("Position", positions, state.position, (next) => {
    state.position = next;
    syncConfig();
  }),
  selectField("Theme", themes, state.theme, (next) => {
    state.theme = next;
    syncConfig();
  }),
  numberField("Duration (ms)", state.duration, (next) => {
    state.duration = next;
    syncConfig();
  }),
  el("div", { className: "checks" }, [
    check("Rich colors", state.richColors, (next) => {
      state.richColors = next;
      syncConfig();
    }),
    check("Auto close", state.autoClose, (next) => {
      state.autoClose = next;
      syncConfig();
    }),
    check("Close button", state.closeButton, (next) => {
      state.closeButton = next;
      syncConfig();
    }),
    check("Progress bar", state.progressBar, (next) => {
      state.progressBar = next;
      syncConfig();
    }),
    check("Pause on hover", state.pauseOnHover, (next) => {
      state.pauseOnHover = next;
      syncConfig();
    }),
    check("Reset timer on hover", state.resetTimerOnHover, (next) => {
      state.resetTimerOnHover = next;
      syncConfig();
    }),
    check("Expand stack", state.expand, (next) => {
      state.expand = next;
      syncConfig();
    }),
  ]),
]);

const firePrimary = el("button", { className: "primary", type: "button" }, [
  "Show toast",
]);
firePrimary.addEventListener("click", showToast);

const firePromise = el("button", { type: "button" }, ["Promise toast"]);
firePromise.addEventListener("click", showPromise);

const fireUndo = el("button", { type: "button" }, ["Undo action"]);
fireUndo.addEventListener("click", showUndo);

const fireCustom = el("button", { type: "button" }, ["Custom toast"]);
fireCustom.addEventListener("click", showCustom);

const dismissAll = el("button", { className: "ghost-danger", type: "button" }, [
  "Dismiss all",
]);
dismissAll.addEventListener("click", () => toast.dismiss());

const actions = el("section", { className: "panel" }, [
  el("h2", {}, ["Try it"]),
  el("div", { className: "actions" }, [
    firePrimary,
    firePromise,
    fireUndo,
    fireCustom,
    dismissAll,
  ]),
  code,
]);

app.append(
  el("header", { className: "hero" }, [
    el("h1", { className: "brand" }, ["alert-notify"]),
    el("p", { className: "lede" }, [
      "Local playground for the package source. Change options, fire toasts, copy the snippet.",
    ]),
  ]),
  el("div", { className: "layout" }, [controls, actions]),
);

applyConfig();
