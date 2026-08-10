import { toast } from "alert-notify";

export type DemoConfig = {
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  theme: "light" | "dark" | "system";
  richColors: boolean;
  duration: number;
  autoClose: boolean;
  visibleToasts: number;
  expand: boolean;
  progressBar: boolean;
  pauseOnHover: boolean;
  pauseOnWindowBlur: boolean;
  resetTimerOnHover: boolean;
  closeButton: boolean;
  dismissible: boolean;
  gap: number;
  offset: number;
  dir: "ltr" | "rtl" | "auto";
};

export type ToastPlayOptions = {
  message: string;
  title: string;
  id: string;
  duration: number;
  autoClose: boolean;
  closeButton: boolean;
  dismissible: boolean;
  important: boolean;
  hideIcon: boolean;
  actionLabel: string;
  cancelLabel: string;
};

export type PlaygroundState = {
  config: DemoConfig;
  toastOpts: ToastPlayOptions;
};

export const defaultDemoConfig: DemoConfig = {
  position: "top-right",
  theme: "system",
  richColors: true,
  duration: 4000,
  autoClose: true,
  visibleToasts: 3,
  expand: false,
  progressBar: true,
  pauseOnHover: true,
  pauseOnWindowBlur: true,
  resetTimerOnHover: false,
  closeButton: true,
  dismissible: true,
  gap: 12,
  offset: 16,
  dir: "auto",
};

export const defaultToastOpts: ToastPlayOptions = {
  message: "Your changes were saved.",
  title: "",
  id: "",
  duration: 4000,
  autoClose: true,
  closeButton: true,
  dismissible: true,
  important: false,
  hideIcon: false,
  actionLabel: "",
  cancelLabel: "",
};

export function applyDemoConfig(config: Partial<DemoConfig>) {
  toast.config(config);
}

function buildToastOptions(opts: ToastPlayOptions) {
  const options: Record<string, unknown> = {
    duration: opts.duration,
    autoClose: opts.autoClose,
    closeButton: opts.closeButton,
    dismissible: opts.dismissible,
    important: opts.important,
  };
  if (opts.title.trim()) options.title = opts.title.trim();
  if (opts.id.trim()) options.id = opts.id.trim();
  if (opts.hideIcon) options.icon = false;
  if (opts.actionLabel.trim()) {
    options.action = {
      label: opts.actionLabel.trim(),
      onClick: () => toast.message("Action clicked"),
    };
  }
  if (opts.cancelLabel.trim()) {
    options.cancel = {
      label: opts.cancelLabel.trim(),
      onClick: () => toast.message("Cancelled"),
    };
  }
  return options;
}

export function fireToast(kind: string, toastOpts: ToastPlayOptions = defaultToastOpts) {
  const options = buildToastOptions(toastOpts);
  const message = toastOpts.message.trim() || "Toast message";

  if (kind === "promise") {
    const upload = new Promise<string>((resolve) =>
      setTimeout(() => resolve("photo.jpg"), 1600),
    );
    return toast.promise(upload, {
      loading: { message: "Uploading…", ...options, autoClose: false },
      success: (name) => ({
        message: `Uploaded ${name}`,
        title: toastOpts.title.trim() || undefined,
        ...options,
      }),
      error: { message: "Upload failed", ...options },
    });
  }
  if (kind === "undo") {
    return toast.success(message, {
      ...options,
      title: toastOpts.title.trim() || "Item deleted",
      action: {
        label: toastOpts.actionLabel.trim() || "Undo",
        onClick: () => toast.message("Restored"),
      },
    });
  }
  if (kind === "custom") {
    return toast.custom(`<strong>${escapeHtml(message)}</strong>`, options as never);
  }
  if (kind === "stack") {
    for (let i = 1; i <= 5; i += 1) {
      toast.message(`${message} ${i}`, {
        ...options,
        id: optsId(toastOpts, i),
        title: toastOpts.title.trim() || undefined,
      });
    }
    return;
  }
  if (kind === "dismiss") {
    toast.dismiss();
    return;
  }
  if (kind === "success") return toast.success(message, options as never);
  if (kind === "error") return toast.error(message, options as never);
  if (kind === "warning") return toast.warning(message, options as never);
  if (kind === "info") return toast.info(message, options as never);
  if (kind === "message") return toast.message(message, options as never);
  if (kind === "loading") {
    return toast.loading(message, {
      ...options,
      autoClose: toastOpts.autoClose,
    } as never);
  }
}

