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
| 6.1 | security.txt & GPG key | 2025-Oct-30     | `.well-known/security.txt` now lists disclosure contacts, preferred language, expiry, and the OpenPGP fingerprint; matching `pubkey.asc` serves the armored key. |
| 6.2 | Dependency policy | 2025-Oct-31     | Renovate configured for pnpm workspace, CI enforces lint/build/test on update PRs, dependency triage doc added, and weekly review issue template established. |
| 7.0 | Global accessibility checks | 2025-Nov-01     | `pnpm test:a11y` now runs jest-axe coverage for `@portfolio/ui` primitives and Playwright axe sweeps for key journeys; CI gate and `docs/testing.md` runbook landed. |
| 7.1 | Reduced motion, contrast, focus | 2025-Nov-01     | Focus ring tokens/classes added across UI, reduced-motion + forced-colors CSS guards ship in `app/globals.css`, explicit theme/contrast toggles persist overrides, and `docs/contrast-audit.md` captures WCAG ratios. |
| 8.0 | Performance budgets & guardrails | 2025-Nov-03     | `performance-budgets.json` drives bundle/Lighthouse thresholds, `build:budgets` script gates Next builds, CI adds a dedicated performance job, web vitals emit via OTEL spans, and docs outline remediation workflows. |
| 8.1 | Image pipeline | 2025-Nov-04     | Shared responsive image helper rolls out across hero/MDX content, Next.js emits AVIF/WebP by default, lint/test guardrails prevent raw `<img>` usage, and media authoring guidance documents the workflow. |
| 8.2 | Critical CSS & fonts | 2025-Nov-05     | Inline critical CSS manifest (14.8 KB) generated post-build, `next/font/local` self-hosts Ubuntu/Ubuntu Mono with `swap`, budgets now gate inline CSS alongside JS, smoke tests cover the manifest, and `docs/performance/critical-css-fonts.md` documents the workflow. |
| 9.0 | Schema & resume JSON-LD | 2025-Nov-06     | Resume transformer feeds JSON-LD builders, `<StructuredData>` renders CSP-safe payloads on home/notes routes, docs/tests added (`docs/seo/structured-data.md`, `pnpm --filter @portfolio/site test structured-data`, Playwright spec). |
| 9.1 | Resume JSON & PDF downloads | 2025-Nov-06     | Sanitized resume contract now powers `/resume.json`, manual PDFs live in `public/`, hero/footer CTAs link to the downloads, Playwright/Jest coverage validates responses, and `docs/resume/publishing.md` documents the workflow. |
| 10a.0 | Personalization brief | 2025-Nov-10     | `docs/personalization/brief.md` published with audit, tonal pillars, module priorities, asset plan, and sign-off; `docs/content-style-guide.md` + `docs/personalization/reference/README.md` satisfy remaining deliverables. |

Update this log as additional WBS items reach completion.
