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
- Next change candidates: drop unused `light/dark-normal-*` aliases; retarget `globals.css` to palette vars (`--light-hc-*`, `--light-borderSubtle`, etc.) and remove matching aliases; decide whether to keep convenience helpers (`contrast-*`, `attention-surface`, `print-divider`) or swap call sites to palette vars.
- Removed contrast aliases; only `attention-surface` and `print-divider` remain as convenience hooks.

## Answered questions for commit "Task F1.5: Centralize color aliases to main palette"
- Are there any external consumers (outside this repo) relying on the `colorAliases` shape, or can we slim it down freely?
  - Not at all. The repo is standalone.
- For contrast helpers, do we want to keep the `contrast-*` alias block as a stable API for `contrast-more`/forced-colors classes, or is using palette vars acceptable?
  - We should always use palette vars, derived from the main tokens.json file. We want to have total control over all colors from this file. Any exterior forced colors or overrides are a mistake, and should promptly be stored as an upstream reference in tokens.json.
- Should `attention-surface` remain a dedicated hook for alert/CTA accents, or should components pull directly from `colors.light.attention`?
  - Let's leave this one as attention-surface.
- Is `print-divider` intended to stay as a semantic hook for print borders, or can print CSS read `--light-hc-divider` directly?
  - print.css can read light-hc-divider directly.

## Answered questions for cleaning up the four modes
- Can we redefine high-contrast to use dedicated `*-hc-accent` (and related) per mode and drop `contrastAccent/contrastOn` from normal palettes?
  - Yes we need to do this. Downstream too; we need to ensure all references point to *-hc-accent correctly.
- Is it acceptable to repurpose `--dark-hc-accent` as the single high-contrast primary (currently `dark-hc-focus/contrastAccent` share the same color) and update downstream selectors accordingly?
  - Yes we need to do this. Focus colors across all four modes are simply the high contrast accent colors. Our palette is a mess right now. For example:
    - I am pretty sure that the following section of light is only used by light-hc:
      -   --light-focus: #2563eb;
          --light-borderSubtle: rgba(15, 23, 42, 0.2);
          --light-contrastAccent: #1d4ed8;
          --light-contrastOn: #ffffff;
    - I am pretty sure that the following section of light-hc is unused:
      -   --light-hc-accent: #0f766e;
          --light-hc-accentHover: #0e938a;
    - I am pretty sure that the following section of dark is only used by dark-hc:
      -   --dark-focus: #38bdf8;
          --dark-borderSubtle: rgba(248, 250, 252, 0.2);
          --dark-primaryRing: rgba(56, 189, 248, 0.35);
          --dark-primaryGlow: rgba(56, 189, 248, 0.35);
          --dark-contrastAccent: #38bdf8;
          --dark-contrastOn: #020617;
          --dark-contrastOnStrong: #000000;
    - I am pretty sure that the following section of dark-hc is unused:
      -   --dark-hc-accent: #22c55e;
          --dark-hc-accentHover: #16a34a;
          --dark-hc-accentOn: #052e16;
- Should `focus` stay per-mode (for non-HC) while HC modes get their own `hcFocus` token, or do we unify on the HC accent for outlines in HC?
  - We do not need a focus mode for any mode. This is an artifact of the creation of high contrast modes. Current focus colors refer to HC mode accents.
- Any external consumers depending on the current `contrastAccent` keys in the normal light/dark palettes (e.g., docs, tooling), or can we move HC-only values under the `*-hc` blocks?
  - Not likely. We are only concerned about the tokens.json -> tokens.css -> globals.css -> {components} pipeline right now.

## Completed steps for the four mode cleanup. Commit: "Task F1.5: Simplify the four themes"
1) Add explicit `light-hc` and `dark-hc` palettes in `packages/ui/tokens.json` with the true HC accent/focus/on values; move HC-only fields (current focus/contrast*, primaryRing/Glow) into those HC palettes.
2) Trim base `light`/`dark` palettes to normal-mode colors only (drop `contrastAccent/contrastOn` and other HC-only focus values).
3) Update generator/types/Tailwind configs to read the new HC palettes for focus/accents instead of the base palettes.
4) Rewire consumers (globals, chat, audio, contrast-more utilities) to the `*-hc-*` vars; remove lingering references to the old contrast fields.
5) Keep `attention-surface` and **retain** `print-divider` (skipping removal); still consider pointing print CSS directly to `--light-hc-divider` later if desired.
6) Sweep for removed fields (`contrastAccent`, `contrastOn`, old focus vars) to ensure everything points at the new palette structure.

## Latest changes (pre-commit summary)
- Moved all high-contrast rules in `apps/site/app/globals.css` from the base layer into `@layer utilities` so they win by layer order instead of `!important`.
- Removed every `!important` in `globals.css`, relying on utilities-layer precedence and token variables for borders/backgrounds/text/outlines in HC and forced-colors.
- Confirmed `globals.css` no longer uses `:not(.dark)` selectors; light vs dark HC handled via `.contrast-high` and `.contrast-high.dark`.
- High-contrast colors across chat/availability/shell/audio/controls now source directly from the `*-hc-*` tokens generated from `tokens.json`; no contrast aliases or override vars remain.
- Forced-colors media block retains semantic styling but without `!important`; verify in Windows HC to ensure UA precedence is sufficient.
- Next suggested cleanup: consolidate repeated `.contrast-high` selectors into reusable HC utilities/Tailwind variants and move any inline component colors to token-driven classes to keep globals lean.
