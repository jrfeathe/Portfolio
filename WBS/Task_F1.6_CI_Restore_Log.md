# Task F1.6 — CI Restore Log

Use this file to stash failing CI/test outputs while debugging typecheck, Jest, Playwright, and budget checks.

## Quick status
- Lint:                 ✔ Pass
- Typecheck:            ✔ Pass
- Build:                ✔ Pass
- Jest:                 ✔ Pass
- Playwright: 
- Budgets/Lighthouse: 
- Notes/blocked on: 

## How to add a log
1) Add a new sub-heading under “Log entries” with a timestamp.  
2) Record the command you ran, the exit code, and a short summary.  
3) Paste only the key error snippets (avoid huge logs if possible).  
4) Add follow-up notes or TODOs beneath the snippet.

## Log entries
- pnpm --filter @portfolio/site run coverage:check

  > @portfolio/site@0.1.0 coverage:check /home/jack/Portfolio/apps/site
  > node ../../scripts/coverage/check.cjs
  
  Coverage Quality Gate
  
  Metric      Target  Actual  Status
  lines       90.00%  96.15%  pass  
  statements  90.00%  95.30%  pass  
  branches    80.00%  62.10%  fail  
  functions   90.00%  97.56%  pass
  
  Coverage check failed for: branches
  /home/jack/Portfolio/apps/site:
   ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @portfolio/site@0.1.0 coverage:check: `node ../../scripts/coverage/check.cjs`
  Exit status 1


- pnpm --filter @portfolio/site run build:budgets
  
  > @portfolio/site@0.1.0 build:budgets /home/jack/Portfolio/apps/site
  > node ../../scripts/performance/check-build-budgets.cjs
  
  ⚠ Linting is disabled.
  ▲ Next.js 14.2.33
  - Environments: .env.local
    - Experiments (use with caution):
      · typedRoutes
      · instrumentationHook
  
  Creating an optimized production build ...
  ✓ Compiled successfully
  ✓ Checking validity of types    
  ⚠ Using edge runtime on a page currently disables static generation for that page
  ✓ Collecting page data    
  ✓ Generating static pages (18/18)
  ✓ Collecting build traces    
  ✓ Finalizing page optimization
  
  Route (app)                              Size     First Load JS
  ┌ ƒ /_not-found                          873 B          88.5 kB
  ├ ƒ /[locale]                            4.32 kB         117 kB
  ├ ● /[locale]/experience                 876 B           105 kB
  ├   ├ /en/experience
  ├   ├ /ja/experience
  ├   └ /zh/experience
  ├ ● /[locale]/meetings                   55.4 kB         160 kB
  ├   ├ /en/meetings
  ├   ├ /ja/meetings
  ├   └ /zh/meetings
  ├ ● /[locale]/notes                      883 B           114 kB
  ├   ├ /en/notes
  ├   ├ /ja/notes
  ├   └ /zh/notes
  ├ ● /[locale]/notes/[slug]               185 B           102 kB
  ├   ├ /en/notes/mdx-pipeline
  ├   ├ /ja/notes/mdx-pipeline
  ├   └ /zh/notes/mdx-pipeline
  ├ ƒ /api/chat                            0 B                0 B
  ├ ƒ /experience                          142 B          87.8 kB
  └ ƒ /meetings                            142 B          87.8 kB
  + First Load JS shared by all            87.6 kB
    ├ chunks/1dd3208c-99f4e2386c15f990.js  53.6 kB
    ├ chunks/456-4678572670a467aa.js       31.7 kB
    └ other shared chunks (total)          2.25 kB

  ƒ Middleware                             51 kB
  
  ●  (SSG)      prerendered as static HTML (uses getStaticProps)
  ƒ  (Dynamic)  server-rendered on demand
  
  Generating critical CSS for /en
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 212ms.
  Inline CSS ready for /en: 17.17 KB
  Generating critical CSS for /ja
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 210ms.
  Inline CSS ready for /ja: 17.17 KB
  Generating critical CSS for /zh
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 199ms.
  Inline CSS ready for /zh: 17.17 KB
  Bundle Budgets
  Route                        |  Budget KB |  Actual KB | Status
  ----------------------------------------------------------------
  /[locale]                    |      120.0 |         29.2 | PASS
  /[locale]                    |      120.0 |         29.2 | PASS
  /[locale]                    |      120.0 |         29.2 | PASS
  /[locale]/notes              |      165.0 |         25.8 | PASS
  /[locale]/notes/[slug]       |      155.0 |         13.7 | PASS
  
  Critical CSS Budgets
  Route                        |  Budget KB |  Actual KB | Status
  ----------------------------------------------------------------
  /en                          |       16.0 |         17.2 | FAIL
  /ja                          |       16.0 |         17.2 | FAIL
  /zh                          |       16.0 |         17.2 | FAIL
  
  /home/jack/Portfolio/scripts/performance/check-build-budgets.cjs:312
  throw new Error("Performance budgets exceeded. See rows marked FAIL above.");
  ^
  
  Error: Performance budgets exceeded. See rows marked FAIL above.
  at main (/home/jack/Portfolio/scripts/performance/check-build-budgets.cjs:312:11)
  at Object.<anonymous> (/home/jack/Portfolio/scripts/performance/check-build-budgets.cjs:316:1)
  at Module._compile (node:internal/modules/cjs/loader:1730:14)
  at Object..js (node:internal/modules/cjs/loader:1895:10)
  at Module.load (node:internal/modules/cjs/loader:1465:32)
  at Function._load (node:internal/modules/cjs/loader:1282:12)
  at TracingChannel.traceSync (node:diagnostics_channel:322:14)
  at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
  at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
  at node:internal/main/run_main_module:36:49
  
  Node.js v22.17.0
  /home/jack/Portfolio/apps/site:
   ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @portfolio/site@0.1.0 build:budgets: `node ../../scripts/performance/check-build-budgets.cjs`
  Exit status 1


