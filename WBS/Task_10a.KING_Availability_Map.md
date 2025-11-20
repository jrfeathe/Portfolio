# Task 10a.KING — Availability Map

## Objective
Replace the static When2Meet screenshot on `/[locale]/meetings` with an interactive availability map that is generated from a single New York–based source of truth, and mirror the data in-region (Beijing for `zh`, Tokyo for `ja`) without manual redraws when daylight saving time or routines change.

## Current Pain
- The page displays `/public/meeting-avail.png`, so every availability change requires rebuilding an external image and committing it.
- Visitors outside Eastern Time have to convert the hours themselves, and there is no guarantee that the screenshot matches the locale copy (especially in ja/zh where the text already references converted windows).
- The image is not accessible (no structured table, no ARIA annotations) and cannot adapt to dark mode or narrow screens.

## Inputs & Dependencies
- Existing meetings route at `apps/site/app/[locale]/meetings/page.tsx` and Shell layout styles.
- Localized strings inside `apps/site/src/utils/dictionaries.ts` for introductions, figure labels, and timezone links.
- Resume availability metadata (`content/resume.json > availability`) to keep messaging in sync.
- Optional references from When2Meet exports to seed the initial JSON.

## Requirements Overview
- **Single canonical dataset**: store availability for `America/New_York` in JSON with 15‑minute granularity and consume it in the meetings page for every locale.
- **Dual chart render**: Always show the canonical New York matrix plus a converted matrix controlled by a timezone dropdown. The dropdown defaults follow the locale (NYC for `en`, Tokyo for `ja`, Beijing for `zh`) but visitors can switch to any supported IANA zone at runtime.
- **Automatic timezone conversion**: derive the local chart by shifting each 15‑minute block with DST awareness (use `Temporal` polyfill or a timezone-safe helper rather than manual offsets).
- **Visible window controls**: support a truncation window (e.g., hide 01:00–09:00 if those slots are always unavailable) so the grid mirrors When2Meet’s whitespace behavior while keeping the full data in JSON.
- **Responsive & accessible layout**: grid must be keyboard reachable, expose textual summaries for screen readers, respect dark mode tokens, and degrade gracefully on small screens.
- **Configurable legend**: highlight common availability blocks, optionally overlay tentative/blocked ranges later, and show timezone labels pulled from the dictionary.

## Data Model
### JSON layout (`apps/site/data/availability/weekly.json`)
```json
{
  "timezone": "America/New_York",
  "intervalMinutes": 15,
  "visibleWindow": { "start": "09:00", "end": "01:00" },
  "days": {
    "sun": {
      "00": { "0": false, "15": false, "30": false, "45": false },
      "01": { "0": false, "15": false, "30": false, "45": false },
      "08": { "0": true, "15": true, "30": true, "45": true }
    },
    "mon": {
      "07": { "0": true, "15": true, "30": true, "45": true }
    }
    // …
  }
}
```
- Keep day keys lowercase (`sun`…`sat`) for predictable ordering.
- Each hour block is 24h‑formatted; values are booleans where `true` = commonly available.
- Future metadata (e.g., `"notes"`, `"exceptions"`, `"updated_at"`) can be appended without breaking the parser.
- `visibleWindow.start`/`end` describe the earliest and latest times (inclusive) that should be rendered in the matrix, measured in the canonical timezone. Times outside the window stay in JSON for conversion accuracy but collapse into whitespace in the UI.

### Timezone presets
- Surface the full `Intl.supportedValuesOf("timeZone")` list when available so visitors can compare against any location. Fallback to a small curated list when the API is missing.
- Store labels + locale-specific defaults in `localeTimezones` so the dropdown can preselect the right option without forking component logic.

### TypeScript helpers
- Create `apps/site/src/lib/availability.ts` with:
  - `type AvailabilityMatrix = Record<Weekday, Record<Hour24, QuarterHourMap>>`.
  - `readAvailability()` to import the JSON during build (Node) and `getAvailability()` for runtime (client) using dynamic `import`.
  - `toBlocks({ timezone: "America/New_York" }, targetTZ)` that:
    1. Chooses a reference ISO week (e.g., the upcoming Sunday) via `Temporal.ZonedDateTime.from`.
    2. Iterates through each block, converts to the target timezone using `withTimeZone`, and buckets results back into the same 15‑minute grid.
  - `summarizeAvailability(matrix)` returning human-readable windows for the `<p>` fallback copy.
- `applyVisibleWindow(matrix, window)` trims the rendered row list while preserving metadata for conversion/export scenarios.
- Ship unit tests under `apps/site/src/lib/__tests__/availability.test.ts` covering DST transitions (e.g., March forward, November fallback).

## UI & Interaction
### Layout
- Replace the `<Image>` figure with a `AvailabilitySection` component:
  - `AvailabilityMatrix` renders a 7 × 96 grid (columns = days, rows = 24*4 quarter hours) with CSS grid.
  - Each cell uses Tailwind utility classes tied to theme tokens, with transitions to show hover/focus but no flashing animations.
  - Column headers show localized day abbreviations (dictionary entries per locale).
  - Row labels show every hour on desktop; collapse to 2‑hour anchors on mobile with sticky left rail.
