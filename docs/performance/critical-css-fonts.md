# Critical CSS & Font Delivery

Inline critical CSS and self-hosted font subsets keep the portfolio inside Task 8.0 budgets while preventing flashes of invisible text.

## Current state

- Inline payload: **20.1 KB** shared across locales (English/Japanese/Chinese — Simplified), covering the home header, hero shell, CTA buttons, and top-level navigation.
- Manifest: `apps/site/app/critical-css.manifest.json` stores one shared base64 CSS blob plus metadata (`bytes`, `kilobytes`).
- Fonts: `Ubuntu` (weights 400/500/700) and `Ubuntu Mono` (400/700) live under `apps/site/public/fonts/**` and are registered via `next/font/local` with `font-display: swap`.
- Budgets: `performance-budgets.json` caps inline CSS at **20.5 KB** via the build guardrail (`pnpm --filter @portfolio/site run build:budgets`).

## Regenerating critical CSS

1. Update React/Tailwind markup affecting above-the-fold UI (hero, shell header, toggles, CTA).
2. Run `pnpm --filter @portfolio/site run build` — this executes `next build` followed by `scripts/performance/generate-critical-css.mjs`.
3. The script compiles Tailwind with a focused content allowlist (`Shell` components, toggles, hero) and rewrites:
   - `apps/site/app/critical.css` – minified debug artifact.
   - `apps/site/app/critical-css.manifest.json` – serialized CSS (base64) and size metrics.
4. Review manifest diff; ensure `kilobytes` stays under 16.0. If it increases, capture rationale in the PR and update budgets only with approval.
5. Jest offers a smoke test (`CriticalCss.test.tsx`) verifying the manifest decodes and renders into a `<style>` tag.

### Adding another route

- Extend `CRITICAL_ROUTES` inside `scripts/performance/generate-critical-css.mjs` with a new entry (unique `id`, `path`, and `contentGlobs`).
- Provide a dedicated Tailwind content allowlist so the generated CSS is scoped to the critical fold of that page.
- Update `performance-budgets.json` with an inline CSS budget for the new path.

## Font workflow

- Source files: `Ubuntu` and `Ubuntu Mono` TTFs are copied from the system font set into `apps/site/public/fonts/`.
- Registration: `app/layout.tsx` uses `next/font/local`, exposing CSS variables (`--font-sans`, `--font-mono`) that Tailwind consumes via `font-sans`/`font-mono`.
- Preload & fallback: `display: "swap"` ensures FOUT < 100 ms; fallback stacks use system sans/mono families for deterministic metrics.

### Replacing fonts

1. Drop new `.woff2`/`.ttf` assets into `apps/site/public/fonts/<family>/`.
2. Update the `src` array in `app/layout.tsx` (or a dedicated font module) with the new paths, weights, and styles.
3. Refresh typography tokens in `packages/ui/tokens.json` so design docs reflect the active families.
4. Re-run `pnpm --filter @portfolio/site run build` to rebuild critical CSS (font stacks affect fallback measurements).
5. Capture before/after filmstrips (Lighthouse/WebPageTest) for `/en` to confirm FOIT/FOUT windows remain under thresholds.

## Verification checklist

- `pnpm --filter @portfolio/site run build:budgets` passes (bundle + inline CSS budgets).
- `pnpm --filter @portfolio/site run test` includes `CriticalCss` coverage.
- Manual smoke: load `/en` (light/dark/high-contrast) and confirm hero renders with Ubuntu fallback immediately, no CLS when fonts hydrate.
- Document any budget adjustments and link to the relevant WBS deliverable (`Task_8.2_Critical_CSS_Fonts.md`).
