# Changelog

## Task 8.0 — Performance Budgets & Guardrails
- Introduced `performance-budgets.json` plus the `build:budgets` gate so Next builds fail when first-load JS exceeds agreed caps.
- Added a webpack manifest plugin and CI job updates that surface per-route gzip sizes alongside Lighthouse budget enforcement.
- Wired `reportWebVitals` into the OTEL pipeline and refreshed testing/docs to explain the new performance guardrails.
