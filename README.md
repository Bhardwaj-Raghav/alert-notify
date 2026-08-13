# alert-notify

[![version](https://img.shields.io/npm/v/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![monthly downloads](https://img.shields.io/npm/dm/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![types](https://img.shields.io/npm/types/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![CI](https://github.com/Bhardwaj-Raghav/alert-notify/actions/workflows/ci.yml/badge.svg)](https://github.com/Bhardwaj-Raghav/alert-notify/actions/workflows/ci.yml)
[![docs](https://img.shields.io/badge/docs-website-blue)](https://alert-notify.vercel.app)
[![license](https://img.shields.io/npm/l/alert-notify.svg)](https://github.com/Bhardwaj-Raghav/alert-notify/blob/main/LICENSE)

**Framework-agnostic toast notifications.** One imperative `toast.success()` API for vanilla JS, React, Vue, Svelte, Angular, Astro, and CDN. No root provider required. The portal auto-mounts; optional `<Toaster />` helpers only sync config.

JS gzip by path: **Vanilla ~5.9KB · React ~6.7KB · Vue ~6.5KB · Svelte ~6.8KB**, plus **~2.7KB gzip** CSS. Zero runtime deps.

Docs: [alert-notify.vercel.app](https://alert-notify.vercel.app) · [API](https://alert-notify.vercel.app/docs/api) · [Examples](https://alert-notify.vercel.app/examples) · [Changelog](https://alert-notify.vercel.app/changelog)

## Features

- Same core API everywhere; framework packages are optional helpers
- Auto-mounted portal (no required provider)
- Built-in light / dark / system theme, rich colors, progress bar, swipe dismiss
- Per-toast `position`, `richColors`, `className`, `onOpen`, and `toast.isActive(id)`
- Framework node icons via React / Vue / Svelte entries
- `toast.promise`, actions, custom content, headless subscribe API
- CSS loads with the package entry (`alert-notify/style.css` still works)

## Install

```bash
npm install alert-notify
```

## Quick start

### Vanilla / any framework

```ts
import { toast } from "alert-notify";

toast.success("Your profile was saved.", { title: "Profile updated" });
toast.error("Please try again.");
toast.promise(save(), {
  loading: "Saving…",
  success: "Saved",
  error: (err) => (err instanceof Error ? err.message : "Failed"),
});
```

### Per-toast options

```ts
const id = toast.info("Heads up", {
  position: "bottom-left",
  richColors: true,
  className: "my-custom-toast",
  onOpen: () => console.log("opened"),
});

toast.isActive(id); // true while visible
```

### React

Import `toast` from `alert-notify/react` when passing JSX icons:

```tsx
import { toast, Toaster, custom } from "alert-notify/react";

export function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <button onClick={() => toast.success("Saved")}>Save</button>
      <button
        onClick={() =>
          toast.info("Pay with card", {
            icon: <img src="/card.png" alt="" />,
          })
        }
      >
        Info icon
      </button>
      <button onClick={() => custom(<div>Custom</div>, { autoClose: false })}>
        Custom
      </button>
    </>
  );
}
```

### Vue

```ts
import { toast, Toaster, custom } from "alert-notify/vue";
import { h } from "vue";

toast.info("Pay with card", {
  icon: h("img", { src: "/card.png", alt: "" }),
});
```

### Svelte

```ts
import Toaster from "alert-notify/svelte";
import { toast, custom } from "alert-notify/svelte/toast";
import Icon from "./Icon.svelte";

toast.info("Pay with card", {
  icon: { component: Icon, props: { name: "card" } },
});
```

### CDN

```html
<script src="https://unpkg.com/alert-notify@3/dist/alert-notify.global.js"></script>
<script>
  AlertNotify.toast.success("Hello from CDN");
</script>
```

Vue, Svelte, Angular, and Astro guides: [Docs](https://alert-notify.vercel.app/docs).

## Entry points

| Import | What you get |
|--------|----------------|
| `alert-notify` | Core `toast` API (vanilla, Angular, Astro, anything) |
| `alert-notify/react` | React-aware `toast` (JSX icons), `<Toaster />`, `custom()` |
| `alert-notify/vue` | Vue-aware `toast` (VNode icons), `<Toaster />`, `custom()` |
| `alert-notify/svelte` | Optional `<Toaster />` Svelte component |
| `alert-notify/svelte/toast` | Svelte-aware `toast` + `custom()` for components |
| `alert-notify/style.css` | Styles (also auto-loaded from package entries) |

## Config

```ts
toast.config({
  position: "top-right",
  theme: "system",
  richColors: true,
  duration: 4000,
});
```

`position` and `richColors` on a single toast override these defaults.

Full options, theming, and CSS variables: [Config](https://alert-notify.vercel.app/docs/config) · [Theming](https://alert-notify.vercel.app/docs/theming).

## Migrating to 3.0

Message-first API: first argument is the body; optional `title` is the heading. Prefer `autoClose: false` for sticky toasts. See the [migration guide](https://alert-notify.vercel.app/docs/migration).

```ts
// 2.x
toast.success("Profile updated", { description: "Your profile was saved." });

// 3.0
toast.success("Your profile was saved.", { title: "Profile updated" });
```

## Contributing

See [CONTRIBUTING.md](https://github.com/Bhardwaj-Raghav/alert-notify/blob/main/CONTRIBUTING.md).

## License

MIT
