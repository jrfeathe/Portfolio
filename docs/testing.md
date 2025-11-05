# Testing Runbook

## Accessibility suite

- **Primary command** — Run `pnpm test:a11y` from the repository root to execute component-level axe checks (`@portfolio/ui`) followed by Playwright axe sweeps for `/en`, `/en?skim=1`, `/en/notes`, and `/en/notes/mdx-pipeline`.
- **Component coverage** — Tests live in `packages/ui/src/__tests__/a11y/` and rely on `jest-axe`. When authoring new primitives, copy an existing spec and ensure `axe` runs against all meaningful variants/states before exporting the component.
- **End-to-end coverage** — Accessibility smoke tests live in `apps/site/tests/a11y/` and can be run in isolation with `pnpm --filter @portfolio/site run playwright:test:a11y`. Set `PLAYWRIGHT_SKIP_BUILD=1` when a fresh Next.js build is not required.
- **Motion, contrast & theme verification** — `apps/site/tests/a11y/accessibility-preferences.spec.ts` validates reduced-motion media queries, forced-color focus styling, and the manual theme/contrast toggles (`pnpm --filter @portfolio/site run playwright:test:a11y -- --grep \"@a11y\"` to run the preference suite). Component-level tests assert focus ring classes and reduced-motion behaviour for `Tooltip`.
- **Failure triage** — Test output attaches `axe` violations that include rule IDs, CSS selectors, and WCAG impacts. Prioritise `critical`/`serious` issues immediately; document any temporary suppressions in `docs/testing.md` along with a tracking issue, and link back to `WBS/Task_7.0_Global_A11y_Checks.md`.
- **Adding suppressions** — Prefer targeted `AxeBuilder` `.exclude()` blocks or inline `data-testid` anchors with comments describing the rationale. Permanent suppressions require sign-off from the accessibility owner.
- **Further reading** — The detailed scope, deliverables, and mitigation plan for accessibility automation are tracked in `WBS/Task_7.0_Global_A11y_Checks.md` and `WBS/Task_7.1_Reduced_Motion_Contrast_Focus.md`. Contrast ratios for all design tokens are catalogued in `docs/contrast-audit.md`.

## Performance budgets

- **Local guardrail** — Run `pnpm --filter @portfolio/site run build:budgets` to execute a production `next build` and enforce the per-route gzip budgets defined in `performance-budgets.json`. Pass `--skip-build` if you already have a fresh `.next` directory.
- **CI coverage** — The `performance-budgets` workflow job runs the bundle budget script on every push/PR and, when a preview URL is available, executes Lighthouse CI against each budgeted route. Failures in either step block merges.
- **Budget files** — Update `performance-budgets.json` when adding routes or adjusting thresholds. The JSON drives both Lighthouse's `budgetsPath` integration and the build-time bundle check. Document rationale for any increases directly in the PR.
- **Lighthouse outputs** — After CI completes, inspect `apps/site/.lhci/report.json` for averaged category scores and the `budgets` section, which reports pass/fail status for LCP, CLS, and resource thresholds per route.
- **Real-user metrics** — Production Core Web Vitals are exported as `web-vital *` traces via the browser OpenTelemetry client. Configure OTLP endpoints (see `README` Observability) to make the spans visible in your collector and to drive alerting.

## Critical CSS & fonts

- **Primary command** — `pnpm --filter @portfolio/site run build` generates the critical CSS manifest after `next build`. The manifest lives at `apps/site/app/critical-css.manifest.json`.
- **Guardrail** — Inline CSS budgets are enforced alongside JS budgets via `pnpm --filter @portfolio/site run build:budgets`; the script reads both the bundle manifest and the critical CSS manifest.
- **Adding routes** — Edit `scripts/performance/generate-critical-css.mjs` to list new paths and Tailwind content globs, then add a matching `criticalCss.inlineKb` entry to `performance-budgets.json`.
- **Locale coverage** — Budgets currently cover `/en`, `/ja`, and `/zh` so every localized home route stays within the 16 KB inline CSS cap.
- **Font updates** — Drop new font files under `apps/site/public/fonts/**`, adjust the `next/font/local` configuration in `app/layout.tsx`, and rerun the build. Keep the workflow documented in `docs/performance/critical-css-fonts.md`.
- **Smoke tests** — `apps/site/src/components/__tests__/CriticalCss.test.tsx` verifies the manifest decodes correctly. Manually spot-check `/en` (light/dark/high-contrast) to ensure no FOIT/CLS on first paint.

## Media pipeline

- **Shared helper** — All imagery should render through `<ResponsiveImage>` (`apps/site/src/components/ResponsiveImage.tsx`). The helper applies consistent quality, object-fit, and responsive `sizes` hints for `hero`, `content`, and `inline` presets.
- **Dictionary-driven hero art** — Hero visuals live in `apps/site/src/utils/dictionaries.ts` under `home.hero.media`. Update the descriptor (src, alt, width/height) and drop assets into `apps/site/public/media/**`.
- **Lint guardrail** — ESLint enforces `@next/next/no-img-element`. If you must bypass optimisation (e.g., RSS feeds), document the exception and add a targeted disable comment.
- **Documentation** — Follow `docs/media-guidelines.md` for authoring guidance, verification steps, and remote image allowlisting.
