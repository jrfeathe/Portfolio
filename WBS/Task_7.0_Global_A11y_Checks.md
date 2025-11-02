# Task 7.0 — Global Accessibility Checks

## Objective
Ensure the portfolio surfaces high-priority accessibility defects before release by integrating automated axe-core audits, codifying WCAG 2.2 requirements for shared UI primitives, and enforcing accessibility as a blocking quality gate across component, integration, and CI pipelines.

## In Scope
- Instrumenting component-level accessibility assertions (e.g., `jest-axe`, `@testing-library/react`) for all shared UI primitives in `packages/ui`.
- Adding Playwright + axe integration to smoke core site flows (home, notes, skim mode) for runtime regressions.
- Establishing lint rules (`eslint-plugin-jsx-a11y`) and Storybook accessibility toolbar coverage to catch developer mistakes early.
- Surfacing aggregated accessibility results in CI (GitHub Actions job) and failing builds on `serious` or `critical` violations.

## Out of Scope
- Visual redesign work to fix contrast/focus issues (handled in Task 7.1).
- Manual screen reader audits beyond validating essential announcements for this release.
- Vendor procurement for external audits or VPAT documentation.

## Deliverables
- Component-level accessibility test suite under `packages/ui/__tests__/a11y/*.test.tsx` with `jest-axe` assertions for each exported component.
- End-to-end Playwright specs (`apps/site/tests/a11y/*.spec.ts`) that mount critical routes and run axe scans with documented rule suppressions.
- Updated lint configuration enabling `eslint-plugin-jsx-a11y` with repo-specific overrides in `packages/config/eslint/index.js`.
- CI pipeline step (`.github/workflows/ci.yml`) that executes the accessibility suite and publishes annotated reports/artifacts.
- Runbook section in `docs/testing.md` describing how to debug and remediate accessibility violations, including link to WBS:7.0.

## Acceptance Criteria
- `pnpm test:a11y` (or equivalent workspace command) runs component and e2e suites locally without manual setup.
- CI fails when axe reports any `critical` or `serious` violations on covered components/pages.
- All `packages/ui` components expose accessible names, roles, and state transitions verified by automated tests.
- Playwright accessibility suite covers at least the home page, skim mode, engineering note detail, and resume print preview entry points.
- Documentation explains how to add new coverage and justify suppressing specific axe rules.

## Implementation Plan

1. **Audit current accessibility tooling**
   - Inventory existing ESLint configs, component tests, and Playwright specs to identify gaps.
   - Verify `pnpm` scripts and workspace structure support isolated test commands.
   - Capture baseline axe findings against live routes for comparison.

2. **Codify component accessibility tests**
   - Introduce a shared test helper that renders components with `jest-axe` and `@testing-library/react`.
   - Add tests for buttons, navigation shells, accordions, tabs, cards, chips, and form inputs, asserting zero `serious`/`critical` violations.
   - Snapshot expected ARIA attributes/roles where necessary to detect regressions.

3. **Enhance linting and developer tooling**
   - Enable `eslint-plugin-jsx-a11y` rules in the shared config, tuning severity to `error` for must-fix issues.
   - Configure Storybook with the accessibility addon, documenting how to run audits during UI development.
   - Update `README.md` or a dedicated doc with the new lint/test commands.

4. **Implement end-to-end axe sweeps**
   - Add Playwright specs that navigate critical flows, invoke `page.addScriptTag` for axe, and assert no blocking violations.
   - Provide helper utilities for ignoring false positives with inline justification comments.
   - Ensure Playwright specs can run headless in CI and locally via `pnpm test:a11y:e2e`.

5. **Wire CI gates and documentation**
   - Extend `.github/workflows/ci.yml` to run the new accessibility suites and upload results as job artifacts or annotations.
   - Create `docs/testing.md#a11y` section outlining troubleshooting steps and how to interpret reports.
   - Record follow-up tasks for any violations that cannot be resolved immediately, referencing associated issues.

## Risks & Mitigations
- **Flaky axe findings between environments** — Standardize viewport, color scheme, and network mocking in tests; pin axe versions.
- **Developer friction from new lint errors** — Pair rule enablement with clear fixing guidance and autofix scripts.
- **Playwright runtime instability in CI** — Reuse existing CI cache and retry strategy; run a11y specs in parallel job to isolate failures.

## Open Questions
- Should Storybook accessibility checks block merges, or remain advisory until coverage stabilizes?
- Do we need to extend coverage to PDF/print output beyond automated DOM checks?
- Is there an appetite for integrating pa11y or Lighthouse accessibility audits alongside axe?
