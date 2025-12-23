# Task F3.4 - SEO, canonicals, robots, sitemap

## Objective
Audit and correct SEO metadata after recent copy/layout changes so search engines see consistent, canonical URLs, correct indexability directives, and an accurate sitemap/robots.txt. The goal is to prevent duplicate content, accidental noindexing, and missing pages during launch.

## Source WBS entry
- ID: F3.4
- Title: SEO/canonicals/robots/sitemap
- Scope/Notes: Audit sitemap/robots/canonicals/meta; fix gaps introduced by copy/layout changes.
- Deliverable/DoD: Updated files; spot-check log.

## Scope (launch-critical)
- Routes: localized Home, Experience, Meetings, Notes index, Notes detail, plus any publicly exposed resume or utility routes.
- Variants: skim mode (`?skim`) and any redirect routes (for example `/experience` and `/meetings` redirect to `/en/...`).
- SEO surfaces: HTML title and description, canonical link tags, robots meta tags, Open Graph/Twitter metadata, sitemap.xml, and robots.txt.
- Locale coverage: ensure all supported locales (`en`, `ja`, `zh`) are represented consistently.

## Out of scope
- Search Console setup or external index submission.
- Content rewrites beyond metadata copy (unless required to fix inaccurate titles/descriptions).
- Schema/JSON-LD (covered separately in Task F3.6), except for ensuring canonical URLs match schema references.

## Key assumptions and inputs
- Canonical base URL should align with `PORTFOLIO_BASE_URL` in `apps/site/src/lib/seo/jsonld.ts`.
- Metadata titles and descriptions are sourced from `apps/site/src/utils/dictionaries.ts` and per-page `generateMetadata` exports.
- Draft notes are filtered in `apps/site/src/lib/mdx.ts` and should not appear in the sitemap.

## Audit checklist
- **Titles/descriptions**: every indexable route has a non-empty `title` and `description` that reflects current copy.
- **Canonical URLs**: each route emits a canonical tag that:
  - uses the production base domain
  - normalizes locale paths (ex: `/en`, `/ja`, `/zh`)
  - omits query parameters like `?skim` or `?utm_*`
- **Robots meta**: indexable pages emit `index,follow` (or omit robots meta if defaults are correct), while duplicate/utility pages emit `noindex` as appropriate.
- **Open Graph/Twitter**: share metadata matches the visible page title/summary and uses the correct locale.
- **Sitemap**: includes all indexable routes (including locales), excludes drafts/redirects, and does not include query-string variants.
- **robots.txt**: references the sitemap location and blocks any non-public or duplicate surfaces.
- **Parity with JSON-LD**: canonical URLs in HTML match the URLs used in structured data.

## Implementation plan
1. **Inventory route surface**
   - List public routes by locale: `/[locale]`, `/[locale]/experience`, `/[locale]/meetings`, `/[locale]/notes`, `/[locale]/notes/[slug]`.
   - Note redirects (`/experience`, `/meetings`) and any utility routes that should stay out of the sitemap.
2. **Validate metadata sources**
   - Check `apps/site/app/layout.tsx` and per-route `generateMetadata` functions for title/description coverage.
   - Confirm dictionary metadata in `apps/site/src/utils/dictionaries.ts` matches updated copy.
3. **Canonical strategy**
   - Define a single canonical rule that mirrors the JSON-LD base URL.
   - Ensure skim mode (`?skim`) canonicals to the non-skim URL.
   - Confirm that locale paths are canonical (avoid `/` without locale unless explicitly desired).
4. **Robots meta rules**
   - Decide which pages should be indexed vs. hidden (ex: redirect-only routes, print views, or duplicate surfaces).
   - Index `/[locale]` (including `?skim`), `/[locale]/experience`, and `/[locale]/meetings`; noindex `/[locale]/notes` and `/[locale]/notes/*`.
   - Implement per-page robots meta where needed to override defaults.
5. **Sitemap**
   - If a sitemap generator is missing, add a Next.js sitemap route (ex: `apps/site/app/sitemap.ts`) or a static `public/sitemap.xml`.
   - Ensure all locales and note slugs are listed, exclude drafts and redirects, and keep URLs canonical.
6. **Robots.txt**
   - If missing, add `apps/site/app/robots.ts` or `apps/site/public/robots.txt` with an explicit `Sitemap:` reference.
   - Confirm disallow rules only block non-public routes and do not accidentally block `/[locale]`.