- Render two matrices everywhere: the canonical New York view (not hidden) and a converted view controlled by a timezone dropdown.
  - The dropdown surfaces the entire IANA list (or curated fallback), defaults to the locale-specific zone, and updates the converted matrix immediately without page reloads.
  - On ≥1024 px, render matrices side-by-side; stack vertically on smaller screens while keeping captions and dropdown accessible.
- Apply the `visibleWindow` truncation client-side by hiding rows outside the configured window and inserting a labeled spacer (“Outside Jack’s typical hours”) similar to When2Meet’s whitespace.
- Provide tooltip or caption text clarifying “Green = recurring availability, white = typically unavailable”. Colors pulled from existing surface/accent tokens; avoid introducing new palette.

### Accessibility
- Wrap each matrix in `<figure>` with `<figcaption>` text from the dictionary plus dynamic timezone labels, e.g., “Common availability · America/New_York (UTC−05/UTC−04)”.
- Add visually hidden `<table>` semantics using `role="grid"`, row/column headers, and `aria-label` describing timezone and interval.
- Provide a `<dl>` summary listing each day’s contiguous windows for screen-reader-only consumption.
- Ensure focus styles meet 3:1 contrast; arrow-key navigation may be deferred but tabbing through columns should not trap focus.
- The timezone dropdown must expose a visible label, announce the active timezone, and support keyboard navigation + screen-reader feedback when the converted matrix updates.

## Locale & Timezone Rules
- `en`: default dropdown selection stays on `America/New_York`, so both matrices show the same data initially while still permitting conversion to other zones.
- `ja`: dropdown defaults to `Asia/Tokyo`; copy references Tokyo conversions and timezone links can point to a JP clock if helpful.
- `zh`: dropdown defaults to `Asia/Shanghai` (Beijing time); copy references Beijing conversions and timezone links can swap to a CN clock.
- Add a `localeTimezones` map in `apps/site/src/utils/i18n.ts` to describe each locale’s default timezone + fallback label so future locales (e.g., `es-MX`) can preselect their region without touching the component.

## Implementation Plan
1. **Data ingestion**
   - Add `apps/site/data/availability/weekly.json` (including `visibleWindow`) and corresponding TypeScript types.
   - Provide a CLI snippet (optional script under `scripts/availability/`) to regenerate the JSON from When2Meet CSV exports.
2. **Timezone helpers**
   - Install `@js-temporal/polyfill` (or `luxon` if preferred) to avoid manual DST math.
   - Implement conversion helpers + tests ensuring `America/New_York` ⇄ Asia timezones round-trip per 15‑minute block.
3. **Component build**
   - Create `AvailabilityMatrix.tsx` + `AvailabilityLegend.tsx` under `apps/site/src/components/meetings/`.
   - Style via Tailwind modules scoped to the meetings page to minimize global CSS churn.
   - Replace the `<Image>` usage in `apps/site/app/[locale]/meetings/page.tsx` with the new component(s).
   - Add the timezone dropdown + spacer to host the converted chart, wire it into the conversion helper, and respect locale defaults.
   - Apply the `visibleWindow` rules so the rendered matrix hides the configured hours while keeping data accessible for conversion/export.
4. **Localization updates**
   - Extend `dictionary.meetings` with:
     - `availability.primaryLabel`, `availability.referenceLabel`, `availability.legend`.
     - Day-of-week and timezone label overrides for ja/zh if needed.
   - Update copy mentioning the static screenshot so it now references “interactive map”.
5. **QA & docs**
   - Add Playwright coverage in `apps/site/tests/meetings.availability.spec.ts` verifying both matrices render and switch labels per locale.
   - Update `CHANGELOG.md` + `COMPLETED_TASKS.md` entry once shipped.

## Acceptance Criteria
- `/en/meetings`, `/ja/meetings`, `/zh/meetings` load without runtime warnings and meet current Lighthouse/axe thresholds.
- Editing `weekly.json` immediately updates both English and localized charts without extra assets.
- Time conversion verified against `timeanddate.com` for at least two DST states.
- Screen readers announce the timezone + summary so the chart is understandable without visuals.
- Playwright/Jest suites covering the new helpers/components pass in CI.
- Timezone dropdown defaults follow the locale, but selecting another zone updates the converted chart in place and persists via query/state without refresh.
- Rows outside the configured `visibleWindow` stay hidden in the visual grid while summaries/ARIA output still describe the full 24h span.

## Resolved Questions
- **Timezone toggle scope** — Provide a dropdown so any visitor can convert to their preferred timezone, with locale-driven defaults.
- **Exception overlay** — Out of scope; we only surface recurring availability.
- **Download/export** — Not required; the visual + textual summaries suffice for now.

Document owner: Jack Featherstone. Update this spec if scope or dependencies change during 10a.KING.
