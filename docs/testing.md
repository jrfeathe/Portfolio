# Testing Runbook

## Accessibility suite

- **Primary command** — Run `pnpm test:a11y` from the repository root to execute component-level axe checks (`@portfolio/ui`) followed by Playwright axe sweeps for `/en`, `/en?skim=1`, `/en/notes`, and `/en/notes/mdx-pipeline`.
- **Component coverage** — Tests live in `packages/ui/src/__tests__/a11y/` and rely on `jest-axe`. When authoring new primitives, copy an existing spec and ensure `axe` runs against all meaningful variants/states before exporting the component.
- **End-to-end coverage** — Accessibility smoke tests live in `apps/site/tests/a11y/` and can be run in isolation with `pnpm --filter @portfolio/site run playwright:test:a11y`. Set `PLAYWRIGHT_SKIP_BUILD=1` when a fresh Next.js build is not required.
- **Failure triage** — Test output attaches `axe` violations that include rule IDs, CSS selectors, and WCAG impacts. Prioritise `critical`/`serious` issues immediately; document any temporary suppressions in `docs/testing.md` along with a tracking issue, and link back to `WBS/Task_7.0_Global_A11y_Checks.md`.
- **Adding suppressions** — Prefer targeted `AxeBuilder` `.exclude()` blocks or inline `data-testid` anchors with comments describing the rationale. Permanent suppressions require sign-off from the accessibility owner.
- **Further reading** — The detailed scope, deliverables, and mitigation plan for accessibility automation are tracked in `WBS/Task_7.0_Global_A11y_Checks.md`.
