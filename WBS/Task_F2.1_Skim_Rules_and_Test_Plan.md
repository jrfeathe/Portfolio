# Task F2.1 — Skim Rules & Test Plan

## Objective
- Freeze the skim-mode rules for launch: show only experience evidence + tech stack, keep resume/“Need proof fast?” CTA + chatbot, hide hero name/intro/media, roadmap, audio, and nav, and surface email.
- Define the test matrix and screenshot expectations that F2.2 (layout) and F2.3 (toggle/data gating) must satisfy while targeting a single-screen desktop fit.

## Scope & assumptions
- Scope: home page `/[locale]` when `?skim` is present; other pages ignore skim state and stay unchanged.
- Query handling: keep `resolveSkimMode` behavior (`?skim`, `?skim=1/true/yes`, case-insensitive) and the `data-skim-mode` flag on the root container.
- Health tile (is not implemented yet): lives in the hero for full view, moves to the footer in skim (per FINAL_WBS).
- Data surface: content comes from the dictionaries (no `content/skim_matrix.csv`); use dictionary-provided fields.
- Layout goal: desktop skim view should fit on one screen with a compact evidence section as the primary showcase; tech stack may be adjusted to support this. Mobile is best-effort to stay concise.
- Out of scope here: wiring the layout or gating logic (handled in F2.2/F2.3).

## Skim rules
### Activation & persistence
- Skim mode turns on when `?skim` is present with a truthy value; absence disables it. No other query/state changes.
- `SkimToggleButton` toggles the query param without resetting theme/contrast/language selections.
- Keep `data-skim-mode="true"` on the main wrapper for styling/tests; avoid rendering duplicate roots.

### Visible surfaces in skim
- Shell/header stays: theme/contrast/language controls, skim toggle, and sticky CTA cluster titled “Need proof fast?” with resume download, view experience, and book intro links. Resume download keeps the generated filename per locale/version.
- Chatbot launcher + window remain available; rate-limit/error/captcha states unchanged.
- Recruiter skim summary (experience evidence):
  - Source: dictionary entries. Add new strings to dictionary when necessary.
  - Single summary block provides the primary heading for the skim page.
  - Field expectations:
    - Primary Languages & Tools — Show Tech Stack Carousel
    - Leadership & Mentorship — Showcase Rollodex and UGTA roles
    - Work Authorization — one-line statement; tooltip allowed for nuance. "Authorized to work in US with valid SSN."
    - Timezone & Collaboration Window — "Provided notice, I can meet most days between 3pm to 6pm NY time." Then offer link to meetings page.
    - Availability — "Immediately available for remote part-time work. Two weeks notice required for full-time."
    - Email — Clearly display email address
- Footer stays; health tile renders in the footer with live/sample data and fallback copy.

### Hidden/removed in skim
- Hide hero name/title (“Jack Featherstone”), hero intro copy, portrait/media/caption, and mission/purpose text; do not reuse the hero H1/subtitle in skim.
- No anchor/nav bar in skim mode; keep the header minimal on desktop and mobile.
- Remove roadmap/current projects section.
- Do not render the audio player component; it should be absent from the DOM/ARIA tree.

### Data & gating rules
- Render skim entries only if they have non-empty content.
- Localization pulls labels/content from dictionaries; data content stays in the localized dictionary fields when present.
- Resume filename and CTA labels respect locale; `Need proof fast?` title remains unchanged; ensure email is visible in skim mode.

### Accessibility & behavior
- Focus order is chronological: controls → skim summary → chatbot → footer.
- CTA buttons and the surfaced email remain keyboard reachable with visible focus.
- High-contrast/dark modes continue to apply; skim state must not introduce axe violations.

## Test matrix
| Area               | Scenario                                                    | Checks                                                                                                                                                                | Automation                                                      |
|--------------------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| Activation         | Visit `/[locale]?skim=1` and toggle via `SkimToggleButton`. | `data-skim-mode="true"` set; query param flips on click; theme/contrast/language unchanged.                                                                           | Jest for `resolveSkimMode`; Playwright for toggle/navigation.   |
| Content gating     | Skim view renders.                                          | Hero name/intro/portrait/caption hidden; mission/proof/roadmap absent; no anchor nav; audio player missing from DOM.                                                 | Playwright DOM assertions.                                      |
| Recruiter summary  | Skim summary section.                                       | Only ready entries from the dictionary render; ordering matches dictionary; proof links target sources; summary provides the page H1 in skim; no draft text visible.  | Jest to filter dictionary parsing; Playwright to assert rendered items/links. |
| CTA/resume/contact | Sticky CTA cluster + contact.                               | “Need proof fast?” title visible; resume download present with correct filename; email surfaced; other CTAs visible and link to correct routes.                       | Playwright.                                                     |
| Tech stack         | Tech section after summary.                                 | Carousel/grid visible; links point to `/experience#...`; focus-visible styles present; layout can condense for single-screen desktop fit.                             | Playwright + axe include block.                                 |
| Chat               | Launcher/window.                                            | Chatbot opens/closes; rate-limit/error labels available; persists in skim.                                                                                            | Playwright smoke.                                               |
| Health tile        | Footer placement.                                           | Health tile appears in footer in skim; absent from hero; shows fallback if data missing.                                                                              | Playwright.                                                     |
| Localization       | `/ja?skim=1`, `/zh?skim=1`.                                 | Labels localized; resume filename matches locale; no missing-string fallbacks.                                                                                        | Playwright spot checks.                                         |
| A11y               | Axe sweep.                                                  | No serious/critical violations on skim page.                                                                                                                          | Existing Playwright axe run.                                    |

## Manual QA checklist
- Desktop + mobile for `/en?skim=1`: skim summary first, no hero name/intro/portrait/roadmap/audio, CTA cluster/email/chat reachable by keyboard/touch.
- Cross-mode: verify light/dark/high-contrast keep legible badges, buttons, and tech carousel states.
- Locale spot-checks (`ja`, `zh`): localized labels and resume filenames; no English bleed-through.
- Health tile visible in footer with sensible fallback when data unavailable.
- Desktop skim attempts to fit on one screen: evidence + CTA/email + tech stack visible without scrolling where feasible. Footer should be scrolled to.

## Screenshot checklist
- Desktop `/en?skim=1` top-of-page showing skim summary + CTA cluster + email (no hero/portrait).
- Desktop footer in skim showing health tile placement.
- Mobile `/en?skim=1` showing condensed skim summary + tech stack with CTA/email visible.
- Optional: one localized skim view (e.g., `/ja?skim=1`) to confirm translated labels.

## ADJUSTMENTS
- For Skim Mode Home we want the following invisible:
  - "Jack Featherstone" / "Hi, I'm Jack and this is my Software Engineering portfolio! I'm looking to begin my career as a Junior Fullstack Developer. The intent of this site is to prove my skills and abilities, and to capitalize on opportunities to network."
  - Portrait / Portrait caption
  - Audio Player
  - Roadmap / Current projects & plans
- For Skim Mode Home we want to change:
  - Layout. Try to fit everything on one screen on desktop. Compact evidence section yet make it the main showcase. Tech stack may need adjustment.
  - We want to display my email.
- Skim mode is only needed for Home. Other pages do not need it.
