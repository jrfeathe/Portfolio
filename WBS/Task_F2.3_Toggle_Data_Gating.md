# Task F2.3 — Toggle + Data Gating

## Summary
- Centralized skim toggle parsing + gating helpers in a dedicated utility module.
- Added basic gating so skim cards only render when dictionary values are non-empty.
- Added Jest coverage for skim parsing and gating helpers.

## Implementation notes
- `resolveSkimMode` moved into `apps/site/src/utils/skim.ts` alongside `hasSkimValue` and `hasSkimValues`.
- Skim summary items are filtered based on non-empty labels/values before reaching the layout.
- Skim layouts skip rendering the column title, tech stack card, and availability card when values are empty.
- Mobile menu behavior remains unchanged; the menu stays visible in skim mode by design.

## Files updated
- `apps/site/src/utils/skim.ts`
- `apps/site/src/utils/__tests__/skim.test.ts`
- `apps/site/app/[locale]/page.tsx`
- `apps/site/src/components/DesktopSkimLayout.tsx`
- `apps/site/src/components/MobileSkimLayout.tsx`

## Tests
- Not run (not requested). Suggested: `pnpm --filter @portfolio/site test`