- pnpm test:a11y
  > portfolio-monorepo@0.1.0 test:a11y /home/jack/Portfolio
  > pnpm --filter @portfolio/ui run test:a11y && pnpm --filter @portfolio/site run test:a11y
  
  > @portfolio/ui@0.1.0 test:a11y /home/jack/Portfolio/packages/ui
  > jest --config jest.config.cjs --runInBand
  
  PASS  src/__tests__/a11y/Accordion.a11y.test.tsx
  PASS  src/__tests__/a11y/Tooltip.a11y.test.tsx
  PASS  src/__tests__/a11y/Button.a11y.test.tsx
  PASS  src/__tests__/a11y/Tabs.a11y.test.tsx
  PASS  src/__tests__/a11y/Card.a11y.test.tsx
  PASS  src/__tests__/a11y/Chip.a11y.test.tsx
  PASS  src/__tests__/a11y/StatTile.a11y.test.tsx
  
  Test Suites: 7 passed, 7 total
  Tests:       9 passed, 9 total
  Snapshots:   0 total
  Time:        1.411 s
  Ran all test suites.
  
  > @portfolio/site@0.1.0 test:a11y /home/jack/Portfolio/apps/site
  > pnpm run preplaywright:test && pnpm run playwright:test:a11y
  
  > @portfolio/site@0.1.0 preplaywright:test /home/jack/Portfolio/apps/site
  > node ../../scripts/playwright/pretest.cjs
  
  [playwright] Building Next.js app before tests…
  
  > @portfolio/site@0.1.0 build /home/jack/Portfolio/apps/site
  > next build && node ../../scripts/performance/generate-critical-css.mjs
  
  ▲ Next.js 14.2.33
  - Environments: .env.local
    - Experiments (use with caution):
      · typedRoutes
      · instrumentationHook
  
  Creating an optimized production build ...
  <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (139kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
  ✓ Compiled successfully
  ✓ Linting and checking validity of types    
  ⚠ Using edge runtime on a page currently disables static generation for that page
  ✓ Collecting page data    
  ✓ Generating static pages (18/18)
  ✓ Collecting build traces    
  ✓ Finalizing page optimization
  
  Route (app)                              Size     First Load JS
  ┌ ƒ /_not-found                          873 B          88.5 kB
  ├ ƒ /[locale]                            4.32 kB         117 kB
  ├ ● /[locale]/experience                 876 B           105 kB
  ├   ├ /en/experience
  ├   ├ /ja/experience
  ├   └ /zh/experience
  ├ ● /[locale]/meetings                   55.4 kB         160 kB
  ├   ├ /en/meetings
  ├   ├ /ja/meetings
  ├   └ /zh/meetings
  ├ ● /[locale]/notes                      883 B           114 kB
  ├   ├ /en/notes
  ├   ├ /ja/notes
  ├   └ /zh/notes
  ├ ● /[locale]/notes/[slug]               185 B           102 kB
  ├   ├ /en/notes/mdx-pipeline
  ├   ├ /ja/notes/mdx-pipeline
  ├   └ /zh/notes/mdx-pipeline
  ├ ƒ /api/chat                            0 B                0 B
  ├ ƒ /experience                          142 B          87.8 kB
  └ ƒ /meetings                            142 B          87.8 kB
  + First Load JS shared by all            87.6 kB
    ├ chunks/1dd3208c-99f4e2386c15f990.js  53.6 kB
    ├ chunks/456-4678572670a467aa.js       31.7 kB
    └ other shared chunks (total)          2.25 kB
  
  ƒ Middleware                             51 kB
  
  ●  (SSG)      prerendered as static HTML (uses getStaticProps)
  ƒ  (Dynamic)  server-rendered on demand
  
  Generating critical CSS for /en
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 207ms.
  Inline CSS ready for /en: 17.17 KB
  Generating critical CSS for /ja
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 206ms.
  Inline CSS ready for /ja: 17.17 KB
  Generating critical CSS for /zh
  Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
  
  Rebuilding...
  
  Done in 208ms.
  Inline CSS ready for /zh: 17.17 KB
  
  > @portfolio/site@0.1.0 playwright:test:a11y /home/jack/Portfolio/apps/site
  > PLAYWRIGHT_HTML_REPORT=playwright-report-a11y PLAYWRIGHT_BLOB_REPORT=blob-report-a11y PLAYWRIGHT_OUTPUT_DIR=test-results/a11y node ../../scripts/playwright/run.cjs tests/a11y

  Running 8 tests using 8 workers
  
  ✘  1 …ing › @a11y disables transitions when reduced motion is requested (1.7s)
  ✘  2 …handling › @a11y manual theme toggle overrides system preference (11.8s)
  ✘  3 …ty preference handling › @a11y exposes a high-contrast focus ring (1.8s)
  ✘  4 …dling › @a11y manual contrast toggle overrides system preference (11.8s)
  ✓  5 …cks › @a11y notes index has no serious or critical axe violations (7.2s)
  ✘  6 … › @a11y home skim mode has no serious or critical axe violations (2.9s)
  ✓  7 …cks › @a11y note detail has no serious or critical axe violations (7.2s)
  ✘  8 …hecks › @a11y home hero has no serious or critical axe violations (2.9s)

  1) [chromium] › tests/a11y/accessibility-preferences.spec.ts:4:7 › Accessibility preference handling › @a11y disables transitions when reduced motion is requested
  
      Error: expect(received).toBe(expected) // Object.is equality
  
      Expected: 0
      Received: 0.15
  
        13 |     });
        14 |
      > 15 |     expect(transitionDuration).toBe(0);
           |                                ^
        16 |   });
        17 |
        18 |   test("@a11y exposes a high-contrast focus ring", async ({ page }) => {
          at /home/jack/Portfolio/apps/site/tests/a11y/accessibility-preferences.spec.ts:15:32
  
      attachment #1: screenshot (image/png) ──────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-996d1-reduced-motion-is-requested-chromium/test-failed-1.png
      ────────────────────────────────────────────────────────────────────────────
  
      attachment #2: video (video/webm) ──────────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-996d1-reduced-motion-is-requested-chromium/video.webm
      ────────────────────────────────────────────────────────────────────────────
  
      Error Context: test-results/a11y/a11y-accessibility-prefere-996d1-reduced-motion-is-requested-chromium/error-context.md
  
     2) [chromium] › tests/a11y/accessibility-preferences.spec.ts:18:7 › Accessibility preference handling › @a11y exposes a high-contrast focus ring
  
         Error: expect(received).toBeTruthy()
  
         Received: false
  
           35 |       (element) => document.activeElement === element
           36 |     );
      >    37 |     expect(isButtonActive).toBeTruthy();
              |                            ^
           38 |
           39 |     const { outlineWidth, outlineStyle } = await ctaButton.evaluate((element) => {
           40 |       const styles = getComputedStyle(element);
             at /home/jack/Portfolio/apps/site/tests/a11y/accessibility-preferences.spec.ts:37:28
  
         attachment #1: screenshot (image/png) ──────────────────────────────────────
         test-results/a11y/a11y-accessibility-prefere-863ae--a-high-contrast-focus-ring-chromium/test-failed-1.png
         ────────────────────────────────────────────────────────────────────────────
  
         attachment #2: video (video/webm) ──────────────────────────────────────────
         test-results/a11y/a11y-accessibility-prefere-863ae--a-high-contrast-focus-ring-chromium/video.webm
         ────────────────────────────────────────────────────────────────────────────
  
         Error Context: test-results/a11y/a11y-accessibility-prefere-863ae--a-high-contrast-focus-ring-chromium/error-context.md
  
     3) [chromium] › tests/a11y/accessibility-preferences.spec.ts:52:7 › Accessibility preference handling › @a11y manual theme toggle overrides system preference
  
         TimeoutError: locator.click: Timeout 10000ms exceeded.
         Call log:
           - waiting for getByTestId('theme-toggle')

        63 |
        64 |     // Cycle: system -> dark
      > 65 |     await themeToggle.click();
           |                       ^
        66 |     let datasetTheme = await page.evaluate(
        67 |       () => document.documentElement.dataset.theme
        68 |     );
          at /home/jack/Portfolio/apps/site/tests/a11y/accessibility-preferences.spec.ts:65:23
  
      attachment #1: screenshot (image/png) ──────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-7fe55-overrides-system-preference-chromium/test-failed-1.png
      ────────────────────────────────────────────────────────────────────────────
  
      attachment #2: video (video/webm) ──────────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-7fe55-overrides-system-preference-chromium/video.webm
      ────────────────────────────────────────────────────────────────────────────
  
      Error Context: test-results/a11y/a11y-accessibility-prefere-7fe55-overrides-system-preference-chromium/error-context.md
  
  4) [chromium] › tests/a11y/accessibility-preferences.spec.ts:87:7 › Accessibility preference handling › @a11y manual contrast toggle overrides system preference
  
      TimeoutError: locator.click: Timeout 10000ms exceeded.
      Call log:
        - waiting for getByTestId('contrast-toggle')

         97 |
         98 |     // Cycle: system -> high
      >  99 |     await contrastToggle.click();
            |                          ^
        100 |     let datasetContrast = await page.evaluate(
        101 |       () => document.documentElement.dataset.contrast
        102 |     );
          at /home/jack/Portfolio/apps/site/tests/a11y/accessibility-preferences.spec.ts:99:26
  
      attachment #1: screenshot (image/png) ──────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-52134-overrides-system-preference-chromium/test-failed-1.png
      ────────────────────────────────────────────────────────────────────────────
  
      attachment #2: video (video/webm) ──────────────────────────────────────────
      test-results/a11y/a11y-accessibility-prefere-52134-overrides-system-preference-chromium/video.webm
      ────────────────────────────────────────────────────────────────────────────
  
      Error Context: test-results/a11y/a11y-accessibility-prefere-52134-overrides-system-preference-chromium/error-context.md
  
  5) [chromium] › tests/a11y/global-accessibility.spec.ts:44:9 › Global accessibility smoke checks › @a11y home hero has no serious or critical axe violations
  
      Error: expect(received).toHaveLength(expected)
  
      Expected length: 0
      Received length: 2
      Received array:  [{"description": "Ensure <dl> elements are structured correctly", "help": "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/definition-list?application=playwright", "id": "definition-list", "impact": "serious", "nodes": [{"all": [], "any": [], "failureSummary": "Fix all of the following:
        dl element has direct children that are not allowed: a", "html": "<dl class=\"grid gap-4 sm:grid-cols-2\">", "impact": "serious", "none": [{"data": {"values": "a"}, "id": "only-dlitems", "impact": "serious", "message": "dl element has direct children that are not allowed: a", "relatedNodes": [{"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#rollo...\">", "target": ["a[href$=\"experience#rollodex\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#quest...\">", "target": ["a[href$=\"experience#quester2000\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#ser32...\">", "target": ["a[href$=\"experience#ser321\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#stell...\">", "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4)"]}]}], "target": ["dl"]}], "tags": ["cat.structure", "wcag2a", "wcag131", "EN-301-549", "EN-9.1.3.1", "RGAAv4", "RGAA-9.3.3"]}, {"description": "Ensure <dt> and <dd> elements are contained by a <dl>", "help": "<dt> and <dd> elements must be contained by a <dl>", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/dlitem?application=playwright", "id": "dlitem", "impact": "serious", "nodes": [{"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Rollodex</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#rollodex\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Co-led fullstack development of a contact management web application.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#rollodex\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Quester2000</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#quester2000\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">A point tracking to-do list tool for managing your work-life balance.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#quester2000\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Teaching Assistant</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#ser321\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Supported a high level Distributed Software Systems course as a teaching assistant.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#ser321\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Stellaris Modding</dt>", "impact": "serious", "none": [], "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4) > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
        Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Upgraded the memory management library for Stellaris to boost performance.</dd>", "impact": "serious", "none": [], "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4) > dd"]}], "tags": ["cat.structure", "wcag2a", "wcag131", "EN-301-549", "EN-9.1.3.1", "RGAAv4", "RGAA-9.3.3"]}]
  
        61 |       }
        62 |
      > 63 |       expect(impactfulViolations).toHaveLength(0);
           |                                   ^
        64 |     });
        65 |   }
        66 | });
          at /home/jack/Portfolio/apps/site/tests/a11y/global-accessibility.spec.ts:63:35
  
      attachment #2: screenshot (image/png) ──────────────────────────────────────
      test-results/a11y/a11y-global-accessibility--5f788--or-critical-axe-violations-chromium/test-failed-1.png
      ────────────────────────────────────────────────────────────────────────────
  
      attachment #3: video (video/webm) ──────────────────────────────────────────
      test-results/a11y/a11y-global-accessibility--5f788--or-critical-axe-violations-chromium/video-1.webm
      ────────────────────────────────────────────────────────────────────────────
  
      attachment #4: video (video/webm) ──────────────────────────────────────────
      test-results/a11y/a11y-global-accessibility--5f788--or-critical-axe-violations-chromium/video.webm
      ────────────────────────────────────────────────────────────────────────────
  
      Error Context: test-results/a11y/a11y-global-accessibility--5f788--or-critical-axe-violations-chromium/error-context.md
  
     6) [chromium] › tests/a11y/global-accessibility.spec.ts:44:9 › Global accessibility smoke checks › @a11y home skim mode has no serious or critical axe violations
  
         Error: expect(received).toHaveLength(expected)
  
         Expected length: 0
         Received length: 2
         Received array:  [{"description": "Ensure <dl> elements are structured correctly", "help": "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/definition-list?application=playwright", "id": "definition-list", "impact": "serious", "nodes": [{"all": [], "any": [], "failureSummary": "Fix all of the following:
           dl element has direct children that are not allowed: a", "html": "<dl class=\"grid gap-4 sm:grid-cols-2\">", "impact": "serious", "none": [{"data": {"values": "a"}, "id": "only-dlitems", "impact": "serious", "message": "dl element has direct children that are not allowed: a", "relatedNodes": [{"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#rollo...\">", "target": ["a[href$=\"experience#rollodex\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#quest...\">", "target": ["a[href$=\"experience#quester2000\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#ser32...\">", "target": ["a[href$=\"experience#ser321\"]"]}, {"html": "<a class=\"block rounded-xl bor...\" href=\"/en/experience#stell...\">", "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4)"]}]}], "target": ["dl"]}], "tags": ["cat.structure", "wcag2a", "wcag131", "EN-301-549", "EN-9.1.3.1", "RGAAv4", "RGAA-9.3.3"]}, {"description": "Ensure <dt> and <dd> elements are contained by a <dl>", "help": "<dt> and <dd> elements must be contained by a <dl>", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/dlitem?application=playwright", "id": "dlitem", "impact": "serious", "nodes": [{"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Rollodex</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#rollodex\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Co-led fullstack development of a contact management web application.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#rollodex\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Quester2000</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#quester2000\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">A point tracking to-do list tool for managing your work-life balance.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#quester2000\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Teaching Assistant</dt>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#ser321\"] > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Supported a high level Distributed Software Systems course as a teaching assistant.</dd>", "impact": "serious", "none": [], "target": ["a[href$=\"experience#ser321\"] > dd"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dt class=\"text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted\">Stellaris Modding</dt>", "impact": "serious", "none": [], "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4) > dt"]}, {"all": [], "any": [{"data": null, "id": "dlitem", "impact": "serious", "message": "Description list item does not have a <dl> parent element", "relatedNodes": []}], "failureSummary": "Fix any of the following:
           Description list item does not have a <dl> parent element", "html": "<dd class=\"mt-2 text-sm\">Upgraded the memory management library for Stellaris to boost performance.</dd>", "impact": "serious", "none": [], "target": [".block.py-3.focus-visible\\:ring-2:nth-child(4) > dd"]}], "tags": ["cat.structure", "wcag2a", "wcag131", "EN-301-549", "EN-9.1.3.1", "RGAAv4", "RGAA-9.3.3"]}]
  
           61 |       }
           62 |
      >    63 |       expect(impactfulViolations).toHaveLength(0);
              |                                   ^
           64 |     });
           65 |   }
           66 | });
             at /home/jack/Portfolio/apps/site/tests/a11y/global-accessibility.spec.ts:63:35
  
         attachment #2: screenshot (image/png) ──────────────────────────────────────
         test-results/a11y/a11y-global-accessibility--40692--or-critical-axe-violations-chromium/test-failed-1.png
         ────────────────────────────────────────────────────────────────────────────
  
         attachment #3: video (video/webm) ──────────────────────────────────────────
         test-results/a11y/a11y-global-accessibility--40692--or-critical-axe-violations-chromium/video-1.webm
         ────────────────────────────────────────────────────────────────────────────
  
         attachment #4: video (video/webm) ──────────────────────────────────────────
         test-results/a11y/a11y-global-accessibility--40692--or-critical-axe-violations-chromium/video.webm
         ────────────────────────────────────────────────────────────────────────────
  
         Error Context: test-results/a11y/a11y-global-accessibility--40692--or-critical-axe-violations-chromium/error-context.md
  
  6 failed
  [chromium] › tests/a11y/accessibility-preferences.spec.ts:4:7 › Accessibility preference handling › @a11y disables transitions when reduced motion is requested
  [chromium] › tests/a11y/accessibility-preferences.spec.ts:18:7 › Accessibility preference handling › @a11y exposes a high-contrast focus ring
  [chromium] › tests/a11y/accessibility-preferences.spec.ts:52:7 › Accessibility preference handling › @a11y manual theme toggle overrides system preference
  [chromium] › tests/a11y/accessibility-preferences.spec.ts:87:7 › Accessibility preference handling › @a11y manual contrast toggle overrides system preference
  [chromium] › tests/a11y/global-accessibility.spec.ts:44:9 › Global accessibility smoke checks › @a11y home hero has no serious or critical axe violations
  [chromium] › tests/a11y/global-accessibility.spec.ts:44:9 › Global accessibility smoke checks › @a11y home skim mode has no serious or critical axe violations
  2 passed (16.8s)
  
  To open last HTML report run:
  
  pnpm exec playwright show-report
  
  ELIFECYCLE  Command failed with exit code 1.
  /home/jack/Portfolio/apps/site:
   ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @portfolio/site@0.1.0 test:a11y: `pnpm run preplaywright:test && pnpm run playwright:test:a11y`
  Exit status 1
   ELIFECYCLE  Command failed with exit code 1.

