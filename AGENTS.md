# AGENTS.md

Spanish (Rioplatense) TCG card-draw probability calculator. Single-page React 19 + TypeScript + Vite + Tailwind CSS v4 app, no router, no chart library.

## Commands
- `npm run dev` — Vite dev server
- `npm run test` — vitest, single run. One file: `npm run test -- src/lib/<file>.test.ts`
- `npm run lint` — oxlint
- `npm run build` — `tsc -b && vite build`; CI runs this on every push to `main`, so it must pass before committing there

## Structure
- `src/lib/` — pure math + helpers, zero DOM access. Invalid inputs return `NaN` (not throw). Colocated `*.test.ts` files. Tests cover only `src/lib/`, not components.
- `src/components/` — React UI. Charts (`DistributionChart`, `CurveChart`) are hand-rolled inline SVG; keep it that way, no chart lib.
- `src/App.tsx` — two modes (`general` | `lairen`) driven by a tab state; the single entry for both screens.

## Toolchain quirks
- `vite.config.ts` imports from `vitest/config` and holds the vitest config (`include: ['src/**/*.test.ts']`). Test config lives here, not in a separate vitest file.
- `base: '/calculadora-TCG/'` in vite.config.ts must match the GitHub Pages subpath.
- Tailwind v4 is configured entirely in `src/index.css` via `@theme` tokens (`felt-*`, `ink-*`, `paper`, `signal-*`). No `tailwind.config.js` — new colors/utilities go in `@theme` there.
- `verbatimModuleSyntax: true` → `import type` is required for type-only imports. `erasableSyntaxOnly` → no TS enums.
- Code style: no semicolons, single quotes, ~2-space indent. All UI copy, error messages, and code comments are in Spanish.

## State & share links
- `usePersistentState` (`src/lib/persist.ts`) persists to localStorage under the `hipergeometria:` prefix.
- Share links encode `ShareableState` as base64url JSON in the URL hash, prefixed `#lairen=` (the prefix is historical and used for the general mode too; keep it).
- `parseState` (`src/lib/share.ts`) is strict and drops the whole state on invalid input. `ShareableState.general` is required; the `lairen` block is optional with defaults. Adding new required fields breaks decoding of old links (silently falls back to defaults) — new state must be optional.

## Design
- `frontend-design` skill applies; the app uses a bespoke dark "felt/ink/signal" theme with custom Tailwind tokens and Google Fonts (Archivo/Fraunces/IBM Plex Mono). Preserve the theme when adding UI; do not default to stock Tailwind styling.

## Deploy
- `.github/workflows/deploy-pages.yml` builds (`npm install && npm run build`, Node 22) and deploys `dist` to GitHub Pages on push to `main`.
