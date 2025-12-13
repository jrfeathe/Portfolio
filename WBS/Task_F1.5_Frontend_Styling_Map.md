# Task F1.5 — Frontend Styling Map & Override Audit

## Objective
- Map the frontend structure and styling layers to understand where overrides are coming from.
- Highlight the main override hotspots and coupling points so we can plan a cleanup that reduces specificity fights and visual regressions.

## Frontend architecture (apps/site)
- Next.js 14 App Router with localized routes under `apps/site/app/[locale]/*` and redirect stubs at `apps/site/app/experience` / `apps/site/app/meetings`.
- Shared layout system in `apps/site/src/components/Shell` (desktop + mobile switcher) that wires header controls (theme, contrast, language, skim), hero media, anchor nav, sidebar CTA, and footer.
- Chat experience delivered via `apps/site/src/components/chat/ChatbotProvider.tsx`; audio player, tech carousel, availability matrix, segmented controls, and skim toggle live in `apps/site/src/components`.
- UI kit `packages/ui` (Button, Tabs, Card, etc.) uses Tailwind token classnames and exports focus ring helper (`FOCUS_VISIBLE_RING`) plus design tokens in `packages/ui/tokens.json`.
- Copy/content pulled from dictionaries (`apps/site/src/utils/dictionaries.ts`, `content/`) and resume data for sections.

## Styling layers
- Tailwind config source of truth in `packages/config/tailwind/index.cjs` (tokens for light/dark/print); `apps/site/tailwind.config.cjs` spreads this config and points `content` to app/ui sources. A parallel `tailwind.config.mjs` at repo root also imports tokens for tooling.
- Global CSS in `apps/site/app/globals.css`: Tailwind `@base/components/utilities` plus base-layer rules for reduced-motion, contrast, forced-colors, and assorted component tweaks; sets `:root { color-scheme: light dark; }` and a body font override.
- Print stylesheet `apps/site/src/styles/print.css` is imported in `app/layout.tsx` and applies `@media print` overrides with aggressive `!important`.
- Fonts declared in `app/layout.tsx` via `next/font/local`, exposing `--font-sans` / `--font-mono` variables and applied to `<body>`.
- Critical CSS pipeline: `app/critical.css.src` feeds `scripts/performance/generate-critical-css.mjs`, producing `app/critical-css.manifest.json`; `app/CriticalCss.tsx` inlines the selected CSS block at runtime.
- Theme/contrast init script in `app/layout.tsx` sets `class="dark"` and `class="contrast-high"` on `<html>` plus `data-theme` / `data-contrast` attributes from cookies + client hints before hydration.

## Override hotspots (source → affected UI)
- `apps/site/app/globals.css` — many `.contrast-high` and `@media (prefers-contrast: more)` rules with `!important`, keyed off data attributes:
  - Chat: `[data-chat-window]`, `[data-chat-icon]`, `[data-chat-send-button]`, `[data-chat-launcher]`.
  - Tech carousel: `[data-tech-stack-item]`, `[data-tech-stack-icon]`.
  - Experience/meetings: `[data-experience-card]`, `[data-meeting-slot]`.
  - Availability: `[data-availability-section]`, `[data-availability-matrix-card]`, listbox options.
  - Controls: `[data-segmented]`, `[data-skim-status-group]`, `[data-time-chip]`, `.grid.gap-4.sm\\:grid-cols-2`.
  - Shell chrome: `.shell-sticky-cta`, `.shell-anchor-nav`, `.shell-sidebar`, `[data-hero-portrait]`.
  - Global focus/forced-colors adjustments override Tailwind rings/outlines on `button/a/input/select/textarea`.
- `apps/site/src/styles/print.css` — forces backgrounds/borders/visibility with `!important`, hides nav/CTA/controls, and rewrites typography for print-only view.
- Config duplication: both `tailwind.config.mjs` and `packages/config/tailwind/index.cjs` import tokens; drift between them would silently change generated utilities/content scanning.
- Inline theme/contrast script mutates root classes/data attrs before hydration; combined with component-level `data-*` hooks and `!important` rules, this is a frequent source of style conflicts.

## Risks / mess indicators
- Heavy `!important` usage across contrast/print/motion blocks makes Tailwind utility overrides brittle and hard to reason about.
- Data-attribute-specific selectors tightly couple global CSS to component markup; refactors risk regressions if attributes move or are renamed.
- Mixed typography sources (Tailwind tokens, Next font variables, manual `body` font) can diverge if tokens change without updating font loaders.
- Print sheet and critical-CSS injection add extra layers that can mask or override component-level styles if media queries or manifests fall out of sync.

## Next actions (proposal)
- Group overrides by intent (contrast, print, motion, component-specific) and convert where possible into Tailwind variants/utilities to drop `!important`.
- Canonicalize Tailwind config (lean on `@portfolio/config/tailwind`) and ensure critical-CSS generation reads the same config/content paths.
- Document or consolidate the `data-*` contracts for chat, availability, shell nav/CTA, skim, and tech carousel; prefer semantic class hooks when cleaning up.
- Add targeted visual/a11y checks (dark/contrast modes, print) after refactors to catch regressions once overrides are reduced.

## Owner / status
- Owner: Jack
- Status: New — mapping complete; cleanup design needed.

## Recent changes (checkpoint)
- Centralized palette generation: added `scripts/generate-tokens-css.mjs` to emit `packages/ui/tokens.css` from `packages/ui/tokens.json`, including alias vars used by `globals.css`.
- `apps/site/app/globals.css` now imports the generated tokens CSS and no longer hardcodes the palette; only `color-scheme` remains locally defined.
- RGBA helpers (rings/glows, subtle borders) are defined alongside tokens and consumed via variables; remaining overrides pull from the shared palette.
- README updated with the regeneration command (`node scripts/generate-tokens-css.mjs`) to keep tokens CSS in sync with JSON changes.
- Moved remaining RGBA and contrast colors out of aliases into the core palettes (light/dark/print) so Tailwind and app code read directly from tokens instead of literals.
