# Repository Guidelines

## Project Structure & Module Organization
This repo is a pnpm workspace monorepo with a Next.js app and shared packages.
- `apps/site/app` — Next.js App Router routes and layouts.
- `apps/site/src/components`, `apps/site/src/lib`, `apps/site/src/utils` — feature components, shared libs, and helpers.
- `apps/site/public` — static assets served by Next.js.
- `packages/ui/src` — shared UI components; design tokens in `packages/ui/tokens.json` and built CSS in `packages/ui/tokens.css`.
- `packages/config` — shared ESLint/Prettier/TS configs.
- `packages/cli` — internal CLI utilities.
- `content/` — MDX notes and authored content.
- `scripts/` — automation (performance, coverage, Playwright, tokens).
- `docs/` and `WBS/` — runbooks and launch scope tracking.

## Build, Test, and Development Commands
Run from the repo root:
- `pnpm install` — install workspace dependencies.
- `pnpm run dev` — start the site via `apps/site`.
- `pnpm build` — build all packages; site build also generates critical CSS via `scripts/performance/generate-critical-css.mjs`.
- `pnpm lint` / `pnpm typecheck` — lint and type-check the site.
- `pnpm test` — run the site Jest coverage gate.
- `pnpm test:a11y` — run UI + site a11y suites.
- `pnpm --filter @portfolio/site playwright:test` — Playwright e2e suite.
- `pnpm --filter @portfolio/site build:budgets` — check performance budgets.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (`.editorconfig`).
- Formatting: Prettier (`pnpm run format`) with print width 90, double quotes, and no trailing commas.
- Linting: ESLint shared config in `packages/config/eslint`; Next.js rules apply in `apps/site`.
- Tests: unit tests use `__tests__/*.test.ts(x)`; Playwright specs live in `apps/site/tests/**/*.spec.ts`; a11y tests live under `tests/a11y` or `__tests__/a11y`.

## Theme & Contrast
High contrast is controlled by the app (not just OS `prefers-contrast`):
- The root element gets a `contrast-high` class and `data-contrast` in `apps/site/app/layout.tsx`.
- Use the normal token-driven classes (`bg-*`, `text-*`, `border-*`) so `contrast-high` can swap CSS variables automatically (see `packages/ui/tokens.css`).
- Avoid Tailwind `contrast-more:` unless you explicitly want to respond to OS `prefers-contrast: more` instead of the app’s toggle.

## Testing Guidelines
Jest is used for unit/integration tests; Playwright covers e2e flows; a11y tests use axe.
- Do not run tests yourself, unless we are fixing a lint or typecheck issue.

## Commit & Pull Request Guidelines
- Do not use `git add` or draft commits.

## Security & Configuration Tips
Create `apps/site/.env.local` for local secrets. Common keys include:
- Chatbot: `OPENROUTER_API_KEY`
- hCaptcha: `HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`
- Observability: `OTEL_EXPORTER_OTLP_ENDPOINT`, `NEXT_PUBLIC_ENABLE_OTEL_BROWSER`
Keep secrets out of git and update `README.md` if new keys are required.
