# Zoom & UI Sizing — Release 1.0.1

## Observations
- Samsung Galaxy Tab S10 Lite shows the UI “zoomed out.”
- On large desktop screens, the UI feels small enough that 120% browser zoom is often needed.

## Options to Remedy (Shortlist)

### 1) Confirm + Normalize Viewport Behavior
- Verify we’re not overriding the default viewport scale.
- Ensure a standard viewport meta tag exists (and only once) in the Next.js App Router layout.
- Avoid CSS or JS that forces `zoom`, `transform: scale`, or `min-scale`/`maximum-scale` unless intentional.

### 2) Raise the Global Base Size (Typography + Spacing)
- Increase root `font-size` on `html`/`body` (e.g., 100% → 106–112%).
- Adjust spacing tokens so padding/margins scale with `rem` and inherit the new base size.
- Consider a larger “default” type size for body copy on wide screens.

### 3) Fluid Typography via `clamp()`
- Use a `clamp(min, preferred, max)` strategy for body and headings to scale smoothly with viewport width.
- Set a slightly higher min on large screens so text doesn’t shrink too far.

### 4) Tablet-Specific Breakpoints (e.g., 1024–1280px)
- Add a tablet breakpoint to bump base font-size and key component sizing.
- Ensure touch-target sizes meet minimums (44px+).

### 5) Revisit Max-Width / Layout Density
- If the layout is very wide, the UI can feel sparse and small.
- Reduce max content width or increase column and card sizing at large breakpoints.
- Add a “comfortable” layout mode (slightly larger sizing) for large screens.

### 6) Optical Scaling of Key Components
- Increase sizes of primary buttons, cards, and nav elements at large breakpoints.
- Use a scale factor for UI tokens (e.g., typography scale 1.06–1.12 at XL).

### 7) Accessibility: Respect User Zoom While Improving Default
- Don’t disable user zoom.
- Ensure font sizes and spacing remain readable at 100% for typical devices.

### 8) Device-Specific QA / Measurement
- Capture actual CSS pixel sizes on the Galaxy Tab S10 Lite and compare to iPad/desktop.
- Document device DPR, viewport width/height, and computed root font-size to inform sizing rules.

## Questions / Follow-ups
- Do we already set a viewport meta tag in `apps/site/app/layout.tsx` (or similar)?
  - Not sure.
- Are we using `zoom`, `transform: scale`, or fixed `px` sizing anywhere that could shrink UI?
  - Not sure.
- What is the current `html`/`body` base font-size and typography scale?
  - Not sure. We don't want to change spacing or relative scaling. The layout is already finalized. We only want to make changes to scaling of everything together.
- Do we have existing tablet breakpoints and token-based sizing (e.g., in `packages/ui/tokens.json`)?
  - Probably not. We have a mobile mode already, which has a breakpoint.
- Should we target a specific minimum readable size for body text (e.g., 16–18px on tablets)?
  - Not needed. Just boosting default scaling will accomplish the need.
- Do we want a “comfortable” layout mode for large screens (similar to email clients)?
  - Not needed.

## Repo Audit (Jan 28, 2026)
- No explicit viewport export found in the App Router layout. `apps/site/app/layout.tsx` defines `metadata` but no `viewport` export.
- `apps/site/app/globals.css` sets `:root` variables and `body` font-family only; no explicit `font-size` on `html`/`:root`.
- No global `zoom` or layout-level `transform: scale` rules; only a single icon uses `transform: scale(1.12)` in `apps/site/app/globals.css`.
- Typography + spacing tokens in `packages/ui/tokens.json` are defined in `rem`, and Tailwind pulls them via `tailwind.config.mjs`. Root font-size changes will scale most UI uniformly.
- Some UI sizing uses fixed pixel values in JS (e.g., chatbot panel sizes in `apps/site/src/components/chat/ChatbotProvider.tsx`), which will not scale if we only change the root font-size.

## Proposal (Aligned With “Scale Everything Together”)

### Option A — Recommended (Explicit viewport + root scale)
1) Add an explicit Next.js viewport export (no min/max scale limits) so devices don’t render a “desktop” layout.
2) Add a single CSS-driven scale variable applied to root `font-size`, with mild bumps for tablets and large screens.

Example CSS (to place in `apps/site/app/globals.css`):
```
:root {
  --ui-scale: 1;
  font-size: calc(16px * var(--ui-scale));
}

/* Tablet-ish + coarse pointer bump */
@media (min-width: 900px) and (pointer: coarse) {
  :root {
    --ui-scale: 1.08;
  }
}

/* Large desktop bumps */
@media (min-width: 1280px) {
  :root {
    --ui-scale: 1.1;
  }
}

@media (min-width: 1536px) {
  :root {
    --ui-scale: 1.12;
  }
}
```
Notes:
- This keeps typography/spacing ratios intact (all `rem`-based tokens scale together).
- Fixed `px` sizes (e.g., chatbot panel sizes) won’t scale; if those feel small after the bump, we can multiply those constants by `--ui-scale` later.

### Option B — Alternate (Fluid `clamp()` root size)
If you prefer a continuous scale rather than steps:
```
:root {
  font-size: clamp(16px, 0.5vw + 12px, 19.2px);
}
```
This approximates ~120% scale around ~1440px while staying at 16px on smaller screens.

## Decision Points
- Target scale for large desktops: should we aim for 1.1 or closer to your 120% preference (1.2)?
  - Let's aim for 1.2 on large desktops.
- For tablets: do we want a pointer-based bump (`pointer: coarse`) or a width-range bump?
  - Let's use width. Tablets appearing to use desktop layout is fine, we just want to be sure we are zoomed properly even if the viewport height is large.

## Recommended Next Step (Low Risk)
- Add an explicit viewport export plus a root `--ui-scale` with modest tablet/desktop bumps, then verify on the Galaxy Tab and your large desktop (set the bump to match the “120% feels right” target).
