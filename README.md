# alert-notify

[![npm](https://img.shields.io/npm/v/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)

**Tiny framework-agnostic toasts.** About **4.6KB gzip** JS, zero runtime dependencies. Works in React, Vue, Svelte, Angular, Astro, and plain HTML.

No root provider required. The portal auto-mounts. Optional `<Toaster />` wrappers only sync config props for nicer DX.

```ts
import { toast } from "alert-notify";
import "alert-notify/style.css";

toast.success("Saved");
```

## Why this package

| | alert-notify | react-hot-toast | Sonner | react-toastify |
|--|--|--|--|--|
| Approx. JS gzip | **~4.6KB** | ~4–5KB | ~10–12KB | ~40KB+ |
| Framework lock-in | **None** | React | React | React |
| Provider / container | **Optional** | Required | Required | Required |
| Runtime deps | **0** | 0 | 0 | 0 |

Built for apps that care about bundle size and do not want a React-only toast stack.

## Install

```bash
npm install alert-notify
```

## Quick start (vanilla / any framework)

```ts
import { toast } from "alert-notify";
import "alert-notify/style.css";

toast.success("Profile updated");
toast.error("Something went wrong", { description: "Please try again." });
toast.promise(save(), {
  loading: "Saving…",
  success: "Saved",
  error: (err) => (err instanceof Error ? err.message : "Failed"),
});
```

## Framework guides

### React

Optional `<Toaster />` near the root to pass config as props. Still no portal component required.

```tsx
import { toast } from "alert-notify";
import { Toaster } from "alert-notify/react";
import "alert-notify/style.css";

export function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <button onClick={() => toast.success("Saved")}>Save</button>
    </>
  );
}
```

### Vue 3

```vue
<script setup>
import { toast } from "alert-notify";
import { Toaster } from "alert-notify/vue";
import "alert-notify/style.css";
</script>

<template>
  <Toaster position="top-right" :rich-colors="true" />
  <button @click="toast.success('Saved')">Save</button>
</template>
```

### Svelte

```svelte
<script>
  import { toast } from "alert-notify";
  import Toaster from "alert-notify/svelte";
  import "alert-notify/style.css";
</script>

<Toaster position="top-right" richColors />
<button onclick={() => toast.success("Saved")}>Save</button>
```

### Angular

```ts
import { toast } from "alert-notify";
import "alert-notify/style.css";

toast.config({ position: "top-right", richColors: true });
toast.success("Saved");
```

### Astro

Use a client script or island; same imperative API.

```astro
<script>
  import { toast } from "alert-notify";
  import "alert-notify/style.css";
  toast.success("Saved");
</script>
```

### CDN / vanilla HTML

```html
<link rel="stylesheet" href="https://unpkg.com/alert-notify@2/dist/style.css" />
<script src="https://unpkg.com/alert-notify@2/dist/alert-notify.global.js"></script>
<script>
  AlertNotify.toast.success("Hello from CDN");
</script>
```

## API

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `toast(title, options?)` | `ToastId` | Generic toast (`message` type) |
| `toast.success / error / warning / info / loading / message` | `ToastId` | Typed helpers |
| `toast.promise(promise, messages)` | `Promise<T>` | Loading → success/error on the same toast |
| `toast.dismiss(id?)` | `void` | Dismiss one toast, or all when omitted |
| `toast.config(partial)` | `void` | Update global toaster settings |
| `toast.getConfig()` | `ToasterConfig` | Read current config |
| `toast.getToasts()` | `ToastRecord[]` | Current list (headless) |
| `toast.subscribe(listener)` | `() => void` | Subscribe to list changes |
| `toast.destroy()` | `void` | Dismiss all and remove portal |
| `createToaster(config?, { headless? })` | `ToasterInstance` | Isolated toaster instance |

### Per-toast options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | auto UUID | Same id updates in place |
| `type` | `ToastType` | from method | `success \| error \| warning \| info \| loading \| message` |
| `description` | `string` | — | Secondary text |
| `duration` | `number` | config / `Infinity` for loading | Auto-close ms; `Infinity` = sticky |
| `icon` | `string \| HTMLElement \| false` | built-in SVG | Custom icon, or `false` to hide |
| `html` | `string` | — | Opt-in unescaped title HTML |
| `action` | `{ label, onClick }` | — | Primary action (e.g. Undo) |
| `cancel` | `{ label, onClick }` | — | Secondary action |
| `closeButton` | `boolean` | from config (`true`) | Show × button |
| `dismissible` | `boolean` | from config (`true`) | Allow swipe / close |
| `important` | `boolean` | `false` | Jump to front of queue |
| `className` | `string` | — | Extra class on toast |
| `style` | `object` | — | Inline styles |
| `onDismiss` | `(toast) => void` | — | Manual dismiss callback |
| `onAutoClose` | `(toast) => void` | — | Timer-finished callback |

```ts
toast.success("Deleted", {
  id: "delete-item",
  description: "You can restore it.",
  duration: 5000,
  icon: false,
  closeButton: true,
  important: true,
  action: { label: "Undo", onClick: () => restore() },
});
```

### Global config defaults

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `position` | `ToastPosition` | `"top-right"` | 6 corners + top/bottom center |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Color scheme |
| `duration` | `number` | `4000` | Default auto-close ms |
| `closeButton` | `boolean` | `true` | Show close by default |
| `dismissible` | `boolean` | `true` | Allow dismiss by default |
| `richColors` | `boolean` | `false` | Soft tinted type surfaces |
| `visibleToasts` | `number` | `3` | Max visible in stack |
| `expand` | `boolean` | `false` | Always expand (else hover) |
| `gap` | `number` | `12` | Expanded gap (px) |
| `offset` | `number \| string` | `16` | Edge offset |
| `dir` | `"ltr" \| "rtl" \| "auto"` | `"auto"` | Direction |
| `pauseOnHover` | `boolean` | `true` | Pause on hover |
| `pauseOnWindowBlur` | `boolean` | `true` | Pause on blur |
| `progressBar` | `boolean` | `true` | Duration bar |
| `toasterClassName` | `string` | — | Class on toaster |
| `style` | `object` | — | Styles on toaster |

```ts
toast.config({
  position: "top-right",
  theme: "system",
  duration: 4000,
  richColors: true,
  visibleToasts: 3,
  expand: false,
  progressBar: true,
});
```

Nothing else is required for setup. Import CSS once; the portal auto-mounts.

## Dark mode

```ts
// Follow OS preference (default)
toast.config({ theme: "system" });

// Force dark or light
toast.config({ theme: "dark" });
toast.config({ theme: "light" });
```

With `theme: "system"` the toaster also tracks:

- `prefers-color-scheme`
- `html.dark` / `html.light` (Tailwind-style)
- `html[data-theme="dark"]` / `html[data-theme="light"]`

```tsx
// React example
<html className={dark ? "dark" : ""}>
  <Toaster theme="system" richColors />
</html>
```

## Theming with CSS variables

All colors are CSS variables on `.an-toaster`. Override them in your own stylesheet after importing `alert-notify/style.css`.

```css
/* your-app.css */
.an-toaster {
  /* Surfaces */
  --an-bg: #ffffff;
  --an-fg: #0f172a;
  --an-muted: #64748b;
  --an-border: rgba(15, 23, 42, 0.1);
  --an-shadow: 0 10px 24px -8px rgba(15, 23, 42, 0.14);
  --an-radius: 14px;

  /* Accent colors (icons + rich title tint) */
  --an-success: #3d8b5a;
  --an-error: #c45c5c;
  --an-warning: #b8860b;
  --an-info: #4a7ab5;
  --an-loading: #6b7280;
  --an-progress: rgba(15, 23, 42, 0.14);

  /* Rich fills (used when richColors: true) */
  --an-success-bg: #f3faf5;
  --an-success-border: #cfe8d7;
  --an-error-bg: #faf4f4;
  --an-error-border: #ebd4d4;
  --an-warning-bg: #faf7f0;
  --an-warning-border: #ead9b0;
  --an-info-bg: #f3f6fa;
  --an-info-border: #d0dceb;
}

/* Dark theme tokens (applied when theme resolves to dark) */
.an-toaster[data-theme="dark"] {
  --an-bg: #1e293b;
  --an-fg: #f8fafc;
  --an-muted: #94a3b8;
  --an-success: #6ea882;
  --an-error: #d08989;
  --an-warning: #c4a35a;
  --an-info: #7a9cc4;
  --an-success-bg: #1a2e24;
  --an-success-border: #2d4a3a;
  --an-error-bg: #2e1f22;
  --an-error-border: #4a3034;
  --an-warning-bg: #2a2518;
  --an-warning-border: #4a3f28;
  --an-info-bg: #1c2533;
  --an-info-border: #2e3d52;
}
```

Brand example — only change the accents and rich fills:

```css
.an-toaster {
  --an-success: #0f766e;
  --an-success-bg: #f0f7f6;
  --an-success-border: #c5ddd9;
  --an-error: #a85d6c;
  --an-error-bg: #f8f3f4;
  --an-error-border: #e0cdd1;
}
```

Enable soft tinted backgrounds with:

```ts
toast.config({ richColors: true });
// or <Toaster richColors />
```

## Demo & Storybook

```bash
npm run build
npm run website:dev      # Astro landing + live demo
npm run storybook        # Component playground
```

## Migrating from 1.x

| 1.x | 2.x |
|-----|-----|
| `showAlert(SUCCESS, msg)` | `toast.success(msg)` |
| `AlertNotifyContainer` | Optional `Toaster` from `/react`, `/vue`, `/svelte` |
| `Style.scss` / `style.min.css` | `alert-notify/style.css` |
| `timeout` | `duration` |
| `isDismissible` | `closeButton` / `dismissible` |

## License

MIT
