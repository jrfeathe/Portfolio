# Task F1.7 – Tech Stack Icon Audit

## Current Size Audit

`du -h apps/site/public/tech-stack/*.svg`

- Most icons range 4–8 KB, but a few are significantly heavier:
  - `kvm.svg` ≈ 36 KB (numerous gradients/filters)
  - `postgresql.svg` ≈ 16 KB
  - `lua.svg`, `c.svg` ≈ 12–16 KB
- Total for 20 icons ≈ 120–160 KB at current sizes before compression; all fetch individually during carousel render.

## Target

- Aim for **≤5 KB per SVG** (gzipped) so the full set is ~100 KB.
- At 100 kb/s (≈12.5 KB/s) that batch loads in ~8 s vs ~12–14 s today; at 100 KiB/s (~102 KB/s) it arrives in ~1 s.
- Keep worst-case icons (complex gradients) ≤8 KB by simplifying paths or using flatter styles.

## Risks on Slow Connections

- 100 kb/s: initial JS bundles (≈500 KB gz), fonts/critical CSS (≈150 KB), hero image(s), and tech icons compete for bandwidth → 40 s+ TTI unless payload shrinks.
- 100 KiB/s: more reasonable (4–6 s), but still sensitive to unnecessary assets.

## Optimization Ideas

1. **SVG optimization**
   - Run SVGO with aggressive plugins (`removeMetadata`, `collapseGroups`, `convertPathData`, `removeUnknownsAndDefaults`, etc.).
   - Remove unused `<defs>`, filters, and metadata; favor flat fills over gradients.
   - Combine recurring icons via a sprite sheet or inline React component to avoid many HTTP requests.

2. **Image delivery**
   - Ensure hero/tech images use AVIF/WebP sources with tight `sizes` hints and lazy loading; ship low-res placeholders.
   - Avoid blocking the main thread with large inline SVGs before first paint.

3. **JS bundle diet**
   - Defer non-critical client components (AudioPlayer, Chatbot) with dynamic imports or `next/dynamic` + `loading` fallbacks.
   - Replace JS-driven layout switches with CSS media queries where possible to cut runtime JS.

4. **Request strategy**
   - Preload only essential assets; keep icons behind the carousel fold and lazy-load when it enters the viewport.
   - Confirm static assets use Brotli/gzip and long-lived cache headers.

5. **Testing**
   - Add lighthouse runs at 3G/Slow 4G profiles; track icon payloads in bundle/perf reports.
   - Monitor real-device telemetry to ensure no asset busts the 5 KB target.

These actions push the mobile experience toward the “max performance” goal for Task F1.7 and set a baseline before Task F2.5’s broader mobile sweep.

## Notes
- Load as packages of SVGs: Load first 8 with site, then next 8 more lazily, then next 8, etc.
- Aim for 2KB compressed per SVG. Max 5KB compressed.
- Compress using Brotli, gzip fallback
