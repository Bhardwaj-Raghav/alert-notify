# Contributing

Thanks for helping out. Bug reports, docs fixes, and PRs are welcome.

## Setup

Node **18+** (CI uses 22). From the repo root:

```bash
npm ci
npm run build
```

The marketing site lives in `website/` and depends on the built package (`file:..`), so build the library first:

```bash
npm ci --prefix website
```

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run build` | Build library + CSS into `dist/` |
| `npm run dev` | Watch-mode library build |
| `npm test` | Vitest (jsdom) |
| `npm run test:watch` | Vitest watch |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run storybook` | Storybook on port 6006 |
| `npm run website:dev` | Astro site (needs `dist/` first) |
| `npm run website:build` | Production site build |

Before opening a PR, run what CI runs:

```bash
npm run typecheck
npm test
npm run build
npm run build-storybook
npm ci --prefix website
npm run build --prefix website
```

## Layout

- `src/` — core toaster, store, renderer, CSS; thin wrappers under `react/`, `vue/`, `svelte/`
- `tests/` — unit tests
- `stories/` — Storybook
- `website/` — Astro landing page (private; not published to npm)
- `dist/` — build output (gitignored; what npm ships)

Keep the core framework-agnostic. Framework packages should stay thin sync wrappers around `toast` / `createToaster`.

## Pull requests

1. Open an issue first for larger API or behavior changes.
2. Prefer small, focused PRs.
3. Match existing style; don’t reformat unrelated files.
4. Add or update tests when you change behavior.
5. Bundle size matters — avoid new runtime dependencies unless there’s a strong reason.
6. Don’t commit secrets. Use `website/.env.example` as the template for site env vars.

## Issues

Use GitHub Issues for bugs and feature ideas. Include:

- Package version
- Framework (or vanilla)
- Minimal repro if you can

Security-sensitive reports: prefer a private channel or GitHub’s security advisory flow over a public issue.

## License

By contributing, you agree your work is released under the [MIT License](LICENSE).
