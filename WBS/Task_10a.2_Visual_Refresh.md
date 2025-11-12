# Task 10a.2 — Personalized Home UI Refresh

## Objective
Implement the visual/UI changes deferred by Task 10a.1 so the home experience actually looks personal: swap in the new hero portrait, replace utility toggles with rounded sliders + skim button, scaffold the tech-stack carousel, and ensure the refreshed CTAs/sections feel cohesive across breakpoints and locales. Treat this as the visual counterpart to the copy rewrite.

## Inputs
- Personalization brief (`docs/personalization/brief.md`) for tonal + module direction.
- Current copy + dictionaries from Task 10a.1 (`apps/site/src/utils/dictionaries.ts`).
- Existing shell components (`apps/site/src/components/Shell/*`) and theme tokens.
- Tech stack assets staged under `apps/site/public/tech-stack/`.
- Playwright coverage (`apps/site/tests/home.skim.spec.ts`, `tests/a11y/*.spec.ts`) for regression updates.

## In Scope
- Replacing the hero gradient with the new 4:3 portrait (caption: “Self portrait captured for the 2025 personalization refresh.”, alt: “Portrait of Jack Featherstone standing under warm light.”) and ensuring responsive crops + lazy loading work.
- Introducing rounded 3-position sliders for theme (Light / System / Dark) and contrast (Normal / System / High), plus a discrete, high-contrast Skim Mode button near the hero. Controls must remain keyboard accessible and respect current preference persistence.
- Updating the language switcher to use the same slider styling (日本語 / English / 简体中文) while retaining locale routing logic.
- Building the `/experience` or `/meetings` routes; CTAs still point there but pages may 404.
- Refitting the Sticky CTA sidebar so the reordered actions from Task 10a.1 occupy balanced space on desktop and stack cleanly on mobile; preserve download behavior for the resume link.
- Building the first pass of the tech stack carousel: horizontally scrollable list with snap points on mobile, multi-column grid fallback on desktop, logos sourced from `public/tech-stack/*.svg`, each entry linking out per the dictionary metadata.
- Light spacing/typography tweaks to align with the “warm, first-person” feel (e.g., softened card corners, slightly increased section spacing) without inventing a new color palette.
- Refreshing screenshots/mockups under `docs/personalization/reference/` if they help QA/sign-off.
- Updating Jest/Playwright coverage for new controls, hero media, and carousel interaction (smoke tests only; deeper carousel automation can land in Task 10a.3).

## Out of Scope
- Additional copy changes (Task 10a.1 already finalized text).
- Advanced carousel interactions such as drag momentum, keyboard shortcuts, or spotlight animations (punted to Task 10a.3).
- New brand colors or typography tokens beyond the minor spacing/radius tweaks listed above.
- Localization re-writes; only ensure existing ja/zh strings display correctly in the new UI.

## Deliverables
- Updated hero media assets in `apps/site/public/media/hero/` and wiring in `ShellLayout` (or dedicated Hero component) to render the portrait with caption + alt text from the dictionary.
- New slider components (likely in `apps/site/src/components/controls/`) reused by theme/contrast/language toggles, complete with focus rings and ARIA annotations.
- Revised `ShellLayout` header block placing theme/contrast sliders and the language control in a cohesive cluster, plus a clearly labeled Skim Mode button.
- Carousel implementation (component + styles) consuming the tech stack data from the dictionary, with breakpoints documented and minimal motion to maintain accessibility.
- Updated Sticky CTA styles ensuring 3-up layout on desktop and proper spacing when descriptions are absent.
- Basic implementations for `/experience` and `/meetings`
- Playwright/Jest updates validating: hero image renders with the new alt text, sliders toggle modes, tech stack list exposes all items, and CTA buttons retain their href/download behavior.
- Appendix entry in `docs/personalization/brief.md` referencing the shipped UI changes (or addendum file if preferred).

## Implementation Plan
1. **Hero & media**
   - Add the portrait asset(s) under `apps/site/public/media/hero/`.
   - Update dictionary hero media metadata (caption, alt) if needed, and ensure `ResponsiveImage` presets fit the portrait framing.
2. **Control surface**
   - Build a generic RoundedSlider component supporting 2–3 labeled stops + keyboard control.
   - Replace the existing ThemeToggle/ContrastToggle components with slider-driven versions, keeping persistence/localStorage behavior intact.
   - Swap the language switcher to the same pattern and add an explicit Skim Mode button wired into the current query-param logic.
3. **CTA/sidebar polish**
   - Adjust `StickyCTA` styles so three CTA buttons align with the new layout; ensure text wrapping states are tested.
4. **Tech stack carousel**
   - Create a `TechStackCarousel` component pulling dictionary data, rendering logo + label + outbound link.
   - Implement scroll snap on small screens and multi-column grid fallback on large screens; add faint gradients/arrows only if accessible.
5. **Docs & tests**
   - Capture key screenshots in `docs/personalization/reference/` (optional but recommended).
   - Update Playwright/Jest tests to cover hero media swap, slider toggles, carousel presence, and CTA download expectations.

## Acceptance Criteria
- `/en`, `/ja`, `/zh` render the portrait hero with correct alt/caption; Lighthouse/axe scans show no new violations.
- Theme/contrast/language sliders support mouse, touch, and keyboard input, preserve settings across reloads, and expose visible focus states.
- Skim Mode button remains discoverable and toggles the existing `data-skim-mode` attribute as before.
- Sticky sidebar shows the three CTAs with balanced spacing, matching Task 10a.1 labels and routes.
- Tech stack carousel/grid displays all 22 entries with working outbound links and reasonable behavior on both mobile (horizontal scroll) and desktop (grid).
- Playwright home skim spec (and any new tests) pass without brittle text selectors; screenshots/docs updated to illustrate the new UI.

## Risks & Mitigations
- **Asset readiness**: portrait/logo quality may lag; keep placeholder gradient fallback + TODO link until final files arrive.
- **Accessibility regressions**: new sliders introduce keyboard/focus risks—add unit + axe coverage and design focus styles explicitly.
- **Performance**: large portrait asset could bloat LCP. Export multiple sizes and leverage `ResponsiveImage` presets.
- **Carousel UX**: horizontal scroll can hide content; include inline instructions or auto-visible scroll indicators to reduce confusion.

## Open Questions
- Should sliders display per-stop icons (sun/moon, low/high) or text-only labels? Await preference before final polish.
- Do we need to animate the hero portrait entry (fade/scale) or keep it static for simplicity?
- Are there additional tech logos (e.g., Docker, GitHub Actions) that should join the carousel before Task 10a.3?

Document owner: Jack Featherstone. Update this spec if Task 10a.2 scope changes or dependencies shift.
