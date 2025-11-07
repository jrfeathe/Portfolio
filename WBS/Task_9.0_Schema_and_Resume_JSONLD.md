# Task 9.0 - Schema & Resume JSON-LD

## Objective
Expose authoritative structured data for the portfolio so search engines can parse the owner profile, site hierarchy, and individual notes. Build a JSON-LD generator backed by `content/resume.json`, inject CSP-compliant `<script type="application/ld+json">` payloads per route, and verify the output with automated tests and Rich Results tooling.

## In Scope
- Creating `apps/site/src/lib/seo/jsonld.ts` with typed helpers that assemble `Person`, `WebSite`, `WebPage`, `BreadcrumbList`, and `Article` entities sourced from resume data and per-route metadata.
- Adding a lightweight resume transformer (`apps/site/src/lib/resume/profile.ts` or similar) that normalizes `content/resume.json` into a sanitized, public-facing shape (handles missing contact fields, maps `sameAs` URLs, and provides role/history highlights for article schema).
- Shipping a reusable `<StructuredData>` component in `apps/site/src/components/seo/StructuredData.tsx` that respects the CSP nonce exposed on `<body data-csp-nonce>` and escapes JSON safely.
- Updating core routes to emit JSON-LD:
  - `/[locale]` home page exposes `Person`, `WebSite`, and a breadcrumb trail.
  - `/[locale]/notes` lists `BreadcrumbList` + `CollectionPage`.
  - `/[locale]/notes/[slug]` emits `Article` metadata (headline, dates, tags) and links back to the canonical person/website entities.
- Adding unit tests around the generator (schema snapshots, date/locale handling) and Next.js route tests that assert the rendered HTML includes exactly one structured data script with the expected nonce.
- Documenting the workflow in `docs/seo/structured-data.md` (how to run tests, update resume fields, and validate via Google Rich Results).

## Out of Scope
- Publishing `/resume.json` and `/resume.pdf` downloads (covered by Task 9.1).
- Authoring `JobPosting`, `Event`, or other niche schema types beyond the portfolio's current surfaces.
- Automating third-party validation submissions (Search Console onboarding, sitemaps) beyond documenting the manual Rich Results check.

## Deliverables
- `apps/site/src/lib/seo/jsonld.ts` exporting pure generator functions with TypeScript types (consider `schema-dts` interfaces) and Jest coverage.
- `apps/site/src/lib/resume/profile.ts` (or equivalent) that loads `content/resume.json`, strips placeholders, and exposes derived fields (headline, locations, links, skills) for schema builders.
- `apps/site/src/components/seo/StructuredData.tsx` plus wiring updates to `apps/site/app/layout.tsx`, `/[locale]/page.tsx`, and `/[locale]/notes` routes to render structured data scripts with the CSP nonce.
- Playwright or integration spec (e.g., `apps/site/tests/structured-data.spec.ts`) that requests key routes and verifies `application/ld+json` coverage and validity.
- `docs/seo/structured-data.md` section linking back to this WBS entry, including a Rich Results test checklist.

## Acceptance Criteria
- `pnpm --filter @portfolio/site test structured-data` (or equivalent script) runs schema unit tests and passes without additional setup.
- Visiting `/`, `/notes`, and a representative `/notes/[slug]` route renders valid JSON-LD covering `Person`, `WebSite`, `BreadcrumbList`, and `Article` entities; devtools copy/paste into the Rich Results test yields no errors.
- Each JSON-LD block includes the nonce from `data-csp-nonce`, escapes unsafe characters, and avoids duplicating identical entities across routes.
- Resume updates in `content/resume.json` automatically flow into schema output without requiring manual code edits (beyond handling new fields).
- Documentation explains how to extend schema coverage to new routes and how to update resume data safely.

## Implementation Plan

1. **Audit data sources and metadata gaps**
   - Review `content/resume.json`, existing Next.js metadata, and breadcrumbs to map required fields for `Person`, `WebSite`, and `Article`.
   - Identify placeholder contact info or fields that should be suppressed from public schema.
   - Capture baseline HTML for `/`, `/notes`, and a note detail route to confirm where structured data scripts will mount.

2. **Design the resume data transformer**
   - Define a TypeScript interface for the sanitized resume shape (name, headline, social links, summary, roles).
   - Implement loader + validation logic (throw on missing `basics.name`, ignore undefined contact) with unit tests using fixture resume data.
   - Document how private-only resume fields (phone, exact address) are filtered or replaced with coarse location info.

3. **Implement JSON-LD generators**
   - Create pure functions in `lib/seo/jsonld.ts` for each entity type, accepting the sanitized resume data and route-specific context (slug, breadcrumbs, timestamps).
   - Include helpers for ISO date formatting, locale-aware URLs, and deduplication of shared `@id` references (`https://portfolio.dev/#person`, etc.).
   - Add Jest tests that snapshot generator output for home, notes index, and article scenarios, asserting schema types and critical fields.

4. **Render structured data in Next.js routes**
   - Build `<StructuredData>` component that pulls the nonce from React props (passed down from layout), stringifies JSON using a safe serializer, and renders `<script type="application/ld+json">`.
   - Update `app/layout.tsx` to pass the nonce into children (context/provider or prop) and ensure the component is inserted near the end of `<head>` or top of `<body>` without breaking streaming.
   - Wire `generateMetadata` or route components to call the generators and render the script(s) with consistent ordering.

5. **Validate via tests and tooling**
   - Add integration tests (Playwright or `@testing-library/react`) that render routes and assert presence/shape of structured data scripts.
   - Run generated JSON through `npm exec structured-data-testing-tool` (or similar) in CI to catch regressions; integrate into an existing `pnpm` script.
   - Record Rich Results test screenshots/links in the task acceptance notes.

6. **Document and socialize**
   - Draft `docs/seo/structured-data.md` covering commands, troubleshooting tips, and how resume updates impact schema.
   - Update `README.md` SEO section (if present) to reference the new doc and test commands.
   - Note follow-up work for Task 9.1 (publishing `/resume.json` and PDF) and how schema builders will reuse the resume transformer.

## Risks & Mitigations
- **Leaking placeholder or private resume data** — Enforce explicit allowlists in the transformer and add tests with redacted fixtures to confirm sensitive fields are dropped.
- **Schema drift from page content** — Tie schema generation to the same dictionary/MDX data used for rendering (titles, summaries) and include tests ensuring copy stays in sync.
- **CSP violations or double-injected scripts** — Reuse the server-provided nonce, escape JSON via a dedicated helper, and verify only one script per entity type renders per route.

## Open Questions
- Should the public schema reveal coarse location (city/region) or omit geography until confirmed for recruiting outreach?
  - List New York City as available for Hybrid work. Only list region, region is Upstate New York.
- Do we expose `sameAs` entries for GitHub/LinkedIn only, or also personal domains and the Tor mirror once live?
  - List three: GitHub, LinkedIn, and the Tor mirror.
- Will article schema need to include `author` variations for guest posts, and how should the generator handle future multi-author notes?
  - I will be the primary author for all foreseen posts. However multi-author is possible in the future. A final descriptor on the site mat look like "Author: Jack, Other"
