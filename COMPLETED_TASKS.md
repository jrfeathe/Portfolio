# Completed WBS Tasks

| ID | Task | Completion Date | Notes                                                                                                 |
| --- | --- |-----------------|-------------------------------------------------------------------------------------------------------|
| 0.0 | Project charter & scope | 2025-Oct-22     | `CHARTER.md`, `SUCCESS_METRICS.md`, and `RISK_LOG.md` committed; acceptance criteria satisfied.       |
| 0.1 | Monorepo scaffolding | 2025-Oct-22     | Next.js app, shared packages, and workspace tooling scaffolded.                                       |
| 0.2 | Branch protections & CODEOWNERS | 2025-Oct-22     | Branch protection rules enabled; `CODEOWNERS` and PR template configured.                             |
| 0.3 | Issue templates & labels | 2025-Oct-22     | Issue forms added for feature/bug/tech debt; WBS-aware label sync script documented.                  |
| 1.0 | One-line promise | 2025-Oct-23     | Hero promise captured in `market-facing/positioning.md` with rationale aligned to recruiter outcomes. |
| 2.0 | Typography & tokens | 2025-Oct-24     | Unified design tokens for light/dark/print themes wired into Tailwind config and UI usage.             |
| 2.1 | Core components | 2025-Oct-26     | `@portfolio/ui` now exports accessible Buttons, Chips, Cards, Badges, Tooltips, Tabs, Accordions, and StatTiles with Storybook stories. |
| 2.2 | Page shells | 2025-Oct-26     | Responsive shell layout, anchor navigation, breadcrumbs, sticky CTA, and footer integrated into `apps/site`. |
| 2.3 | Print styles | 2025-Oct-26     | Dedicated print stylesheet ensures two-page recruiter skim export with anchor nav/sidebar stripped for clean output. |
| 3.0 | Next.js + TS app init | 2025-Oct-26     | Edge runtime enabled on the home route, strict TS config applied, and client-only UI primitives annotated so `pnpm dev/build` succeed. |
| 3.1 | Routing & i18n | 2025-Oct-27     | App router now served under `/[locale]`, static dictionaries provide EN/JA/ZH copy, middleware normalizes locale paths, and UI switcher toggles languages. |
| 3.2 | MDX pipeline | 2025-Oct-27     | Notes parse via `compileMDX` with remark/rehype plugins, shared MDX components, TOC helpers, and `/[locale]/notes` index + detail routes wired. |
| 3.3 | Mermaid/PlantUML support | 2025-Oct-27     | `<Diagram>` renders Mermaid locally, PlantUML diagrams proxy through `/api/plantuml` with sanitization, and MDX fences auto-map to the new components. |
| 4.0 | GitHub Actions pipeline | 2025-Oct-27     | `.github/workflows/ci.yml` now drives typecheck → Jest → Playwright → Lighthouse with concurrency guard and artifact uploads. |
| 4.1 | Lighthouse CI integration | 2025-Oct-28     | `.lighthouserc.json` + lighthouse scripts run preview LHCI, enforce ≥0.9 scores, upload JSON & badge outputs from CI. |
| 4.2 | Playwright e2e tests | 2025-Oct-28     | `playwright.config.ts` + scenario specs cover skim toggle, notes rendering, PlantUML proxy; trade-off suite marked fixme until UI lands. |
| 4.3 | Coverage & quality gates | 2025-Oct-28     | Jest now enforces ≥90% lines/functions/statements (80% branches) with a coverage gate script; CodeQL workflow scans TS during CI. |
| 5.0 | OpenTelemetry wiring | 2025-Oct-29     | Node, edge, and fetch instrumentation now emit OTLP traces to Honeycomb when env vars are set; Honeycomb board tracks `portfolio-site` spans. |
| 6.0 | Strict CSP & headers | 2025-Oct-30     | Edge middleware applies nonce-based CSP + security headers; layout/components propagate per-request nonces so production stays inline-safe. |

Update this log as additional WBS items reach completion.
