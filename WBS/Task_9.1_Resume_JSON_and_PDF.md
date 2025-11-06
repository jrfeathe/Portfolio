# Task 9.1 — Resume JSON & PDF Downloads

## Objective
Publish a single source of truth for recruiters and ATS bots by exposing the sanitized resume data (`content/resume.json`) at `/resume.json` and generating a pixel-perfect PDF at `/resume.pdf`. Automate both assets during the site build so download CTAs, API consumers, and schema tooling can rely on versioned, cacheable artifacts that stay in lockstep with Task 9.0’s resume transformer.

## In Scope
- Creating a stable JSON endpoint (likely `apps/site/app/resume.json/route.ts` or an API route with a rewrite) that returns the sanitized resume payload from `getResumeProfile()` plus any public-safe fields that downstream consumers expect (summary paragraphs, roles, languages, links, version metadata).
- Implementing a PDF build step that renders the resume print route (or a dedicated React layout) via headless Chromium/Playwright, saves the artifact to `apps/site/public/resume.pdf`, and fingerprints it with the resume version for cache busting.
- Wiring CTA links (home hero button, footer link, skim mode download) to the new paths and ensuring they reflect availability/localization rules (e.g., `rel="noreferrer noopener"` for external contexts).
- Documenting how to regenerate the JSON/PDF locally, how they ship in CI/CD, and how other tasks (schema builders, CLI export) can consume the same helper without duplicating logic.

## Out of Scope
- Redesigning the print layout itself (handled by Task 2.3) or rewriting resume content.
- Implementing authenticated/expiring download links or watermarking for the PDF.
- Creating alternate resume formats (DOCX, TXT, infographic variants) beyond JSON + PDF.

## Deliverables
- `apps/site/app/resume.json/route.ts` (or equivalent) returning `application/json`, ETag headers, cache hints, and the sanitized resume payload sourced from `getResumeProfile()`.
- Maintained PDF artifacts (`apps/site/public/resume.pdf` plus optional locale variants) exported from the print-ready layout and versioned manually alongside the codebase.
- Optional redirect or rewrite entries in `next.config.mjs` to expose clean paths `/resume.json` and `/resume.pdf` regardless of locale prefixes.
- Updated CTA wiring/tests (`apps/site/src/utils/dictionaries.ts`, `apps/site/tests/home.skim.spec.ts`, footer component) that confirm download links resolve and remain visible.
- Runbook section (e.g., `docs/resume/publishing.md`) that explains prerequisites, manual export steps, and verification, including how schema (Task 9.0) and upcoming CLI work (Task 18.1) reuse the same data contract.

## Acceptance Criteria
- Visiting `/resume.json` returns a 200 response with the sanitized resume JSON, correct content-type, and cache headers (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400` or similar). The payload’s `resumeVersion` matches `content/resume.json`.
- `/resume.pdf` downloads within <250 KB, renders as a two-page printable layout that mirrors the `/resume/print` route, and reflects the latest exported version.
- Manual updates to the PDF artifacts are documented (version noted in changelog/task notes) and staged whenever resume content changes.
- An automated test (e.g., Playwright spec or integration test) exercises each download and asserts MIME type, Content-Length (>0), and that the JSON structure matches the public contract.
- Documentation teaches contributors how to regenerate, validate (spot-check PDF, lint JSON schema), and publish the assets; links exist from Task 9.0 notes and README download instructions.

## Implementation Plan

1. **Finalize the public resume contract**
   - Review `getResumeProfile()` outputs and confirm which optional fields (skills, contact handles, languages) belong in the exposed JSON.
   - Define a TypeScript type shared by the JSON route, schema builders, and future consumers to avoid drift.
   - Add unit tests that snapshot the contract and guard against leaking private resume fields.

2. **Ship the JSON endpoint**
   - Create the route handler under `apps/site/app/resume.json/route.ts` (or `/api/resume/route.ts` + rewrite) that responds with the cached profile and HTTP headers for caching/versioning.
   - Include ETag support and `Last-Modified` dates keyed to the resume version to help browsers/CDNs.
   - Add Jest tests (request/response) verifying status codes, MIME type, and sanitized content.

3. **Define manual PDF export workflow**
   - Reuse `/resume/print` as the reference layout for exports and confirm its styling matches the manual source of truth.
   - Document the export steps (tooling, filename conventions, metadata expectations) so updated PDFs can be produced quickly after content changes.
   - Store the resulting PDFs under `apps/site/public/`, ensuring `resume.pdf` is always present as the default download.

4. **Wire downloads & caching**
   - Update Next.js config for rewrites/headers so `/resume.json` and `/resume.pdf` short paths are cacheable at the edge with fallbacks for older browsers.
   - Ensure CTA buttons (`Download resume`) and footer links open the new assets and expose analytics hooks if needed.
   - Document CDN caching guidance (manual purge steps, version bumps) tied to `resumeVersion`.

5. **Validate & document**
   - Add Playwright specs hitting both endpoints to confirm download success and capture JSON/PDF checks for regression review.
   - Extend `docs/seo/structured-data.md` (or new doc) with a section on regenerating downloads, referencing Task 9.0 dependencies.
   - Record Rich Results + PDF validation steps in task notes to close the loop with recruiters and search bots.

## Risks & Mitigations
- **Leaking private resume data** — Reuse the sanitized helper, add explicit allowlists/tests, and document how to add new fields safely.
- **Manual PDF drift** — Schedule periodic reviews against `/resume/print`, track exported version numbers in the changelog, and update documentation when the export process changes.
- **Large PDF payloads** — Optimize fonts/embedding, reuse print CSS, and enforce size checks in CI to keep downloads recruiter-friendly.
- **Stale downloads** — Tie asset regeneration to the build process and include the resume version in filenames/headers so caches bust automatically after edits.

## Open Questions
- Should `/resume.pdf` be localized (per locale path and translated labels) or remain a single EN-US asset for this release?
  - In the future, there will be resumeEN.pdf, resumeJA.pdf, and resumeZH.pdf. Each will be served on the respective page. For this release the one is fine.
- Do we need to expose a JSON schema (e.g., `/resume.schema.json`) alongside the data for third-party consumers?
  - Yes this is a good addition, but not required.
- Should the PDF embed a digital signature or watermark to deter tampering before sending to recruiters?
  - Not necessary.
