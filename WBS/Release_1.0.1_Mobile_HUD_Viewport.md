Release 1.0.1 - Mobile HUD Viewport Options

Context
- Reported issue: sticky/fixed overlays (audio player + chatbot launcher) sit too low on real mobile devices; desktop devtools emulation looks OK.
- Current implementation relies on fixed positioning and window.innerHeight/100vh, which can diverge from the mobile visual viewport and safe-area insets.

Current Overlay Touchpoints (Code)
- Audio player overlay: `apps/site/src/components/AudioPlayer.tsx` (fixed bottom-4/left-4 in horizontal mode; drag bounds use window.innerHeight/innerWidth).
- Chatbot launcher + shell: `apps/site/src/components/chat/ChatbotPortalMount.tsx` and `apps/site/src/components/chat/ChatbotProvider.tsx` (fixed bottom-6/right-6; sizing uses window.innerHeight and 100vh).
- Mobile floating layer: `apps/site/src/components/Shell/MobileShellLayout.tsx` (`data-floating-layer` fixed, pointer-events none; `#chatbot-slot` mounted here).
- No safe-area or visualViewport usage in global styles: `apps/site/app/globals.css`.

Hypothesis
- Mobile browsers (especially iOS Safari) expose a visual viewport smaller than the layout viewport when browser UI is visible.
- Fixed elements and innerHeight-based sizing use the layout viewport, so bottom-anchored UI can be clipped behind the browser chrome or the home indicator.
- Devtools emulation does not replicate dynamic browser UI or safe-area insets, so the issue only shows on real devices.

Goals
- Centralize overlay positioning into a HUD layer that tracks the actual visible viewport.
- Respect safe-area insets on iOS (home indicator / notch).
- Keep overlays consistent across screen sizes and orientations.
- Avoid ad-hoc “bottom-N” offsets scattered across components.

Option A: CSS-Only Safe-Area + Dynamic Viewport Units
What changes
- Add safe-area CSS variables (e.g. `--safe-bottom`, `--safe-right`) in `apps/site/app/globals.css`.
- Replace fixed bottom/right classes with CSS calc using safe-area variables.
- Use `100dvh`/`100svh` instead of `100vh` for max-height calculations in `ChatbotProvider`.

Example approach (conceptual)
- `bottom: calc(1.5rem + var(--safe-bottom))`
- `max-height: calc(100dvh - var(--chat-height-offset))`

Pros
- Minimal JS, low risk.
- Quick to implement.

Cons
- Not fully reliable on older iOS versions.
- Does not track dynamic toolbar visibility changes as precisely as visualViewport.

Option B: VisualViewport-Driven HUD Layer (Recommended)
What changes
- Add a top-level HUD layer component (e.g. `ViewportHUDLayer`) mounted once in app layout.
- Listen to `visualViewport` resize/scroll and update CSS variables on `:root`:
  - `--hud-width`, `--hud-height`, `--hud-offset-top`, `--hud-offset-left`
  - `--hud-safe-bottom`, `--hud-safe-right` (max of visualViewport inset + env safe-area)
- Render a fixed HUD container sized to the visual viewport and portal all overlay UI into it.
- Update overlays to position via absolute offsets inside the HUD container instead of `position: fixed`.
- Update AudioPlayer drag bounds and Chatbot sizing to read HUD dimensions instead of window.innerHeight/100vh.

Potential new pieces
- `apps/site/src/components/Shell/ViewportHUDLayer.tsx` (creates `#hud-layer` + CSS vars).
- A small hook `useHUDViewport()` for shared viewport sizes in JS.
- Update `ChatbotPortalMount` to target `#hud-layer` first.

Pros
- Most robust across iOS/Android and toolbar show/hide states.
- Central place to manage safe-area + viewport quirks.
- Makes overlays predictable on all screen sizes.

Cons
- More JS + complexity.
- Need to ensure performance (throttle resize/scroll).

Option C: Overlay Manager + Docking Rules
What changes
- Build an overlay manager context that registers widgets (audio, chatbot, menu) with preferred corners and sizes.
- Manager computes a “dock” layout and supplies style props (bottom/right offsets).
- Can be combined with Option A or B for viewport accuracy.

Pros
- Solves overlap/collision between multiple overlays.
- Scales to more floating widgets later.

Cons
- Larger refactor, more moving parts.
- Slower to ship for 1.0.1 if scope is tight.

Recommended Path
1) Implement Option B (HUD layer + visualViewport + safe-area vars).
2) As a quick guardrail, also add safe-area variables in CSS for fallback.
3) Defer Option C unless collisions become a real UX issue.

Implementation Notes (if we proceed)
- Audio player:
  - Replace fixed bottom/right classes with HUD-aware classes (or inline styles).
  - Clamp drag bounds using HUD viewport (visualViewport height/width).
- Chatbot:
  - Replace `fixed bottom-6 right-6` with HUD offsets.
  - Replace `100vh` sizing with HUD height variable.
- Layout:
  - Add `ViewportHUDLayer` to `apps/site/app/[locale]/layout.tsx` (or a higher layout) so it wraps all pages.
  - Keep `#chatbot-slot` for SSR fallback, but prefer `#hud-layer` for actual mount.

Open Questions
- Which mobile browsers are highest priority (iOS Safari vs Chrome Android)?
  - Both are equally important. We want a solution that works everywhere.
- Do we need to preserve drag positions across route changes or sessions?
  - Not needed.
- Should the audio player and chatbot be allowed to overlap, or should the HUD manager auto-space them?
  - The chatbot should always overlap the audio player. The Menu for mobile should always overlap the chatbot and audio player.

Suggested Validation
- Test on real devices:
  - iOS Safari with address bar visible + hidden.
  - Chrome Android with dynamic toolbar.
  - Notched device (safe-area insets).
- Verify: audio player reopen button and chatbot launcher never clip below the visible viewport.

Notes (Implemented)
- Added a HUD layer that tracks the visual viewport and safe-area insets:
  - New `ViewportHUDLayer` sets `--hud-*` CSS vars and exposes a `HudPortal` target.
  - `useHUDViewport()` provides HUD metrics for sizing/drag bounds.
- Portaled floating overlays into the HUD layer:
  - Audio player (all pages) now renders inside the HUD overlay.
  - Chatbot launcher + panel now render inside the HUD overlay.
  - Mobile Menu toggle + menu panel now render inside the HUD overlay.
- Updated positioning/sizing to use HUD variables instead of `100vh`/`window.innerHeight`:
  - Chat window max sizes use `--hud-width/height` + safe-area offsets.
  - Audio player drag bounds use HUD width/height + safe-area offsets.
  - Menu panel padding and close-button offsets respect safe-area insets.
- Added CSS rules for HUD-layer positioning and safe-area offsets in global styles.
- HUD jitter smoothing: VisualViewport updates are rounded and thresholded to 2px to eliminate scroll-induced wobble while keeping alignment stable.
