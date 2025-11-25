# Task 10a.KING — Media Player

## Objective
Add a small, branded audio player that can play a single MP3 with native controls plus a custom play/pause toggle, so visitors can hear a short clip (greeting or loopable background track) without leaving the page.

## Current Pain
- No on-site audio; visitors cannot sample voice/tone without external links.
- No place to host short-form audio in the design system; every attempt would be a one-off `<audio>` drop-in with inconsistent styling.
- Accessibility and autoplay concerns are unresolved, so audio is currently avoided.

## Inputs & Dependencies
- Next.js app router page shells (`apps/site/app/[locale]/page.tsx`) and shared Shell layout patterns.
- UI kit primitives (`@portfolio/ui` Button, tokens) for consistent controls.
- Localization dictionaries (`apps/site/src/utils/dictionaries.ts`) for labels, aria text, and captions.
- Public asset pipeline for static files (`apps/site/public/**/*`).

## Requirements Overview
- Single-track player targeting one hosted MP3 under `public/media/audio/`.
- Native `<audio controls>` for baseline accessibility; add a custom play/pause button that mirrors state.
- Show track title and duration; include a download link fallback.
- No autoplay; default volume uses browser defaults; preload `metadata` only.
- Respect light/dark themes and skim mode; compact footprint; render as a floating overlay anchored bottom-right on the home page. Attempt to persist across client-side navigation; if remounting is required, keep graceful resume.

## Feature Behavior
- Clicking the custom play button starts playback; toggling pauses; native controls stay in sync.
- Track is loop-enabled once playing (background music). If loop is disabled or unavailable, ending playback resets to “paused”.
- If the browser blocks autoplay, the first click must succeed without extra prompts.
- Surface a small progress + elapsed/total time text; allow seeking via the native control bar.
- Provide a fallback link to download the MP3 if the player fails to load.

## UI & Interaction
- `AudioPlayer` component with optional props: `src`, `title`, `description`, `ctaLabel`/`downloadLabel`.
- Layout: card-style container with title, description, custom play/pause button, time display, and the native control bar beneath.
- Use `Button` from `@portfolio/ui` for the play/pause toggle; Tailwind utility classes for spacing/typography aligned to the Shell.
- Present the player as a floating overlay in the bottom-right corner of the viewport on `/[locale]`, with an affordance to close/minimize; ensure it feels consistent with the hero CTA stack that can link/scroll to it.

## Accessibility
- `aria-label` on the custom button reflecting state (“Play clip”, “Pause clip”).
- Associate labels with the `<audio>` element; ensure focus ring from design tokens is visible.
- Provide text description and a download anchor for screen readers.
- Respect reduced motion; avoid animated equalizers unless gated.

## Telemetry & Perf
- Emit telemetry for play/pause (and optionally ended) via existing plumbing using event names `media_player_play`, `media_player_pause`, and `media_player_ended`, including locale and track id.
- Keep MP3 < 2–3 MB to avoid layout shift and slow TTFB; consider `preload="metadata"` only.
- No external streams; asset ships with the app for offline-friendly caching.

## Implementation Plan
1. **Asset & Copy**
   - Place the MP3 at `apps/site/public/media/audio/<slug>.mp3`.
   - Add localized strings for title, description, play/pause labels, and download text in `dictionaries`.
2. **Component**
   - Create `apps/site/src/components/AudioPlayer.tsx` (client) using `<audio>` with `controls` + a custom `Button`.
   - Manage `isPlaying`, `duration`, and `currentTime` via `useRef` + event listeners (`loadedmetadata`, `timeupdate`, `ended`), and support `loop` playback once started.
   - Render time in `mm:ss`, show a download link, and guard against missing `src`.
3. **Styling**
   - Apply a card container (border, surface background, subtle shadow) matching Shell aesthetics; ensure dark-mode tokens are used.
   - Align spacing/typography with existing section patterns; ensure the native control bar width fits mobile.
4. **Integration**
   - Mount the overlay player on `/[locale]` (and optionally layout-wide) so it anchors bottom-right; wire a hero CTA or inline link to focus/scroll to the overlay.
   - If feasible, host the player at the layout level to avoid remounting during client-side navigation; otherwise, ensure state restore/resume is graceful per page.
   - Optional: add a small “listen” CTA in the hero or CTA stack pointing to the player anchor.
5. **QA & Tests**
   - Unit test the component (`apps/site/src/components/__tests__/AudioPlayer.test.tsx`) to assert play/pause calls, ended reset, and time formatting.
   - Add a minimal a11y/unit assertion for button labels and download link presence.
   - Manual sanity on desktop/mobile, light/dark, and reduced-motion.
6. **Docs & Changelog**
   - Note the feature in `COMPLETED_TASKS.md` once shipped; add a brief entry to `CHANGELOG.md` if required.

## Acceptance Criteria
- MP3 is hosted at `/media/audio/<slug>.mp3` and plays in modern browsers without console errors.
- Custom play/pause button stays in sync with the native control bar; when looping is off or unavailable, ending playback resets to paused.
- Labels (play/pause/download) are localized; the player renders on all locales without crashing if a locale is missing the asset (guarded fallback).
- Player renders as a floating overlay anchored bottom-right on the home page, respects dark mode/skim mode, fits mobile viewports, and shows time formatting.
- Looping works when enabled; no autoplay; playback can resume gracefully after navigation or remount.
- Unit tests for play/pause sync and time display pass; manual a11y check shows focusable controls with readable labels.
- Telemetry events (`media_player_play`, `media_player_pause`, optional `media_player_ended`) fire with locale and track id payloads.

## Risks & Mitigations
- **Autoplay blocks or promise rejections** — Keep autoplay off; catch `audio.play()` promise and surface a non-blocking toast/inline hint if needed.
- **Large asset weight** — Cap file size and optionally provide a trimmed sample; consider compressing to ~128–192 kbps.
- **Locale asset gaps** — Guard with a text-only fallback + download link; avoid hard crashes if the MP3 is missing.

## Answered Questions
- Which page/section should host the player (home hero, proof section, or a dedicated “Audio note” block)?
  - Home page, as a dedicated MediaPlayer overlay anchored bottom-right. Desire (nice-to-have) for playback to persist across client navigation; if not possible, degrade gracefully.
- What clip content and length are desired (greeting, narration sample, or background loop)?
  - Loopable background song (supplied MP3) rather than a voiceover; looping should be supported once playback starts.
- Should telemetry for play/pause be recorded, and if so, which schema/event names to use?
  - Yes: emit `media_player_play` and `media_player_pause` (and optionally `media_player_ended`) through existing telemetry, including locale and track id.

Document owner: Jack Featherstone. Update this plan as scope evolves during 10a.KING.
