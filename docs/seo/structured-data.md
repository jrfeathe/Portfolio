# Structured Data & JSON-LD

Task [9.0 – Schema & Resume JSON-LD](../../WBS/Task_9.0_Schema_and_Resume_JSONLD.md) establishes the canonical schema graph for the portfolio. Every public route renders a single CSP-compliant `<script type="application/ld+json">` block with the nonce supplied by the security middleware, so search engines can associate the same `Person`, `WebSite`, `BreadcrumbList`, and `Article` entities across locales.

## Authoritative data sources

- `content/resume.json` feeds `getResumeProfile()` (`apps/site/src/lib/resume/profile.ts`), which trims placeholder contact details, exposes public-safe summaries, and pins the allowed `sameAs` links (GitHub, LinkedIn, and `https://placeholder.onion` until the Tor mirror is live). Update the JSON file and rerun the structured-data tests to propagate changes.
- `apps/site/src/lib/seo/jsonld.ts` centralizes the schema graph and keeps shared IDs stable:
  - `PORTFOLIO_BASE_URL` is set to `https://jrfeathe.com` as the proposed domain. Swap this constant once the domain is purchased; search engines will pick up the new canonical URLs automatically.
  - `PERSON_ID` and `WEBSITE_ID` anchor the `Person` and `WebSite` nodes so detail routes can reference them without redefining the payload.
- Route components load the resume profile, call the matching builder (`buildHomePageJsonLd`, `buildNotesIndexJsonLd`, `buildNoteDetailJsonLd`), and render `<StructuredData data={...} />`. The component reads the nonce from the current headers (matching `data-csp-nonce` on `<body>`) and escapes JSON safely via `escapeJsonForHtml`.
- Resume downloads (`/resume.json`, `/resume.pdf`) share the same sanitized contract. See [docs/resume/publishing.md](../resume/publishing.md) for regeneration and validation steps.

When the Tor mirror ships, replace `https://placeholder.onion` with the real address inside `profile.ts` and rerun the tests. The public schema will advertise both the clear-web domain and the mirror automatically.

## Validation workflow

1. **Unit tests** – Run `pnpm --filter @portfolio/site test structured-data` to execute the resume transformer, JSON-LD generator, and `<StructuredData>` component tests without touching other suites.
2. **Playwright coverage** – Execute `pnpm --filter @portfolio/site run playwright:test -- tests/structured-data.spec.ts` (or let the full Playwright suite run) to hit `/en`, `/en/notes`, and `/en/notes/mdx-pipeline`. Each assertion verifies there is exactly one structured data script, the nonce matches `data-csp-nonce`, and the expected schema types are present.
3. **Rich Results** – Copy the rendered JSON-LD block from devtools and paste it into [Google’s Rich Results Test](https://search.google.com/test/rich-results). Check at least once per locale and route type after resume updates or schema changes. Document the timestamp and screenshot in the relevant task notes when shipping larger updates.

## Extending coverage

- **New routes** – Add a builder in `jsonld.ts` that reuses the shared IDs, then render `<StructuredData>` inside the route component _before_ other markup. Snapshot or lint tests should validate locale-specific titles and breadcrumbs.
- **Resume additions** – Prefer adding fields to `content/resume.json` and mapping them in `getResumeProfile()` instead of hardcoding values. The helper already normalizes language proficiency, experience highlights, and publishes coarse location data (“Upstate New York”, hybrid availability in New York City) per the open-question decisions.
- **Multiauthor notes** – Include an `authors` array in MDX frontmatter; the generator automatically tags Jack as the primary author and adds unique `@id`s for additional contributors (e.g., an eventual “Author: Jack, Other” footer).

Keep this doc updated whenever schema scopes change (e.g., adding `Article` variants for demos or surfacing new resume artifacts) so future tasks can trace requirements back to WBS 9.0.