function optsId(opts: ToastPlayOptions, index: number) {
  if (!opts.id.trim()) return undefined;
  return `${opts.id.trim()}-${index}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function bindToastButtons(
  root: ParentNode = document,
  getOpts?: () => ToastPlayOptions,
) {
  const buttons = root.querySelectorAll("[data-toast]");
  const cleanups: Array<() => void> = [];

  buttons.forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    const handler = () => {
      const kind = button.getAttribute("data-toast");
      if (kind) fireToast(kind, getOpts?.() ?? defaultToastOpts);
    };
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });

  return () => cleanups.forEach((fn) => fn());
}

export function syncToastThemeWithSite() {
  const siteTheme = document.documentElement.getAttribute("data-theme");
  const theme: DemoConfig["theme"] =
    siteTheme === "dark" || siteTheme === "light" ? siteTheme : "system";
  toast.config({ theme });
  return theme;
}

export type SnippetStack = "vanilla" | "react" | "vue" | "svelte" | "cdn";

export type HomeMode = "success" | "error" | "promise" | "undo" | "stack" | "dark";

export function buildHomeSnippet(mode: HomeMode): string {
  if (mode === "error") {
    return `import { toast } from "alert-notify";

toast.error("Something went wrong", { title: "Failed" });`;
  }
  if (mode === "promise") {
    return `import { toast } from "alert-notify";

toast.promise(upload(), {
  loading: "Uploading…",
  success: (name) => \`Uploaded \${name}\`,
  error: "Upload failed",
});`;
  }
  if (mode === "undo") {
    return `import { toast } from "alert-notify";

toast.success("You can restore it.", {
  title: "Item deleted",
  action: { label: "Undo", onClick: () => toast.message("Restored") },
});`;
  }
  if (mode === "stack") {
    return `import { toast } from "alert-notify";

toast.config({ visibleToasts: 5 });
for (let i = 1; i <= 5; i += 1) toast.message(\`Toast \${i}\`);`;
  }
  if (mode === "dark") {
    return `import { toast } from "alert-notify";

toast.config({ theme: "dark", richColors: true });
toast.success("Saved");`;
  }
  return `import { toast } from "alert-notify";

toast.config({ position: "top-right", richColors: true });
toast.success("Saved");`;
}

function quote(value: string) {
  return JSON.stringify(value);
}

function toastOptionsSnippet(opts: ToastPlayOptions): string {
  const lines: string[] = [];
  if (opts.title.trim()) lines.push(`  title: ${quote(opts.title.trim())}`);
  if (opts.id.trim()) lines.push(`  id: ${quote(opts.id.trim())}`);
  if (opts.duration !== 4000) lines.push(`  duration: ${opts.duration}`);
  if (!opts.autoClose) lines.push(`  autoClose: false`);
  if (!opts.closeButton) lines.push(`  closeButton: false`);
  if (!opts.dismissible) lines.push(`  dismissible: false`);
  if (opts.important) lines.push(`  important: true`);
  if (opts.hideIcon) lines.push(`  icon: false`);
  if (opts.actionLabel.trim()) {
    lines.push(
      `  action: { label: ${quote(opts.actionLabel.trim())}, onClick: () => {} }`,
    );
  }
  if (opts.cancelLabel.trim()) {
    lines.push(
      `  cancel: { label: ${quote(opts.cancelLabel.trim())}, onClick: () => {} }`,
    );
  }
  return lines.join(",\n");
}

function configSnippet(config: DemoConfig): string {
  const lines = [
    `  position: "${config.position}"`,
    `  theme: "${config.theme}"`,
  ];
  if (config.richColors) lines.push(`  richColors: true`);
  if (!config.progressBar) lines.push(`  progressBar: false`);
  if (config.expand) lines.push(`  expand: true`);
  if (config.visibleToasts !== 3) lines.push(`  visibleToasts: ${config.visibleToasts}`);
  if (config.gap !== 12) lines.push(`  gap: ${config.gap}`);
  if (config.offset !== 16) lines.push(`  offset: ${config.offset}`);
  if (config.dir !== "auto") lines.push(`  dir: "${config.dir}"`);
  if (!config.pauseOnHover) lines.push(`  pauseOnHover: false`);
  if (config.resetTimerOnHover) lines.push(`  resetTimerOnHover: true`);
  if (!config.pauseOnWindowBlur) lines.push(`  pauseOnWindowBlur: false`);
  return lines.join(",\n");
}

function buildToastCall(type: string, opts: ToastPlayOptions): string {
  const message = opts.message.trim() || "Your changes were saved.";
  const optionsBody = toastOptionsSnippet(opts);
  const optionsArg = optionsBody ? `, {\n${optionsBody}\n}` : "";

  if (type === "promise") {
    return `toast.promise(upload(), {
  loading: "Uploading…",
  success: (name) => \`Uploaded \${name}\`,
  error: "Upload failed",
});`;
  }

  const method =
    type === "error" ||
    type === "warning" ||
    type === "info" ||
    type === "message" ||
    type === "loading"
      ? type
      : "success";

  return `toast.${method}(${quote(message)}${optionsArg});`;
}

export function buildSnippet(
  stack: SnippetStack,
  config: DemoConfig,
  toastOpts: ToastPlayOptions = defaultToastOpts,
  type = "success",
): string {
  const configLines = configSnippet(config);
  const toastCall = buildToastCall(type, toastOpts);
  const toasterProps = [
    `position="${config.position}"`,
    `theme="${config.theme}"`,
    config.richColors ? `richColors` : null,
  ]
    .filter(Boolean)
    .join("\n        ");

  const vueProps = [
    `position="${config.position}"`,
    `theme="${config.theme}"`,
    config.richColors ? `:rich-colors="true"` : null,
  ]
    .filter(Boolean)
    .join("\n    ");

  if (stack === "vanilla") {
    return `import { toast } from "alert-notify";

toast.config({
${configLines},
});

${toastCall}`;
  }

  if (stack === "react") {
    return `import { toast } from "alert-notify";
import { Toaster } from "alert-notify/react";

export function App() {
  return (
    <>
      <Toaster
        ${toasterProps}
      />
      <button onClick={() => ${toastCall.replace(/\n/g, "\n        ")}}>
        Show toast
      </button>
    </>
  );
}`;
  }

  if (stack === "vue") {
    return `<script setup>
import { toast } from "alert-notify";
import { Toaster } from "alert-notify/vue";

function show() {
  ${toastCall.replace(/\n/g, "\n  ")}
}
</script>

<template>
  <Toaster
    ${vueProps}
  />
  <button @click="show">Show toast</button>
</template>`;
  }

  if (stack === "svelte") {
    return `<script>
  import { toast } from "alert-notify";
  import Toaster from "alert-notify/svelte";

  function show() {
    ${toastCall.replace(/\n/g, "\n    ")}
  }
</script>

<Toaster
  ${toasterProps}
/>
<button onclick={show}>Show toast</button>`;
  }

  return `<script src="https://unpkg.com/alert-notify@3/dist/alert-notify.global.js"></script>
<script>
  AlertNotify.toast.config({
${configLines},
  });
  AlertNotify.${toastCall}
</script>`;
}

