# Media Authoring Guidelines

## Objectives
- Ship responsive, modern-format imagery that keeps Largest Contentful Paint (LCP) under budget on desktop and mobile.
- Provide a predictable workflow for adding hero art, inline illustrations, and MDX images without bypassing optimisation.
- Document responsibilities so contributors know which props, sizes, and formats are required for Core Web Vitals compliance.

## Adding hero or feature imagery
- Define media metadata in `apps/site/src/utils/dictionaries.ts`. Provide the public path, `alt` text, intrinsic `width`/`height`, and (optionally) a `blurDataURL`.
- `ShellLayout` consumes the media descriptor and renders it via the shared `<ResponsiveImage>` component, which enforces the `hero` size preset and eager loading.
- Store artwork in `apps/site/public/media/*`. Prefer AVIF/WebP sources; SVG is acceptable for vector art. Commit hashed filenames when exporting from design tools to avoid stale caches.
- When introducing new hero art, validate `pnpm --filter @portfolio/site run build` to ensure Next.js can statically analyse the asset and generate responsive candidates. Check the resulting `lighthouse-report` artifact for LCP regressions.

## Inline and MDX images
- MDX `<img>` elements automatically render through `<ResponsiveImage>` so we retain optimisation. Always include `width` and `height` attributes in markdown—missing dimensions fall back to `1200x720`, which may distort the asset.
- For React components, import and use `<ResponsiveImage>` directly. Choose the preset that matches context (`hero`, `content`, or `inline`) or pass a custom `sizes` string.
- Remote images must match an entry in `next.config.mjs#images.remotePatterns`. Update the allowlist and document the source before merging.

## Quality guardrails
- Image quality defaults to `82` (tuned for WebP/AVIF). Override sparingly and document the rationale in the PR description.
- ESLint blocks raw `<img>` tags in Next.js projects via `@next/next/no-img-element`. This guarantees we do not bypass optimisation.
- Lighthouse CI budgets (Task 8.0) track media transfer sizes; monitor the “Largest Contentful Paint element” diagnostic to confirm hero art remains within the defined thresholds.

## Verification checklist
1. Run `pnpm --filter @portfolio/site run build` and confirm no warnings about missing image dimensions.
2. Execute `pnpm --filter @portfolio/site run lhci:collect <preview-url>` or review the CI artifact to verify LCP remains under 1.5s.
3. Manually test responsive breakpoints (`cmd+opt+j` → Lighthouse device emulation or Chrome DevTools) to ensure the `sizes` hint selects the expected intrinsic widths.
4. Update this document when adding new presets, helper utilities, or external optimisation services.
