# Task 7.1 — Reduced Motion, Contrast, Focus

## Objective
Guarantee the portfolio honors user accessibility settings for motion, contrast, and focus visibility by enforcing design tokens, interaction patterns, and regression tooling that deliver inclusive defaults across light/dark themes, print surfaces, and interactive flows.

## In Scope
- Respecting `prefers-reduced-motion`, `prefers-contrast`, and `forced-colors` media queries through Tailwind tokens, CSS overrides, and animation utilities.
- Ensuring all interactive elements (links, buttons, cards, navigation, chips, etc.) expose highly visible focus rings and hover/active states that meet WCAG 2.2 contrast guidelines.
- Providing alternate animation sequences (fade/opacity) or disabling non-essential motion such as parallax, skeleton shimmer, or auto-playing transitions when reduced motion is requested.
- Validating contrast ratios for core tokens (text, background, borders, status colors) across light/dark themes and print styles, with documentation of testing approach.
- Adding automated checks (e.g., Storybook a11y/interaction stories, unit tests for CSS utility functions) to prevent regressions.

## Out of Scope
- Large-scale visual redesign or new component creation beyond adjustments needed to satisfy motion/contrast/focus requirements.
- Implementing full high-contrast color palettes beyond the adjustments required to meet WCAG AA ratios for existing tokens.
- Screen reader copywriting or ARIA work (covered under other accessibility tasks).

## Deliverables
- Updated design tokens or Tailwind utilities that expose reduced-motion and high-contrast variants (`packages/ui/tokens.json`, Tailwind config, or dedicated CSS modules).
- A documented focus outline system applied to all `@portfolio/ui` components, including unit snapshots or visual regression references demonstrating compliance.
- CSS/JS guardrails honoring `prefers-reduced-motion` for global transitions, component-level animations, and Next.js route transitions, along with tests verifying no unintended motion persists.
- Contrast audit matrix (Google Sheets or `docs/contrast-audit.md`) recording measured ratios for key foreground/background pairings in light, dark, and print themes.
- Storybook stories (if available) or Jest DOM tests that assert focus visibility, motion toggles, and forced-colors compatibility for representative components.
- Runbook updates (`docs/testing.md` or new doc) describing how to validate reduced-motion/contrast/focus before shipping.

## Acceptance Criteria
- Users with `prefers-reduced-motion: reduce` experience no non-essential motion; essential animations (e.g., tooltips) degrade to fades and pass manual validation.
- All focusable elements maintain at least a 3:1 contrast outline against adjacent colors in both light and dark modes.
- Primary text/background combinations across the site meet or exceed WCAG 2.2 AA (4.5:1) contrast requirements; status colors (danger, success, info) meet 3:1 for large text and icons.
- Automated tests (unit/Storybook/Playwright) fail when focus styles regress or motion preferences are ignored.
- Documentation lists required manual checks and links to the contrast matrix plus design token references.

## Implementation Plan

1. **Audit current tokens and components**
   - Inventory current color tokens and focus states in `packages/ui`.
   - Capture existing animations (CSS transitions, keyframes, utility classes) in the site and UI packages.
   - Run contrast checks with tools like Polypane, Stark, or axe on representative pages.

2. **Codify reduced-motion behavior**
   - Introduce shared CSS utilities or Tailwind variants that wrap animations in `@media (prefers-reduced-motion: reduce)`.
   - Replace non-essential motion with opacity fades or disable them entirely; ensure fallback states render instantly.
   - Update client scripts (e.g., route transitions) to respect motion settings without layout thrash.

3. **Enhance contrast tokens**
   - Adjust token values or surface-specific overrides to meet contrast targets for text, borders, and status colors.
   - Regenerate Tailwind theme or CSS variables and validate in both light/dark contexts.
   - Document measured ratios in the contrast matrix with tooling references and thresholds.

4. **Standardize focus styles**
   - Create a shared focus ring utility (e.g., `focus-visible:outline-offset-4 outline-[color]`) and apply it across all UI primitives and key page elements.
   - Add Jest DOM or Storybook tests to confirm visibility under forced-colors/high-contrast modes.
   - Update design documentation to show correct focus appearance in various states (hover + focus, dark mode).

5. **Add regression checks**
   - Extend automated tests: Storybook accessibility panel, Jest DOM checks for focus classes, Playwright scenario toggling reduced motion.
   - Wire new scripts into `pnpm test:a11y` or a dedicated `pnpm test:contrast` command if needed.
   - Ensure CI coverage includes the new checks and links to documentation.

6. **Document and handoff**
   - Update `docs/testing.md` (or new accessibility doc) with verification steps, including manual QA checklist.
   - Link contrast audit and focus/motion guidelines back to `WBS/Task_7.1_Reduced_Motion_Contrast_Focus.md`.
   - Capture follow-up work (e.g., additional theme variants) as new WBS items if gaps remain.

## Risks & Mitigations
- **Design token churn** — Changes could ripple through branding; mitigate by coordinating with design stakeholders and capturing before/after evidence.
- **Forced-colors edge cases** — Windows High Contrast may strip gradients; test in system high-contrast mode and adjust CSS accordingly.
- **Performance regressions** — Replacing animations with JS state toggles might add layout cost; prefer pure CSS solutions and precompute state where possible.

## Decisions
- **Tooling workflow** — Stark and axe-core are the supported audit tools; their usage is documented in `docs/contrast-audit.md` and `docs/testing.md`.
- **High-contrast strategy** — Users can cycle contrast modes (System → High → Standard) via the header toggle; CSS also honours system `prefers-contrast` / `forced-colors` signals so “System” stays in sync.
- **Animated assets** — No animated assets ship yet; any future motion-heavy illustrations will inherit the reduced-motion clamp and are deferred to personalization follow-up tasks.
- **Theme overrides** — Manual theme switching button now cycles System → Dark → Light, persisting the preference in the `portfolio-theme` cookie while still honouring system updates when “System” is active.