7. **Spot-check and log**
   - Manually check representative pages per locale and record findings in the spot-check log.
   - Capture any fixes applied and re-check.

## Files likely to touch
- `apps/site/app/layout.tsx` (default metadata)
- `apps/site/app/[locale]/page.tsx`
- `apps/site/app/[locale]/experience/page.tsx`
- `apps/site/app/[locale]/meetings/page.tsx`
- `apps/site/app/[locale]/notes/page.tsx`
- `apps/site/app/[locale]/notes/[slug]/page.tsx`
- `apps/site/src/utils/dictionaries.ts` (localized title/description copy)
- `apps/site/src/lib/seo/jsonld.ts` (canonical base alignment)
- `apps/site/app/robots.ts` or `apps/site/public/robots.txt` (if missing)
- `apps/site/app/sitemap.ts` or `apps/site/public/sitemap.xml` (if missing)

## Deliverables
- Updated metadata/canonical/robots/sitemap files as needed.
- A spot-check log that confirms the expected SEO output for key routes.

## Acceptance criteria (DoD)
- Every indexable route emits a correct title, description, and canonical URL.
- `?skim` and other query variants canonicalize to the base route (and are not listed in the sitemap).
- Robots meta or robots.txt do not block any intended public pages.
- Sitemap includes all indexable routes for `en`, `ja`, and `zh` and excludes drafts/redirects.
- Spot-check log recorded and kept with this task or in a dedicated SEO log document.

## Implementation notes
- Added `robots.txt` and `sitemap.xml` via metadata routes and aligned them with the locale-only indexable pages.
- Set canonical alternates for Home/Experience/Meetings; notes are canonicalized but remain `noindex` and excluded from the sitemap.
- Skim mode shares the Home canonical and uses a distinct OG image path.

## Spot-check log
- To check (use two CLIs):
  - pnpm -C apps/site exec next dev -p 3001
  - curl -s http://localhost:3001/en/experience | rg -o '<title>.*</title>|<meta name="description"[^>]*>|<link rel="canonical"[^>]*>|<meta name="robots"[^>]*>|<meta property="og:locale"[^>]*>|<meta property="og:image"[^>]*>'
Spot-checks recorded from local dev output (localhost:3001).

- robots.txt: `Allow: /` with disallow for `/api`, `/_next`, `/experience`, `/meetings`, `/notes`, and locale notes paths; sitemap points to `https://jrfeathe.com/sitemap.xml`.
- sitemap.xml: includes `/[locale]`, `/[locale]/experience`, `/[locale]/meetings` for `en`, `ja`, `zh` with hreflang alternates; notes excluded.

| URL              | Title/Description ok | Canonical ok          | Robots ok             | In sitemap | Notes                                                                  |
|------------------|----------------------|-----------------------|-----------------------|------------|------------------------------------------------------------------------|
| /en              | yes                  | yes                   | yes                   | yes        | og:locale `en_US`; og:image `/en/opengraph-image` (localhost in dev).  |
| /en?skim=1       | yes                  | yes (canonical `/en`) | yes                   | no         | og:image `/en/opengraph-skim`; canonical matches Home.                 |
| /en/experience   | yes                  | yes                   | yes (robots allow)    | yes        | og:locale `en_US`; og:image `/en/experience/opengraph-image` in dev.   |
| /en/meetings     | yes                  | yes                   | yes (robots allow)    | yes        | og:locale `en_US`; og:image `/en/meetings/opengraph-image` in dev.     |
| /en/notes        | yes                  | yes                   | yes (robots disallow) | no         | noindex, canonical `/en/notes`; og:image `/en/opengraph-image` in dev. |
| /en/notes/<slug> | n/a                  | n/a                   | n/a                   | n/a        | Endpoint slated for removal; skipped per latest direction.            |
| /ja              | yes                  | yes                   | yes (robots allow)    | yes        | og:locale `ja_JP`; og:image `/ja/opengraph-image` in dev.              |
| /zh              | yes                  | yes                   | yes (robots allow)    | yes        | og:locale `zh_CN`; og:image `/zh/opengraph-image` in dev.              |

## Risks and mitigations
- **Accidental noindexing**: verify robots meta for each route and keep a quick audit checklist.
- **Duplicate content**: ensure canonicals do not include query params and redirect routes are excluded from the sitemap.
- **Locale drift**: use `locales` from `apps/site/src/utils/i18n.ts` to build sitemap entries consistently.
- **Metadata drift after copy changes**: tie metadata titles/descriptions to dictionary copy and re-check after edits.
