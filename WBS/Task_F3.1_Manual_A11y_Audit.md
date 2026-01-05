# Task F3.1 — Manual a11y audit

### Scope (launch-critical)
- Manual accessibility audit across: **Home**, **Experience**, **Meetings**, and **Skim** mode.
- Focus areas: screen reader paths, tab order, focus traps, skip/anchor navigation, modals/drawers (chatbot, audio player), and CTA/anchor states.
- Platforms: desktop + mobile form factors; light/dark + high-contrast toggles; SR with at least VoiceOver/NVDA/JAWS equivalent paths where feasible.

### Goals / DoD
- Audit notes recorded with **no P0/P1** issues outstanding.
- Any P2/P3 issues tracked and fixes linked (or explicitly deferred with rationale).
- Verify chatbot, audio player, and anchor navigation in both full and skim modes.
- Confirm focus-visible styles and outline/contrast meet expectations (including forced-colors/high-contrast).
- Tab order matches visual flow; no focus traps when chat/audio are open/closed; ESC/close affordances work.

### Pages & features to cover
- `/[locale]` (Home) — hero, tech stack carousel, proof chips, roadmap, CTA/footer, audio player, chatbot launcher/widget.
- `/[locale]/experience` — project sections, anchor nav, tech stack anchors, chatbot.
- `/[locale]/meetings` — availability cards, contact CTA, chatbot.
- Skim mode (`?skim`) — ensure skim rules don’t break tab order or anchors; resume/CTA/chatbot behaviors intact.
- Global elements: language/theme/contrast toggles, breadcrumbs, anchor nav, skip links (if present), modals (chat, audio).

### Checks & methods
- **Keyboard**: Full tab/shift-tab cycles; ensure focus indicators visible; no dead ends; interactive elements reachable in logical order.
- **Screen reader**: Landmarks, headings hierarchy, link/button labels, ARIA for accordions/nav, live regions for async states (chat, captcha).
- **Focus traps**: Chatbot window, audio overlay—ensure trap exists only when open and ESC/close restores prior focus.
- **Contrast/forced colors**: Verify high-contrast classes and forced-colors media query; check outlines on focus states.
- **Internationalization**: Spot-check locale switch effects on SR labels and headings (especially chatbot and availability).
- **Reduced motion** (if available): Ensure no blocking animations and respects prefers-reduced-motion.

### Deliverables
- Audit log with findings and severity (P0/P1/P2/P3), per page/feature.
- Links to fixes (or TODOs) for any issues uncovered.
- Optional: short clip/screenshot for tricky SR/focus cases.

### Proposed timeline
- Day 1: Home + Skim mode audit, file any issues.
- Day 2: Experience + Meetings + chatbot/audio flows; regress Skim if fixes land.
- Day 3 (buffer): Re-test fixed items; finalize notes.

## Audit log

### 2026-Jan-05
- Scope: /[locale], /[locale]/experience, /[locale]/meetings, and ?skim.
- Evidence: tab order per page in `WBS/Task_F3.1_Tab_Order.txt`.
- Result: No P0/P1 outstanding (user-verified SR pass + keyboard flow).
- Fixes linked:
  - `apps/site/src/components/Shell/Layout.tsx` (tab order alignment).
  - `apps/site/src/components/Shell/MobileShellLayout.tsx` (tab order slot for chatbot).
  - `apps/site/src/components/chat/ChatbotPortalMount.tsx` (chat launcher placement).
  - `apps/site/src/components/AudioPlayer.tsx` (prevent hidden focusable controls).
  - `apps/site/src/components/meetings/AvailabilitySection.tsx` (remove grid cell tab stops).