- pnpm --filter @portfolio/site run coverage:check

  Coverage Quality Gate

  Metric      Target  Actual   Status
  lines       90.00%  100.00%  pass  
  statements  90.00%  98.65%   pass  
  branches    80.00%  81.05%   pass  
  functions   90.00%  100.00%  pass  


- pnpm --filter @portfolio/site run build:budgets

  Bundle Budgets
  Route                        |  Budget KB |  Actual KB | Status
  ----------------------------------------------------------------
  /[locale]                    |      120.0 |         29.3 | PASS
  /[locale]/notes              |      165.0 |         25.9 | PASS
  /[locale]/notes/[slug]       |      155.0 |         13.7 | PASS

  Critical CSS Budgets
  Route                        |  Budget KB |  Actual KB | Status
  ----------------------------------------------------------------
  /en                          |       16.0 |         15.9 | PASS
  /ja                          |       16.0 |         15.9 | PASS
  /zh                          |       16.0 |         15.9 | PASS

- pnpm --filter @portfolio/site run build:budgets (after proof-list markup fix)

  Critical CSS Budgets
  Route                        |  Budget KB |  Actual KB | Status
  ----------------------------------------------------------------
  /en                          |       16.0 |         15.8 | PASS
  /ja                          |       16.0 |         15.8 | PASS
  /zh                          |       16.0 |         15.8 | PASS
