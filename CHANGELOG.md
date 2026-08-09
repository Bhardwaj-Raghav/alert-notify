# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-09

### Breaking

- Toast calls are message-first. The first argument is the body; optional `title` is the heading.
- `onDismiss` / `onAutoClose` are replaced by `onClose(toast, reason)` with `"Manual"` | `"Auto"`.
- HTML on standard toasts is removed. Use `toast.custom()` (or framework `custom` helpers) for markup.
- Prefer `autoClose: false` for sticky toasts instead of `duration: Infinity`.
- Default toaster `theme` is `"light"` (was `"system"`).

### Changed

- Styles load with the package entry. Explicit `import "alert-notify/style.css"` still works.
- Docs and site cover migration from 1.x / 2.x, framework guides, and the message-first API.
- Consumer-facing JSDoc on the public typed API for editor IntelliSense.
- README trimmed for npm: framework-agnostic positioning, short quick starts, entry points table, deep API/framework detail linked to the docs site.
- `package.json` description leads with framework-agnostic positioning (not React-first).

### Migration

```ts
// 2.x
toast.success("Profile updated", { description: "Your profile was saved." });

// 3.0
toast.success("Your profile was saved.", { title: "Profile updated" });
```

See [Migration](https://alert-notify.vercel.app/docs/migration) for the full upgrade table.

## [2.0.1] - 2026-07-25

### Fixed

- Bug fixes and packaging polish on the 2.x API.

### Changed

- README and site discoverability updates (FAQ, alternatives).

## [2.0.0] - 2026-07-20

### Added

- Imperative `toast` API with `success`, `error`, `warning`, `info`, `loading`, and `message`.
- Optional React, Vue, and Svelte `<Toaster />` wrappers.
- Dark / system theme and `richColors`.
- Stacking, progress, and swipe dismiss.

### Changed

- Rewrite of the 1.x `showAlert` / container model into a modern toaster.

## [1.0.3] - 2024-04-09

### Fixed

- Stabilized the classic `AlertNotifyContainer` flow.

## [1.0.2] - 2024-04-08

### Fixed

- Packaging and alert handling polish on the 1.x line.

## [1.0.1] - 2024-04-08

### Fixed

- Alert timeout handling.

## [1.0.0] - 2024-04-08

### Added

- First 1.x stable with `showAlert` helpers.
- SUCCESS / ERROR style alerts and container mounting.

## [0.1.0] - 2022-07-06

### Added

- Initial public release on npm.

[3.0.0]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v3.0.0
[2.0.1]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v2.0.1
[2.0.0]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v2.0.0
[1.0.3]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v1.0.3
[1.0.2]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v1.0.2
[1.0.1]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v1.0.1
[1.0.0]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v1.0.0
[0.1.0]: https://github.com/Bhardwaj-Raghav/alert-notify/releases/tag/v0.1.0
