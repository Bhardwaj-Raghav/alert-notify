# alert-notify

[![version](https://img.shields.io/npm/v/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![monthly downloads](https://img.shields.io/npm/dm/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![bundle size](https://img.shields.io/bundlephobia/minzip/alert-notify)](https://bundlephobia.com/package/alert-notify)
[![types](https://img.shields.io/npm/types/alert-notify.svg)](https://www.npmjs.com/package/alert-notify)
[![CI](https://github.com/Bhardwaj-Raghav/alert-notify/actions/workflows/ci.yml/badge.svg)](https://github.com/Bhardwaj-Raghav/alert-notify/actions/workflows/ci.yml)
[![docs](https://img.shields.io/badge/docs-website-blue)](https://alert-notify.vercel.app)
[![license](https://img.shields.io/npm/l/alert-notify.svg)](https://github.com/Bhardwaj-Raghav/alert-notify/blob/main/LICENSE)

**Framework-agnostic toast notifications.** One imperative `toast.success()` API for vanilla JS, React, Vue, Svelte, Angular, Astro, and CDN. No root provider required. The portal auto-mounts; optional `<Toaster />` helpers only sync config.

JS gzip by path: **Vanilla ~5.3KB · React ~5.6KB · Angular ~5.3KB · Vue ~5.7KB · Svelte ~5.9KB**, plus **~2.7KB gzip** CSS. Zero runtime deps.

Docs: [alert-notify.vercel.app](https://alert-notify.vercel.app) · [API](https://alert-notify.vercel.app/docs/api) · [Examples](https://alert-notify.vercel.app/examples) · [Changelog](https://alert-notify.vercel.app/changelog)

## Features

- Same core API everywhere; framework packages are optional helpers
- Auto-mounted portal (no required provider)
- Built-in light / dark / system theme, rich colors, progress bar, swipe dismiss
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

### React

Optional React components for config props and React-node custom toasts:

```tsx
import { toast } from "alert-notify";
import { Toaster, custom } from "alert-notify/react";

export function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <button onClick={() => toast.success("Saved")}>Save</button>
      <button onClick={() => custom(<div>Custom</div>, { autoClose: false })}>
        Custom
      </button>
    </>
  );
}
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
| `alert-notify/react` | Optional `<Toaster />` + `custom()` for React nodes |
| `alert-notify/vue` | Optional `<Toaster />` + `custom()` for Vue VNodes |
| `alert-notify/svelte` | Optional `<Toaster />` Svelte component |
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
