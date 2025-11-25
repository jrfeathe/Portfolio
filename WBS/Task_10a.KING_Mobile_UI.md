# Task 10a.KING — Mobile UI

## Objective
Deliver a mobile-first layout for the KING personalization burst so the home and meetings experiences stay legible, interactive, and performant on 320–768px screens without losing the playful KING additions (audio player, availability map, tech stack carousel, CTA cluster).

## Current Pain
- Desktop-first layout squeezes or overflows on small screens; sticky CTAs and overlays crowd the viewport.
- Theme/contrast/language controls and skim mode are scattered, making thumb reach and focus order awkward on phones.
- KING modules (media player overlay, availability map, tech stack carousel) risk covering content or becoming unusable on touch.
- Mobile-specific a11y/perf expectations are undefined; Lighthouse mobile budgets are unguarded.

## Inputs & Dependencies
- Next.js shells under `apps/site/app/[locale]/` and shared `Shell` layout styles.
- Controls from Tasks 10a.1/10a.2 (theme/contrast sliders, language switcher, skim toggle) and CTA components.
- KING modules: Availability map, TechStack carousel, AudioPlayer overlay, Sticky CTA cluster.
- Tokens/spacing from `@portfolio/ui` + Tailwind config; responsive image system and hero portrait assets.
- QA coverage: Playwright smoke (home/skim) and a11y specs to be expanded for mobile.

## Requirements Overview
- **Breakpoints**: Treat ≤480px as small, 481–768px as medium; avoid horizontal scroll at 320px; cap container width to avoid edge clipping on devices with rounded corners.
- **Navigation & controls**: Collapse header into a top app bar with a left-side menu sheet that overlays and dims the body; group theme/contrast/language sliders + skim mode into a single tray reachable with thumb; keep focus order logical and announce state changes.
- **Hero & CTA**: Portrait hero crops responsively; headline/lede stay above the fold with at least one CTA visible; CTA cluster becomes a bar positioned below the introductory content and above the tech stack (inline, not floating bottom), with 44px+ touch targets and preserved download behavior.
- **KING modules**:
  - Media Player overlay pins to bottom-right on desktop; on mobile becomes a docked bottom sheet with safe-area padding, defaults open as a utility bar, and offers collapse/close with non-blocking overlay height.
  - Availability map stacks single-column with sticky hour labels; dropdown stays visible; rows collapse to 2-hour increments and remain keyboard reachable.
  - Tech stack carousel uses horizontal scroll with snap points, gradient edge hints, and overflow bounce disabled; grid fallback activates ≥768px.
- **Content blocks**: Cards and sections adopt single-column flow; images lazy-load with mobile-friendly widths; timelines adopt vertical rhythm with generous spacing.
- **Touch, motion, a11y**: 44px min targets, 12–16px padding, no hidden focus; respect reduced motion, preserve contrast/focus tokens; avoid hover-only cues.
- **Performance**: Optimize hero/tech logos for mobile sizes, defer non-critical JS (player), and keep mobile Lighthouse within perf budgets (e.g., LCP within target).
- **State & persistence**: Controls and skim mode remain in sync across reloads/navigation on mobile, matching desktop behavior.

## Implementation Plan
1. **Audit & layout foundation**
   - Document current mobile breakpoints and spacing; set container max widths and gutters; add safe-area padding for top/bottom bars.
   - Define grid/stack patterns for 320–768px and ensure scroll locking works for modals/drawers.
2. **Header & controls**
   - Build the top app bar + left-side menu sheet that overlays/dims content; move theme/contrast/language sliders and skim toggle into an accessible tray; add keyboard + screen reader labels.
   - Ensure CTA to open the tray is reachable and non-overlapping with system UI.
3. **Hero & CTA stack**
   - Adjust hero portrait/caption responsive settings; ensure text wraps without clipping; place the CTA bar below the intro content and above the tech stack with consistent spacing; keep one CTA above the fold.
   - Validate download CTA behavior and focus order.
4. **KING modules**
   - Refactor AudioPlayer overlay into a bottom sheet on small screens that defaults open as a utility bar with collapse/close; maintain play/pause sync.
   - Tune Availability map for single-column layout with sticky hour labels and dropdown accessibility.
   - Finalize TechStack carousel scroll-snap and gradient hints; add small-screen typography/spacing.
5. **Content flow & components**
   - Align other sections (notes, proof chips, timelines) to single-column; trim margins; ensure images/cards adapt.
   - Verify sticky elements (CTA, player) do not conflict; add z-index and spacing rules.
6. **QA, perf, docs**
   - Add Playwright mobile viewport runs for home/meetings; expand a11y checks; capture Lighthouse mobile snapshot.
   - Instrument a mobile-mode detection telemetry flag to log adoption/usage; update dictionaries if new labels are required; note changes in `COMPLETED_TASKS.md` once shipped.

## Acceptance Criteria
- No horizontal scroll or clipped content at 320–768px; safe-area padding applied to top/bottom overlays.
- Header menu + control tray reachable and fully keyboard/screen-reader accessible; state persists across navigation.
- Hero keeps portrait + headline readable with at least one CTA visible; CTA bar sits below intro content above the tech stack, has 44px+ targets, and preserves href/download.
- Media Player renders as a bottom sheet on mobile, defaults open, and offers close/collapse; Availability map and Tech stack carousel usable and scrollable without traps.
- Mobile Playwright smoke + a11y specs pass; mobile Lighthouse metrics stay within existing budgets and note any new thresholds.
- Mobile-mode telemetry events fire for detection/adoption without errors.

## Risks & Mitigations
- **Overlay collisions** — Player, CTA, and drawers could overlap; enforce z-index layers and safe-area padding, add spacing tokens for stacked overlays.
- **Performance regressions** — Heavy images or scripts can degrade mobile LCP/TBT; ship responsive sources, lazy load non-critical modules, gate animations behind reduced motion.
- **Gesture conflicts** — Horizontal carousel scroll vs. page scroll; use snap points, gradient hints, and avoid drag momentum that captures vertical swipes.

## Decisions
- CTA cluster stays inline as a bar below intro content and above the tech stack (no floating bottom bar).
- Mobile-mode detection telemetry is required.
- Audio player defaults open on mobile as a bottom-sheet utility; collapse/close remains available.

Document owner: Jack Featherstone. Update this spec as KING scope evolves.
