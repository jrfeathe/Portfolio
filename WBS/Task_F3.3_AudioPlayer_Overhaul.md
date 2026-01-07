# Task F3.3 AudioPlayer Overhaul

## Overview
Redesigned the AudioPlayer for mobile to match the new mini-player UI and improved the desktop layout for parity. The work focuses on usability, positioning, and interaction reliability across mobile and desktop, while preserving existing playback and telemetry behavior.

## Goals
- Deliver a Spotify-style mini-player on mobile with scrubbing and draggable positioning.
- Keep audio playing when the UI is hidden.
- Align desktop controls with the mobile icon set and add a scrub bar.
- Avoid UI overlap with the AI launcher on mobile.
- Provide a vertical volume tray that flips direction based on screen position.

## Implementation Summary
- Mobile mini-player:
  - Rebuilt the bottom player as a compact card with scrubber and time readout.
  - Added draggable repositioning anywhere on screen; drag ignores taps on controls.
  - Added a top-left overlay close button using the same x character as the mobile menu.
  - Reserved space for the AI launcher by reducing the player width.
  - Unhide button mirrors the mobile menu open button styling and uses a speaker icon.
  - Download action uses a floppy disk emoji.
  - Volume tray opens vertically and flips down when the player is in the top 30 percent of the viewport.
- Desktop player:
  - Added a scrub bar beneath the time chip.
  - Updated download icon to a floppy disk emoji.
  - Updated hide/unhide icons to match mobile (x to hide, speaker to reopen).
- Playback and state:
  - Audio continues playing when the UI is hidden.
  - Reattached audio event listeners on variant changes to fix mobile state updates.
- Layout polish:
  - Mobile footer gets extra bottom padding to prevent overlap with floating controls.
  - Desktop footer padding remains normal; mobile-only padding is enforced via a custom class.

## Files Updated
- apps/site/src/components/AudioPlayer.tsx
- apps/site/src/components/Shell/Footer.tsx
- apps/site/app/globals.css

## Behavior Notes
- Mobile player can be repositioned freely; it does not auto-dismiss on drag.
- Volume tray direction is based on the player position in the viewport.
- Hiding the player does not pause playback.

## QA Notes
- Verify mobile play/pause and time updates.
- Check dragging on touch does not interfere with control taps.
- Confirm volume tray flips direction near the top of the screen.
- Confirm footer padding is mobile-only and desktop spacing remains normal.
