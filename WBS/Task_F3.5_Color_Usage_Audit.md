# Task F3.5 — Color Usage Audit (Light Theme Tokens)

Purpose: provide a quick, component-level guide for where the light theme color tokens are used. These are semantic Tailwind utilities (e.g., `bg-background`, `text-text`) that resolve to the light-* tokens at runtime. This is meant as a prompt reference for downstream reasoning, not a complete design spec.

## Token → Usage Map

### background
- Page canvas and core layout wrappers.
- Usage:
  - App root: `apps/site/app/layout.tsx`
  - Shell layout root: `apps/site/src/components/Shell/Layout.tsx`
  - Mobile shell root: `apps/site/src/components/Shell/MobileShellLayout.tsx`
  - Notes page root: `apps/site/app/[locale]/notes/[slug]/page.tsx`
  - Chatbot panel and inputs: `apps/site/src/components/chat/ChatbotProvider.tsx`

### surface
- Primary panels/cards (header, footer, cards, nav containers, panels).
- Usage:
  - Header background: `apps/site/src/components/Shell/Layout.tsx`
  - Footer background: `apps/site/src/components/Shell/Footer.tsx`
  - Anchor nav container: `apps/site/src/components/Shell/AnchorNav.tsx`
  - Sticky CTA panel: `apps/site/src/components/Shell/StickyCTA.tsx`
  - Accordion items: `packages/ui/src/lib/Accordion.tsx`
  - Tabs list + panels: `packages/ui/src/lib/Tabs.tsx`
  - Tooltip container: `packages/ui/src/lib/Tooltip.tsx`
  - Stat tile card: `packages/ui/src/lib/StatTile.tsx`
  - Chatbot header + panels: `apps/site/src/components/chat/ChatbotProvider.tsx`

### surfaceMuted
- Secondary surfaces and subtle fills (hover states, card interiors).
- Usage:
  - Accordion content: `packages/ui/src/lib/Accordion.tsx`
  - Tabs trigger hover: `packages/ui/src/lib/Tabs.tsx`
  - Chip neutral variant: `packages/ui/src/lib/Chip.tsx`
  - Stat tile icon + neutral trend pill: `packages/ui/src/lib/StatTile.tsx`
  - Chatbot references + helper panels: `apps/site/src/components/chat/ChatbotProvider.tsx`
  - Audio player gradients/overlays: `apps/site/src/components/AudioPlayer.tsx`

### border
- Default borders and dividers on containers and controls.
- Usage:
  - Header/footer borders: `apps/site/src/components/Shell/Layout.tsx`, `apps/site/src/components/Shell/Footer.tsx`
  - Anchor nav + return-to-top button: `apps/site/src/components/Shell/AnchorNav.tsx`
  - Sticky CTA panel: `apps/site/src/components/Shell/StickyCTA.tsx`
  - Accordion items: `packages/ui/src/lib/Accordion.tsx`
  - Tabs list + panels: `packages/ui/src/lib/Tabs.tsx`
  - Tooltip borders: `packages/ui/src/lib/Tooltip.tsx`
  - Chatbot panel, inputs, and sections: `apps/site/src/components/chat/ChatbotProvider.tsx`

### borderSubtle
- Used only as the subtle border on CTA buttons inside the sticky CTA container.
- Usage:
  - `.shell-sticky-cta :is(a, button)` in `apps/site/app/globals.css`

### text
- Primary copy color.
- Usage:
  - Layout root and body copy: `apps/site/src/components/Shell/Layout.tsx`
  - Accordion text: `packages/ui/src/lib/Accordion.tsx`
  - Chatbot content: `apps/site/src/components/chat/ChatbotProvider.tsx`

### textMuted
- Secondary labels, captions, helper text, and metadata.
- Usage:
  - Shell subtitle/eyebrow: `apps/site/src/components/Shell/Layout.tsx`
  - Footer small print: `apps/site/src/components/Shell/Footer.tsx`
  - Note header metadata: `apps/site/src/components/mdx/NoteHeader.tsx`
  - Chatbot metadata, hints, and footers: `apps/site/src/components/chat/ChatbotProvider.tsx`

### accent
- Primary CTA and emphasis color.
- Usage:
  - Primary buttons: `packages/ui/src/lib/Button.tsx`
  - Accent chips: `packages/ui/src/lib/Chip.tsx`
  - Active tabs + selected nav items: `packages/ui/src/lib/Tabs.tsx`, `apps/site/src/components/Shell/AnchorNav.tsx`
  - Chatbot launcher: `apps/site/src/components/chat/ChatbotPortalMount.tsx`
  - Inline callouts/links on home: `apps/site/app/[locale]/page.tsx`

### accentHover
- Hover state for accent elements.
- Usage:
  - Primary buttons: `packages/ui/src/lib/Button.tsx`
  - Chatbot launcher hover: `apps/site/src/components/chat/ChatbotPortalMount.tsx`

### accentOn
- Text/icon color on accent backgrounds.
- Usage:
  - Primary buttons + chips: `packages/ui/src/lib/Button.tsx`, `packages/ui/src/lib/Chip.tsx`
  - Active tabs: `packages/ui/src/lib/Tabs.tsx`
  - Chatbot launcher + user bubbles: `apps/site/src/components/chat/ChatbotPortalMount.tsx`, `apps/site/src/components/chat/ChatbotProvider.tsx`

### danger
- Error/alert styling and negative trends.
- Usage:
  - Badge danger variant: `packages/ui/src/lib/Badge.tsx`
  - Stat tile downward trend pill: `packages/ui/src/lib/StatTile.tsx`
  - Chatbot error banners + close button ring: `apps/site/src/components/chat/ChatbotProvider.tsx`

### attention
- Attention surface highlight for the chatbot close button hover/outline.
- Usage:
  - `ATTENTION_SURFACE` in `apps/site/src/components/chat/ChatbotProvider.tsx`

## Notes
- Theme tokens are wired into Tailwind via `tailwind.config.mjs` and `packages/config/tailwind/index.cjs` using semantic utilities (`bg-background`, `text-text`, etc.).
- This audit focuses on light-theme tokens but the same semantic utilities swap to dark/high-contrast variants through CSS variables.
