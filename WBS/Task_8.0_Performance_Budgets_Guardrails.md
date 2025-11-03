# Task 8.0 - Performance Budgets & Guardrails

## Objective
Lock in fast default experiences for the portfolio by codifying JavaScript transfer limits (<120 KB), Largest Contentful Paint (<1.5 s), and Cumulative Layout Shift (<0.1) budgets, wiring those thresholds into build tooling, Lighthouse CI, and observability so regressions fail quickly and remain visible to the team.

## In Scope
- Defining a shared `performance-budgets.json` that captures page-level byte, metric, and timing thresholds aligned with WBS:8.0.
- Extending the existing Lighthouse CI pipeline (`scripts/lighthouse/*.cjs`, `.lighthouserc.json`) to read the new budgets file and fail when budgets are exceeded.
- Adding static bundle analysis checks that parse `next build` output for `firstLoadJs` per route and enforce the 120 KB transfer cap.
- Surfacing real-user web vitals (LCP, FID/INP, CLS) via `apps/site/instrumentation.ts` + OpenTelemetry exporters so production deviations are alertable.
- Documenting how to run, interpret, and update budgets (docs/testing.md, README snippets) and how to file follow-up work when budgets must change.

## Out of Scope
- Re-architecting features/pages to reduce payloads beyond necessary quick wins; those become follow-on epics.
- Introducing third-party RUM vendors beyond the existing OpenTelemetry stack.
- Mobile-specific Lighthouse profiles (can be tackled once desktop budgets are stable).

## Deliverables
- `performance-budgets.json` at the repo root describing byte budgets (`resourceSizes`), performance metrics (`timings`, `metrics`), and CLS/LCP thresholds for `/`, `/notes`, `/resume/print`, and any other published routes.
- Updated `.lighthouserc.json` that loads the budgets file (via `ci.collect.budgetsPath`) and enforces `assert` rules mapping LCP/CLS to error severities.
- New script `scripts/performance/check-build-budgets.cjs` (invoked by `pnpm --filter @portfolio/site run build:budgets`) which:
  - Runs `NEXT_TELEMETRY_DISABLED=1 pnpm exec next build --no-lint`.
  - Parses `.next/analyze/__loadedPages__.json` or `next build` JSON output to capture `firstLoadJs` values.
  - Fails with exit code !=0 when any route exceeds 120 KB (configurable via `performance-budgets.json`).
- CI workflow updates (`.github/workflows/ci.yml`) adding a dedicated `performance-budgets` job that runs the build check and Lighthouse collect/summarize steps against the deployed preview URL; job blocks merges when budgets break.
- Documentation updates:
  - `docs/testing.md#performance-budgets` covering local commands, CI behavior, and remediation steps.
  - Runbook snippet linking the budgets to RISK_LOG mitigations and explaining how to request temporary budget exceptions.

## Acceptance Criteria
- `pnpm --filter @portfolio/site run build:budgets` fails locally and in CI if any route's `firstLoadJs` exceeds 120 KB (gzip) or newly defined limits in `performance-budgets.json`.
- Lighthouse CI autoruns fail when the average LCP across three runs is >=1.5 s or when CLS >=0.1; the summary artifact clearly lists offending routes/metrics.
- Production OpenTelemetry dashboards expose 7-day percentiles (p75) for LCP and CLS and alert when thresholds are breached for two consecutive deploys.
- Documentation is linked from `README.md` (performance section) and `SUCCESS_METRICS.md` so engineers know how to measure and remediate regressions.

## Implementation Plan

1. **Baseline current performance**
   - Run `pnpm --filter @portfolio/site run lhci:collect <preview-url>` against the latest preview to capture LCP/CLS baselines.
   - Extract `firstLoadJs` per route via `next build --debug` or `@next/bundle-analyzer` to understand current payload sizes.
   - Record findings in an appendix section within this doc (or `docs/testing.md`) as a reference point.

2. **Define the budgets file**
   - Create `performance-budgets.json` capturing:
     - Global resource budgets (total JS, total CSS, image budgets).
     - Per-route `timings` for LCP / FCP targets (<=1500 ms for LCP).
     - `metrics` for CLS <=0.1 and INP <=200 ms (optional stretch target).
   - Version the file with comments in `docs/testing.md` explaining how to adjust thresholds and when stakeholder approval is required.

3. **Wire budgets into Lighthouse CI**
   - Update `.lighthouserc.json` to reference the budgets file and ensure `collect.settings` includes a mobile preset variant if needed.
   - Extend `scripts/lighthouse/summarize.cjs` to read `performance-budgets.json` and include pass/fail status per budget in the generated report.
   - Add human-readable output (tables) describing which budgets were violated and by how much.

4. **Add build-time JS transfer guardrail**
   - Implement `scripts/performance/check-build-budgets.cjs` to parse Next.js build artifacts (prefer `analyzeSourceReplacements.json` or `trace` files when available).
   - Allow overrides via CLI flags/environment variables (e.g., `--route=/notes --budget=140`) for temporary adjustments logged in CI.
   - Expose a new workspace script (`"build:budgets": "node ../../scripts/performance/check-build-budgets.cjs"`) in `apps/site/package.json`, and document it in `README.md`.

5. **Hook into CI**
   - Modify `.github/workflows/ci.yml`:
     - Add caching for `.lhci` output to reuse between collect and summarize steps.
     - Run the build budgets script before Lighthouse; fail fast on JS payload regressions.
     - Upload Lighthouse reports (`apps/site/.lhci/report.json`) as artifacts and post summary comments on PRs via GitHub Action.
   - Ensure the job runs for preview branches only when a `PREVIEW_URL` is available (skip gracefully otherwise).

6. **Instrument production vitals**
   - Extend `apps/site/src/app/layout.tsx` (or appropriate entry point) to consume Next.js `reportWebVitals`, translating metrics into OpenTelemetry spans/metrics exported via existing collectors.
   - Create dashboards/alerts (Grafana/Datadog or OTLP-compatible) documenting where to view p75 LCP/CLS and linking to this task's runbook.
   - Update `RISK_LOG.md` to reference the new alert path for performance regressions.

7. **Document and socialize**
   - Update `docs/testing.md` with a dedicated performance section, including step-by-step instructions, expected outputs, and troubleshooting tips for budget failures.
   - Add a short `README` badge or note pointing to the latest Lighthouse averages from `.lhci/badge.json`.
   - Host a brown-bag or Loom video summarizing the workflow; add the link to `SUCCESS_METRICS.md` and `COMPLETED_TASKS.md` when task is done.

## Risks & Mitigations
- **Flaky Lighthouse scores in CI** - Run three iterations with warm cache, pin Chrome version, and fall back to p75 percentile scoring; allow a +/-5% tolerance before marking failures.
- **False positives from JS bundle parsing** - Use official Next.js trace files instead of CLI stdout; add unit tests around the parser with fixture outputs.
- **Budget creep pressure** - Require product/engineering lead approval for any budget increase; track changes in git history and annotate `performance-budgets.json`.
- **Telemetry noise** - Filter bots and staging traffic from OpenTelemetry metrics to avoid skewed percentiles; sample only authenticated sessions if necessary.

## Open Questions
- Do we need separate budget profiles for mobile vs desktop, or is desktop the authoritative gating profile for this release?
- Should we fail CI on INP/TTI regressions as well, or watch them in observability dashboards first?
- Where should long-term performance dashboards live (e.g., Grafana vs Looker) and who owns on-call response when alerts fire?
