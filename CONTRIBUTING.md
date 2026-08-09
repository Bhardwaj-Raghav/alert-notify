# Contributing

Thanks for helping out. Bug reports, docs fixes, and PRs are welcome.

## Setup

Node **18+** (CI uses 22). From the repo root:

```bash
npm ci
npm run build
```

The marketing site lives in `website/` and is driven from the root (`astro --root website`).

Key public routes: `/`, `/examples`, `/docs/*`, `/changelog`, and framework landings (`/react`, `/vue`, `/svelte`, `/angular`, `/cdn`). Docs sidebar and `llms.txt` share `website/src/data/nav.ts`.

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run build` | Build library + CSS into `dist/` |
| `npm run dev` | Vite playground on port 5173 |
| `npm run dev:lib` | Watch-mode library build |
| `npm run website` | Astro site on port 5174 |
| `npm run website:build` | Production site build |
| `npm test` | Vitest (jsdom) |
| `npm run test:watch` | Vitest watch |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook on port 6006 |

Before opening a PR, run what CI runs:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run build-storybook
npm run website:build
```

## Layout

- `src/` — core toaster, store, renderer, CSS; thin wrappers under `react/`, `vue/`, `svelte/`
- `playground/` — Vite sandbox for local package testing
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
