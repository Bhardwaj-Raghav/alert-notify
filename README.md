# alert-notify

[![npm](https://img.shields.io/npm/v/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)

**Toast notifications for React, Vue, Svelte, Angular, Astro, and plain HTML.** Same imperative `toast.success()` API everywhere. JS gzip by path: **Vanilla ~5.3KB · React ~5.6KB · Angular ~5.3KB · Vue ~5.7KB · Svelte ~5.9KB**, plus **~2.7KB gzip** CSS, zero runtime deps. An alternative to react-toastify, react-hot-toast, Sonner, react-alert, and other toast / snackbar libraries when you do not want a React-only stack.

No root provider required. The portal auto-mounts. Optional `<Toaster />` wrappers only sync config props. Styles load with the package entry (or import `alert-notify/style.css` yourself).

```ts
import { toast } from "alert-notify";

toast.success("Saved");
```

## Why this package

| | alert-notify | react-hot-toast | Sonner | react-toastify |
|--|--|--|--|--|
| Frameworks | **React, Vue, Svelte, Angular, vanilla, CDN** | React | React | React |
| Provider / `<Toaster />` | **Optional** (auto-mounts) | Required | Required | Required |
| Dark / system theme | **Built-in** | DIY | Built-in | DIY / limited |
| Rich colors | **Built-in** | DIY | Built-in | Limited |
| Approx. gzip | Vanilla/Angular ~5.3KB · React ~5.6KB · Vue ~5.7KB · Svelte ~5.9KB + ~2.7KB CSS | ~4–5KB (CSS inlined) | ~9–12KB | ~40KB+ |
| Runtime deps | **0** | 0 | 0 | 0 |

**vs react-hot-toast** — similar size band, but you are not stuck in React, and dark/system theme, richColors, progress bar, and swipe dismiss ship built-in instead of DIY styles.

**vs Sonner** — same polished stacking / rich-color feel in a smaller package, still no React lock-in, and the portal works without a required root toaster.

**vs react-toastify** — same success / error / promise / action flows at a fraction of the weight, with a simpler API and multi-framework support.

**vs react-alert / notistack / snackbars** — one small package for alerts, notifications, and snackbar-style toasts across frameworks.

Sizes are minified + gzip (typical CDN transfer). We measure each *single* path (core + one adapter): Vanilla ~5.3KB, React ~5.6KB, Angular ~5.3KB (recipe = core), Vue ~5.7KB, Svelte ~5.9KB. Not every framework summed. Some libs inline CSS into one number; ours ships CSS as a separate file (~2.7KB gzip).

Website: [alert-notify.vercel.app](https://alert-notify.vercel.app) · [Docs](https://alert-notify.vercel.app/docs) · [Examples](https://alert-notify.vercel.app/examples) · [Changelog](https://alert-notify.vercel.app/changelog)

## Install

```bash
npm install alert-notify
```

## Quick start (vanilla / any framework)

```ts
import { toast } from "alert-notify";

toast.success("Your profile was saved.", { title: "Profile updated" });
toast.error("Please try again.", { title: "Something went wrong" });
toast.promise(save(), {
  loading: "Saving…",
  success: "Saved",
  error: (err) => (err instanceof Error ? err.message : "Failed"),
});
```

`title` is an optional heading (title styling). The first argument is `message` (former description styling). Both remain strings on the standard API.

## Framework guides

### React

Optional `<Toaster />` near the root to pass config as props. The React entry is a Client Component (`"use client"`), so Next.js App Router can import it from a Server Component parent without an extra directive on your side.

```tsx
import { toast } from "alert-notify";
import { Toaster, custom } from "alert-notify/react";

export function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <button onClick={() => toast.success("Saved")}>Save</button>
      <button
        onClick={() =>
          custom(<div>Custom React content</div>, { autoClose: false })
        }
      >
        Custom
      </button>
    </>
  );
}
```

### Vue 3

```vue
<script setup>
import { toast } from "alert-notify";
import { Toaster, custom } from "alert-notify/vue";
import { h } from "vue";
</script>

<template>
  <Toaster position="top-right" :rich-colors="true" />
  <button @click="toast.success('Saved')">Save</button>
  <button @click="custom(h('div', 'Custom Vue content'))">Custom</button>
</template>
```

### Svelte

```svelte
<script>
  import { toast } from "alert-notify";
  import Toaster from "alert-notify/svelte";
</script>

<Toaster position="top-right" richColors />
<button onclick={() => toast.success("Saved")}>Save</button>
```

Custom DOM content via the core API:

```ts
import { toast } from "alert-notify";
const el = document.createElement("div");
el.textContent = "Custom";
toast.custom(el);
```

### Angular

```ts
import { toast } from "alert-notify";

toast.config({ position: "top-right", richColors: true });
toast.success("Saved");
```

### Astro

Use a client script or island; same imperative API.

```astro
<script>
  import { toast } from "alert-notify";
  toast.success("Saved");
</script>
```

### CDN / vanilla HTML

The CDN build injects CSS automatically. Linking `style.css` remains safe if you already do.

```html
<script src="https://unpkg.com/alert-notify@3/dist/alert-notify.global.js"></script>
<script>
  AlertNotify.toast.success("Hello from CDN");
</script>
```

## API

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `toast(message, options?)` | `ToastId` | Generic toast (`message` type) |
| `toast.success / error / warning / info / loading / message` | `ToastId` | Typed helpers |
| `toast.custom(content, options?)` | `ToastId` | Custom string HTML or `HTMLElement` body |
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
| `title` | `string` | — | Optional heading (title styling) |
| `duration` | `number` | from config | Auto-close ms when `autoClose` is true |
| `autoClose` | `boolean` | `true` (`false` for loading) | Whether the toast auto-dismisses |
| `icon` | `string \| HTMLElement \| false` | built-in SVG | Custom icon, or `false` to hide. String values are raw HTML (trusted markup only) |
| `action` | `{ label, onClick }` | — | Primary action (e.g. Undo) |
| `cancel` | `{ label, onClick }` | — | Secondary action |
| `closeButton` | `boolean` | from config (`true`) | Show × button |
| `dismissible` | `boolean` | from config (`true`) | Allow swipe / close |
| `important` | `boolean` | `false` | Jump to front of queue |
| `className` | `string` | — | Extra class on toast |
| `style` | `object` | — | Inline styles |
| `onClose` | `(toast, reason) => void` | — | Fired once on close; `reason` is `"Manual"` or `"Auto"` |

```ts
toast.success("You can restore it.", {
  id: "delete-item",
  title: "Deleted",
  duration: 5000,
  icon: false,
  closeButton: true,
  important: true,
  action: { label: "Undo", onClick: () => restore() },
  onClose: (t, reason) => console.log(t.id, reason),
});
```

Persistent toast (recommended):

```ts
toast.success("Pinned", { autoClose: false });
```

### Custom toasts

```ts
// Trusted HTML string
toast.custom("<strong>Hello</strong>", { autoClose: false });

// DOM node
const node = document.createElement("div");
node.textContent = "Hello";
toast.custom(node);

// React / Vue helpers mount framework content into a node for you
import { custom } from "alert-notify/react";
custom(<ProfileCard />, { autoClose: false });
```

Standard `title` / message helpers stay string-only. Markup and components belong in `toast.custom()` (or the framework `custom` helpers).

### Global config defaults

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `position` | `ToastPosition` | `"top-right"` | 6 corners + top/bottom center |
| `theme` | `"light" \| "dark" \| "system"` | `"light"` | Color scheme |
| `duration` | `number` | `4000` | Default auto-close ms when `autoClose` is true |
| `autoClose` | `boolean` | `true` | Default automatic dismissal |
| `closeButton` | `boolean` | `true` | Show close by default |
| `dismissible` | `boolean` | `true` | Allow dismiss by default |
| `richColors` | `boolean` | `false` | Soft tinted type surfaces |
| `visibleToasts` | `number` | `3` | Max visible in stack |
| `expand` | `boolean` | `false` | Always expand (else hover) |
| `gap` | `number` | `12` | Expanded gap (px) |
| `offset` | `number \| string` | `16` | Edge offset |
| `dir` | `"ltr" \| "rtl" \| "auto"` | `"auto"` | Direction |
| `pauseOnHover` | `boolean` | `true` | Pause the auto-close timer while hovered |
| `resetTimerOnHover` | `boolean` | `false` | Reset timer and progress together on hover |
| `pauseOnWindowBlur` | `boolean` | `true` | Pause on blur |
| `progressBar` | `boolean` | `true` | Duration bar (only when auto-closing) |
| `toasterClassName` | `string` | — | Class on toaster |
| `style` | `object` | — | Styles on toaster |

```ts
toast.config({
  position: "top-right",
  theme: "light",
  duration: 4000,
  autoClose: true,
  richColors: true,
  visibleToasts: 3,
  expand: false,
  progressBar: true,
  pauseOnHover: true,
  resetTimerOnHover: false,
});
```

`pauseOnHover` freezes the timer/progress. `resetTimerOnHover` restarts both together. They do not replace each other.

`autoClose` decides whether a toast auto-dismisses. `duration` only matters when `autoClose` is true. Prefer `autoClose: false` for sticky toasts instead of `duration: Infinity`.

## Dark mode

```ts
// Default
toast.config({ theme: "light" });

// Follow OS / html.dark / data-theme
toast.config({ theme: "system" });

// Force dark
toast.config({ theme: "dark" });
```

With `theme: "system"` the toaster also tracks:

- `prefers-color-scheme`
- `html.dark` / `html.light` (Tailwind-style)
- `html[data-theme="dark"]` / `html[data-theme="light"]`

```tsx
<html className={dark ? "dark" : ""}>
  <Toaster theme="system" richColors />
</html>
```

## Theming with CSS variables

All colors are CSS variables on `.an-toaster`. Override them in your own stylesheet (after the automatic package CSS, or after an explicit `alert-notify/style.css` import).

```css
/* your-app.css */
.an-toaster {
  /* Surfaces */
  --an-bg: #ffffff;
  --an-fg: #0f172a;
  --an-muted: #475569;
  --an-border: rgba(15, 23, 42, 0.1);
  --an-shadow: 0 10px 24px -8px rgba(15, 23, 42, 0.14);
  --an-radius: 14px;

  /* Accent + rich text (icons, titles, messages) */
  --an-success: #15803d;
  --an-error: #e11d48;
  --an-warning: #b45309;
  --an-info: #1d4ed8;
  --an-loading: #64748b;
  --an-progress: rgba(15, 23, 42, 0.16);

  /* Rich toast foreground */
  --an-success-fg: #14532d;
  --an-error-fg: #9f1239;
  --an-warning-fg: #92400e;
  --an-info-fg: #1e40af;

  /* Rich fills (used when richColors: true) */
  --an-success-bg: #ecfdf5;
  --an-success-border: #a7f3d0;
  --an-error-bg: #fff1f2;
  --an-error-border: #fecdd3;
  --an-warning-bg: #fffbeb;
  --an-warning-border: #fde68a;
  --an-info-bg: #eff6ff;
  --an-info-border: #bfdbfe;
}
```

Enable soft tinted backgrounds with:

```ts
toast.config({ richColors: true });
// or <Toaster richColors />
```

## Migrating from 2.x to 3.0

| 2.x | 3.0 |
|-----|-----|
| First arg = title | First arg = `message` |
| `description` | Use optional `title` for the heading; first arg is the body |
| `onDismiss` / `onAutoClose` | `onClose(toast, reason)` with `"Manual"` \| `"Auto"` |
| `html` on standard toasts | `toast.custom(...)` only |
| `duration: Infinity` for sticky | Prefer `autoClose: false` |
| Default `theme: "system"` | Default `theme: "light"` |
| Manual `import "alert-notify/style.css"` required | Auto-included from package entry (explicit import still OK) |

Example:

```ts
// 2.x
toast.success("Profile updated", { description: "Your profile was saved." });

// 3.0
toast.success("Your profile was saved.", { title: "Profile updated" });
```

## Migrating from 1.x

| 1.x | 3.x |
|-----|-----|
| `showAlert(SUCCESS, msg)` | `toast.success(msg)` |
| `AlertNotifyContainer` | Optional `Toaster` from `/react`, `/vue`, `/svelte` |
| `Style.scss` / `style.min.css` | Auto CSS, or `alert-notify/style.css` |
| `timeout` | `duration` (+ `autoClose`) |
| `isDismissible` | `closeButton` / `dismissible` |

## License

MIT
