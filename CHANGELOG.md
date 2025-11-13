# Changelog

# Task 10a.KING — Freeform Personalization Spike
- Expanded the Experience page to house both Projects and Tech Stack write-ups: dictionaries now carry structured `techStack` narratives plus stable IDs, `apps/site/app/[locale]/experience/page.tsx` renders them as anchored cards, and the sidebar nav exposes nested dropdowns for every project/tech with expand/collapse controls and a sticky “Return to top”.
- Re-linked the home-page Tech Stack carousel so each logo routes to its corresponding experience anchor (e.g., `/en/experience#react`), added a differentiating `stellaris-mods-project` vs. `stellaris-mods-tech` slug, and ensured all locale dictionaries share the new identifiers.
- Introduced the reusable `AnchorControlPanel` client component, refactored `AnchorNav` to support collapsible children with scroll-clamped overflow, and added global expand/collapse events while automatically hiding the buttons on pages without nested anchors.
- Updated `WBS/Essential_WBS.csv` and `WBS/Epics.md` with the new 10a.KING / 10a.REVOLT workflow so the documentation matches this experimentation burst.

# Task 10a.1 — Personalized Home Copy Rewrites
- Updated the home dictionaries (EN/JA/ZH) per the personalization brief: new hero subtitle, breadcrumb simplification, CTA ordering text, section eyebrows/descriptions, and refreshed footer copy now render through `apps/site/app/[locale]/page.tsx`.
- Taught the home layout/tests to rely on the trimmed breadcrumb list and CTA set so the Playwright skim-mode spec keeps guarding the new labels without regressions.
- Added a structured tech-stack inventory wired into the dictionary plus placeholder SVG assets under `apps/site/public/tech-stack/`, unblocking Task 10a.2’s carousel work while keeping today’s list accessible.
- Documented the deliverable in `COMPLETED_TASKS.md` and ensured localization prep files continue pointing translators to the 10a.1 source strings.

# Task 9.1 — Resume JSON & PDF Downloads
- Introduced `getPublicResume()` to publish a sanitized resume contract (summary, roles, downloads metadata) that powers schema, JSON, and print consumers without leaking placeholder fields.
- Added `/resume.json` and `/resume/print` app routes: the JSON endpoint serves cacheable public data with ETag/Last-Modified headers, while the print route renders a two-page resume layout reused by automated PDF generation.
- Documented a manual publishing flow for `apps/site/public/resume.pdf` (and locale variants) so updated exports can be dropped in alongside the automated JSON deliverable.
- Converted hero CTA buttons to link-aware downloads using the upgraded `<Button>` component (now anchor-compatible), updated locale dictionaries/tests accordingly, and added Playwright coverage (`tests/downloads.spec.ts`) to verify both downloads work.
- Documented regeneration + validation steps in `docs/resume/publishing.md`, linked the guidance from the SEO README section, and captured the final Task 9.1 decisions in the WBS notes.

# Task 9.0 — Schema & Resume JSON-LD
- Added a resume transformer + JSON-LD generator library so `Person`, `WebSite`, `BreadcrumbList`, and `Article` entities all read from `content/resume.json`, enforce the placeholder Tor mirror (`https://placeholder.onion`), and publish the agreed public region (Upstate New York / NYC hybrid availability).
- Introduced a CSP-compliant `<StructuredData>` component, nonce utilities, and route wiring (`/[locale]`, `/[locale]/notes`, `/[locale]/notes/[slug]`) that render exactly one escaped `<script type="application/ld+json">` block per page regardless of nonce availability.
- Documented the workflow in `docs/seo/structured-data.md`, linked it from the README, and shipped focused Jest + Playwright coverage (schema snapshots + route assertions) behind `pnpm --filter @portfolio/site test structured-data` and `tests/structured-data.spec.ts`.

# Task 8.2 — Critical CSS & Font Delivery
- Swapped Google-hosted fonts for self-hosted Ubuntu families via `next/font/local`, exposing CSS variables consumed by Tailwind and ensuring `font-display: swap` fallbacks.
- Added a scripted Tailwind extraction (`scripts/performance/generate-critical-css.mjs`) that emits `apps/site/app/critical-css.manifest.json` and injects the inline payload at layout render time.
- Extended the performance budget guardrail to enforce inline critical CSS size across `/en`, `/ja`, and `/zh`, updated the Jest suite with a manifest smoke test, and documented the workflow in `docs/performance/critical-css-fonts.md`.

## Task 8.1 — Image Pipeline & Delivery
- Added a shared `<ResponsiveImage>` component and helper presets so hero, content, and inline media automatically use modern formats with tuned `sizes` hints.
- Enabled AVIF/WebP output and remote allowlisting in `next.config.mjs`, updated locale dictionaries to describe hero artwork, and wired the shell layout to render the new media block.
- Routed MDX `<img>` tags through the responsive pipeline, re-enabled the ESLint guardrail against raw `<img>` usage, and documented authoring/QA steps in `docs/media-guidelines.md` and the testing runbook.
- Introduced a unit test for the image helper and captured the task deliverables in `WBS/Task_8.1_Image_Pipeline.md`.
- Deferred OTEL browser instrumentation to a client-side lazy import so Edge builds no longer crash when Playwright boots the home route.
- Reordered the shell layout grid so the hero CTA renders before the sticky nav in DOM order, matching keyboard focus expectations in the accessibility suite.

## Task 8.0 — Performance Budgets & Guardrails
- Introduced `performance-budgets.json` plus the `build:budgets` gate so Next builds fail when first-load JS exceeds agreed caps.
- Added a webpack manifest plugin and CI job updates that surface per-route gzip sizes alongside Lighthouse budget enforcement.
- Wired `reportWebVitals` into the OTEL pipeline and refreshed testing/docs to explain the new performance guardrails.
