# Task F3.6 - JSON-LD spot checks

## Objective
Re-run JSON-LD rich results checks for home after copy changes (notes/experience intentionally omitted).

## Scope
- Routes: `/[locale]` only (notes and experience intentionally omit JSON-LD).
- Locales: `en`, `ja`, `zh` for emitted structured data.

## Checks run (2026-Jan-13 10:13 EST)
- Unit tests: `pnpm --filter @portfolio/site test structured-data` (pass).
  - Covers: resume profile sanitization, home graph types, StructuredData script escaping/nonce.
- Code spot-check:
  - StructuredData rendered in home route: `apps/site/app/[locale]/page.tsx`.
  - Notes and experience intentionally do not emit JSON-LD to limit personal data exposure.

## Rich Results (2026-Jan-13 11:43 EST)
- Result: "3 valid items detected."
- Detected items:
  - BreadcrumbList https://jrfeathe.com/en#breadcrumbs
  - BreadcrumbList https://jrfeathe.com/ja#breadcrumbs
  - BreadcrumbList https://jrfeathe.com/zh#breadcrumbs

## Rich Results (2026-Jan-13 11:32 EST)
- Result: "6 valid items detected."
- Detected items (verbatim):
  - Unnamed item
  - BreadcrumbList https://jrfeathe.com/en/notes#breadcrumbs ListItem
  - Unnamed item https://jrfeathe.com/ja#breadcrumbs
  - Unnamed item https://jrfeathe.com/ja/notes#breadcrumbs
  - Unnamed item https://jrfeathe.com/zh#breadcrumbs
  - Unnamed item https://jrfeathe.com/zh/notes#breadcrumbs
  - Unnamed item https://jrfeathe.com/en#breadcrumbs
  - Note: notes JSON-LD was removed after this run; re-run for home-only output if needed.

## Findings
- Home JSON-LD builder is exercised by unit tests and emits expected schema types.
- Notes and experience intentionally omit JSON-LD to limit personal data exposure.
- Rich Results shows 3 breadcrumb items for home pages across locales.

## Follow-ups / gaps
- Optional: run Playwright structured-data spec for HTML-level validation (notes tests are currently skipped).
