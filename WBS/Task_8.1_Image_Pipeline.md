# Task 8.1 — Image Pipeline & Delivery

**Status:** Completed 2025-Nov-04

## Objective
Guarantee image assets across the portfolio ship in modern formats, optimal dimensions, and cache-friendly delivery paths so pages consistently meet Core Web Vitals LCP targets without sacrificing visual quality on retina and large-display devices.

## In Scope
- Auditing all image usage in `apps/site` (hero art, proof chips, case study thumbnails, avatars, diagrams) and classifying them by required breakpoints, DPR targets, and rendering contexts (inline vs. background assets).
- Migrating static imagery to `next/image` (or `<Image>` wrappers in `@portfolio/ui`) with responsive `sizes` hints, `fill`/`priority` usage where appropriate, and integration with the performance budgets defined in Task 8.0.
- Automating modern format generation (AVIF/WebP fallback + original) via Next.js image optimization or a custom build step for statically imported assets (`apps/site/public`, `content/**`, `scripts/images/**`).
- Implementing a deterministic file naming scheme and content-hash strategy so cached images invalidate predictably on change.
- Documenting authoring guidance for new images (ideal aspect ratios, resolution targets, compression tips) within `docs/media-guidelines.md` or equivalent.

## Out of Scope
- Reworking illustration art direction or creating net-new image assets beyond compressing/slicing existing ones.
- Shipping a full media CDN migration; this task assumes Vercel Image Optimization (or equivalent default host) is sufficient.
- Video or animated GIF optimization (tracked separately).

## Deliverables
- Updated components/pages (`apps/site/src/app/(home)/**`, `apps/site/src/components/**`) replacing `<img>` tags with `next/image` usage including `sizes`, `alt`, and `placeholder` strategies.
- A shared image helper (e.g., `apps/site/src/lib/images.ts` or `packages/ui/image.tsx`) encapsulating common configuration for priority images, blur placeholders, and width mappings.
- Automated script or configuration (`scripts/performance/prepare-images.mjs`, Next.js config tweaks) that ensures AVIF/WebP variants and hashed filenames are generated during `pnpm --filter @portfolio/site build`.
- Documentation updates covering image authoring, including a quick checklist added to `docs/testing.md#performance` or a new `docs/media-guidelines.md`.
- Tests/linters (e.g., ESLint rule or unit test) that flag raw `<img>` usage in the site bundle unless explicitly exempted.

## Acceptance Criteria
- Lighthouse LCP opportunities no longer flag oversized or unoptimized images for primary hero/above-the-fold assets on desktop or mobile runs.
- `pnpm --filter @portfolio/site build` emits responsive image metadata without regressions to existing routes; budgets in `performance-budgets.json` stay within thresholds.
- No raw `<img>` tags remain in `apps/site/src` except intentionally whitelisted cases (e.g., RSS embeds) documented in code comments.
- Critical imagery (hero, avatar, key case studies) serves AVIF (with WebP fallback) for browsers that support it, confirmed via manual inspection or automated check.
- Documentation clearly outlines how to add/replace images and is discoverable from Task 8.x references.

## Implementation Plan

1. **Inventory & classify assets**
   - Use `rg "<img"` or component audit to list all image usage in `apps/site`.
   - Capture dimensions, aspect ratios, and contexts (fold position, inline, decorative) in a tracking table appended to this doc.
   - Identify candidates that can leverage blur placeholders or skeletons.

2. **Establish shared helpers**
   - Create a typed wrapper around `next/image` that enforces default `sizes`, `loading`, and quality settings.
   - Encode breakpoint widths (e.g., `[320, 640, 960, 1280, 1600]`) and map them to layout contexts (hero, gallery, inline).
   - Add ESLint rule or custom lint to prevent bypassing the helper without justification.

3. **Migrate components**
   - Update hero, proof chips, notes list, gallery components, and any MDX image renderer to use the helper.
   - For MDX/content images, ensure remark plugins (if any) pass width/height metadata into the component.
   - Validate `priority` and `preload` usage for fold-critical assets; confirm `fetchpriority="high"` for the hero image.

4. **Optimize build pipeline**
   - Configure `next.config.mjs` (or `apps/site/next.config.mjs`) to enable AVIF/WebP, custom device sizes, and `images.remotePatterns` if external sources exist.
   - Add script (if needed) to pre-process local assets (e.g., `sharp`-based converter) for static imports unused by Next optimization.
   - Ensure generated artifacts respect cache headers and hashed filenames; integrate with CI budgets (Task 8.0) by logging aggregate image payload size.

5. **Test & document**
   - Run `pnpm --filter @portfolio/site build` and `pnpm --filter @portfolio/site run lhci:collect` to capture LCP deltas.
   - Document authoring workflow, including recommended max dimensions and compression tooling, in docs.
   - Link documentation and lint outputs back to this task for future contributors.

## Risks & Mitigations
- **Image helper misuse** — Developers may bypass the helper; enforce via ESLint rule and code review checklist.
- **Build performance regressions** — Additional format generation can slow builds; mitigate via caching and limiting variant counts to necessary breakpoints.
- **Quality degradation** — Over-aggressive compression may hurt visuals; bake quality thresholds into helper defaults and document override process.
- **External image hosts** — Remote images could bypass optimization; whitelist domains intentionally and consider proxying through the Next.js optimizer.

## Open Questions
- Do we need to support art-directed crops (different aspect ratios per breakpoint) for hero imagery? If so, should the helper accept breakpoint-specific sources?
- Should we pre-generate blur placeholders (e.g., base64 traces) at build time or rely on Next.js `placeholder="blur"` auto-generation?
- Are there future plans for dynamic image content (e.g., CMS uploads) requiring an external optimizer or CDN integration?
