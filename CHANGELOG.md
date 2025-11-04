# Changelog

## Task 8.1 — Image Pipeline & Delivery
- Added a shared `<ResponsiveImage>` component and helper presets so hero, content, and inline media automatically use modern formats with tuned `sizes` hints.
- Enabled AVIF/WebP output and remote allowlisting in `next.config.mjs`, updated locale dictionaries to describe hero artwork, and wired the shell layout to render the new media block.
- Routed MDX `<img>` tags through the responsive pipeline, re-enabled the ESLint guardrail against raw `<img>` usage, and documented authoring/QA steps in `docs/media-guidelines.md` and the testing runbook.
- Introduced a unit test for the image helper and captured the task deliverables in `WBS/Task_8.1_Image_Pipeline.md`.
- Deferred OTEL browser instrumentation to a client-side lazy import so Edge builds no longer crash when Playwright boots the home route.
- Reordered the shell layout grid so the hero CTA renders before the sticky nav in DOM order, matching keyboard focus expectations in the accessibility suite.

## Task 8.0 — Performance Budgets & Guardrails
- Introduced `performance-budgets.json` plus the `build:budgets` gate so Next builds fail when first-load JS exceeds agreed caps.
- Added a webpack manifest plugin and CI job updates that surface per-route gzip sizes alongside Lighthouse budget enforcement.
- Wired `reportWebVitals` into the OTEL pipeline and refreshed testing/docs to explain the new performance guardrails.
