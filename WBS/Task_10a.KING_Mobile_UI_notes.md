# Task 10a.KING — Mobile UI attempt notes

This note captures the context from the recent mobile UI exploration before code is reverted. Use it as a jumpstart if/when re-applying the work.

## What changed (now being reverted)
- **Mobile controls drawer** (`apps/site/src/components/Shell/MobileControlsSheet.tsx`, now removed): left-side overlay with dimmed backdrop bundling theme/contrast/language sliders and skim toggle for small screens; added safe-area padding and escape-to-close.
- **Header layout tweaks** (`apps/site/src/components/Shell/Layout.tsx`): injected the mobile controls sheet above breadcrumbs, hid top controls on small screens, kept desktop controls; temporarily moved CTA bar inline on mobile (CTA still sidebar on desktop after later adjustments).
- **Audio player experiments** (`apps/site/src/components/AudioPlayer.tsx`): multiple iterations to make a mobile bottom sheet and desktop card; ultimately restored the original compact desktop overlay (right-side float) while leaving a simple mobile view. Expect this file to be reverted.
- **Mobile-mode telemetry** (`apps/site/src/components/telemetry/MobileModeTelemetry.tsx`, now removed): dispatches `mobile_mode_detected` once per session when `(max-width: 768px)` matches, including locale and viewport in the event detail.
- **Top-bar copy additions** (`apps/site/src/utils/i18n.ts`): added menu labels (`openLabel`, `closeLabel`, `controlsTitle`, `trayDescription`) to localize the mobile controls drawer.
- **WBS doc** (`WBS/Task_10a.KING_Mobile_UI.md`): scoped mobile plan, requirements, decisions (CTA inline bar above tech stack, mobile-mode telemetry required, audio player defaults open on mobile).

## Intended behaviors (if re-applying later)
- Mobile: top bar shows a “Menu” control that opens the drawer with theme/contrast/language + skim toggle; CTA cluster appears inline under hero intro (above tech stack); audio player defaults open as bottom sheet with safe-area padding.
- Desktop: header controls + skim toggle visible inline; CTA stack in sidebar; audio player as right-side floating overlay (original style), not redesigned.
- Telemetry: `mobile_mode_detected` custom event fires once on mobile viewport match; media player events unchanged (`media_player_play|pause|ended`).

## Known issues/cleanup to watch for
- Header controls/skim visibility toggled several times; ensure desktop/tablet still render controls after re-adding drawer.
- AudioPlayer saw heavy churn; verify only one `<audio>` element and that desktop/mobile overlays don’t both render when reapplying changes.
- Mobile CTA placement and shell gutters may need re-validation after revert/re-apply (risk of duplicate CTA render spots).

## Re-apply tips
- Reintroduce the drawer by importing `MobileControlsSheet` in `Shell/Layout.tsx` and rendering it above breadcrumbs; keep desktop controls visible.
- Keep mobile telemetry opt-in by mounting `MobileModeTelemetry` in the layout.
- If reinstating the mobile bottom sheet for audio, gate with `md:hidden` and keep the classic desktop overlay for `md+`; reuse a single audio element.
- Restore localized menu labels from `getTopBarCopy` additions in `i18n.ts` if they get reverted.

Document owner: Jack Featherstone. Update if mobile work resumes.***
