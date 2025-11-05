# Task 8.2 — Critical CSS & Font Delivery

**Status:** Completed 2025-Nov-05

## Objective
Cut render-blocking CSS and font waterfalls so the portfolio reaches first paint and LCP within the Task 8.0 budgets, inlining the above-the-fold Tailwind output for primary routes, self-hosting typography files, and guaranteeing `font-display` fallbacks keep the UI stable while custom faces load.

## In Scope
- Auditing current CSS payloads and blocking resources during `pnpm --filter @portfolio/site run lhci:collect`, identifying which route segments need inline critical CSS vs. deferred stylesheets.
- Introducing a deterministic critical-CSS pipeline (likely via `critters` or a dedicated `scripts/performance/extract-critical-css.mjs`) that runs during `next build`, targeting home, notes index, resume print, and any other public entry points.
- Migrating typography to self-hosted sources (`next/font/local` or downloaded Google fonts) with preloaded WOFF2 subsets, fallbacks declared in `apps/site/app/layout.tsx`, and token mappings in `packages/ui`.
- Enforcing `font-display: swap`/`optional`, unicode-range subsetting, and preload hints so FOIT/FOUT windows stay under 100 ms on desktop and 200 ms on mobile.
- Documenting how contributors add/update fonts, regenerate critical CSS, and verify the budgets stay green.

## Out of Scope
- Reworking the typographic scale or selecting net-new brand fonts (handled by future design/content efforts).
- Implementing adaptive theming beyond ensuring critical CSS respects existing light/dark/contrast toggles.
- Shipping a third-party font-service integration (Adobe Fonts, etc.); everything remains self-hosted.

## Deliverables
- Updated font loading in `apps/site/app/layout.tsx` (e.g., via `next/font/local`) registering primary sans/mono families, fallbacks, and preload `<link>` tags for WOFF2 subsets.
- A repeatable build step (`scripts/performance/extract-critical-css.mjs` or `critters` hook in `apps/site/next.config.mjs`) that outputs inline critical CSS chunks and defers non-critical Tailwind layers.
- Route fixtures/tests proving the critical CSS covers hero shell, navigation, and fold-level components without flashes (Playwright step or Jest DOM snapshot in `apps/site/tests/perf/critical-css.spec.ts`).
- Updated Tailwind or UI tokens (`packages/ui/src/tokens/typography.ts`, `apps/site/app/globals.css`) reflecting new font variables and fallbacks.
- Documentation in `docs/performance/critical-css-fonts.md` (linked from `docs/testing.md#performance`) describing the workflow, verification commands, and how to regenerate subsets.
- Entry in `COMPLETED_TASKS.md` once shipped, referencing WBS:8.2 and the measured LCP improvement.

## Acceptance Criteria
- Lighthouse (`pnpm --filter @portfolio/site run lhci:collect`) reports no render-blocking CSS warnings; inline CSS keeps critical request count ≤2 before LCP.
- Custom fonts load from `/public/fonts/**` with WOFF2 first, `font-display` set to `swap` or `optional`, and no FOIT longer than 100 ms in WebPageTest filmstrips.
- First paint metrics improve by ≥120 ms on 4G mobile profile compared to the baseline snapshot documented at start of the task.
- `pnpm --filter @portfolio/site run build` succeeds without manual steps; critical CSS generation runs automatically and respects Task 8.0 budgets.
- CI smoke (`pnpm --filter @portfolio/site run lhci:summarize`) includes a check asserting critical CSS payload size stays under 12 KB per route (configurable via the budgets JSON).
- Documentation is discoverable and tells contributors how to add a new font, update subsets, and validate results locally.

## Implementation Plan

1. **Baseline current render pipeline**
   - Capture pre-change metrics using `pnpm --filter @portfolio/site run lhci:collect` and Lighthouse devtools focused on CSS/Font opportunities.
   - Profile network waterfalls for `/`, `/notes`, and `/resume/print` to record FCP/LCP, number of blocking stylesheets, and font request timings.
   - Store findings in an appendix section (new or existing) linked from this doc to quantify improvements later.

2. **Inventory fonts and define self-hosting strategy**
   - Audit `packages/ui` typography tokens and `apps/site/app/globals.css` to determine active font families and fallbacks.
   - Download required font weights/styles as WOFF2 (and WOFF fallback if needed), place under `apps/site/public/fonts/<family>/`.
   - Add a small `scripts/performance/subset-fonts.mjs` helper (using `fonttools`/`subset-font`) to generate unicode subsets (latin, latin-ext, optional) and keep file sizes within budget.
   - Wire `next/font/local` (or `next/font/google` with `display: "swap"` but `preload: false`) in `apps/site/app/layout.tsx`, exporting `--font-sans`/`--font-mono` CSS variables for Tailwind layers.

3. **Inline critical CSS for priority routes**
   - Evaluate `critters` integration vs. a custom extraction script; if using critters, configure it in `apps/site/next.config.mjs` (client build hook) with route-specific include/exclude patterns to respect app-router streaming.
   - Ensure Tailwind’s base/components layers required for the hero, navigation, and above-the-fold content are included; lazy-load route-specific CSS after hydration.
   - Add build-time assertions comparing generated critical CSS byte size and cascade completeness (e.g., via Jest snapshot of the HTML shell or unit tests parsing `.next/server/app/**/index.html`).

4. **Add guards and CI coverage**
   - Extend `performance-budgets.json` with `criticalCss` and `fontPreload` entries per route; update the Task 8.0 scripts to parse and enforce the new metrics.
   - Create automated checks (Playwright or Jest) that mount pages, wait for first paint, and confirm font fallback transitions do not shift layout beyond CLS thresholds.
   - Update CI (`.github/workflows/ci.yml`) to run the new verification script and upload artifacts (e.g., generated critical CSS, font subset report) for debugging.

5. **Document workflow and socialize**
   - Author `docs/performance/critical-css-fonts.md` including baseline metrics, regeneration commands (`pnpm --filter @portfolio/site run build:critical-css` if added), troubleshooting tips, and budget thresholds.
   - Link documentation from `docs/testing.md#performance`, `README.md` performance section, and the Task 8.x index.
   - After validating improvements, update `COMPLETED_TASKS.md` with before/after metrics, linking to relevant PRs and Lighthouse reports.

## Risks & Mitigations
- **Streaming app routes complicate inlining** — Validate critters/app-router compatibility; fallback to route-level static rendering for critical CSS extraction if needed.
- **Font subsetting gaps lead to missing glyphs** — Maintain automated smoke tests rendering multilingual copy; provide a documented process to regenerate subsets when new content appears.
- **CLS introduced by late font swaps** — Measure with Playwright + Layout Shift API; adjust fallback font metrics or switch to `font-display: optional` for specific weights.
- **Build-time overhead from extraction scripts** — Cache subset artifacts and only regenerate when CSS or font files change; expose `SKIP_CRITICAL_CSS=1` escape hatch for local dev if necessary.

## Open Questions (resolved)
- **Do we need separate critical CSS bundles for dark/contrast variants?** — No. The single inline payload already includes `dark:` and `contrast-high` branches without pushing us over budget, so maintaining one manifest keeps the pipeline simple.
- **Should we ship variable fonts instead of static weights?** — Not for now. Discrete Ubuntu weights (400/500/700) keep preload deterministic; revisit variable fonts if we adopt a brand family that provides high-quality variable files.
- **Do we need automated WebPageTest coverage in CI?** — Optional. Lighthouse CI plus manual spot checks are sufficient; queue WebPageTest only when investigating regressions or preparing release notes.
