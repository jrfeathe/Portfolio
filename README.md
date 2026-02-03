# Portfolio

Production-ready personal portfolio site built on Next.js with multilingual content (EN/JA/ZH), AI chatbot + audio player, meetings/availability, MDX notes, and accessibility/perf/observability guardrails.

## Quick start

1. `nvm use` (uses `.nvmrc`)
2. `pnpm install`
3. Create `apps/site/.env.local` with the keys you need:
   - Chatbot: `OPENROUTER_API_KEY` (optional: `OPENROUTER_MODEL`, `OPENROUTER_MODERATION_MODEL`, `OPENROUTER_RESUME_MODEL`, `OPENROUTER_APP_URL`)
   - Captcha: `HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`
   - Observability (optional): `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_SERVICE_NAME`, `NEXT_PUBLIC_ENABLE_OTEL_BROWSER=1`, `NEXT_PUBLIC_OTEL_TRACES_ENDPOINT` (or `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`), `NEXT_PUBLIC_OTEL_SERVICE_NAME`
4. `pnpm run dev`

## Essential commands

- `pnpm run dev` - start the site
- `pnpm build` - build all packages (site build generates critical CSS)
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` - Jest coverage gate
- `pnpm test:a11y` - UI + site a11y runs
- `pnpm --filter @portfolio/site playwright:test` - e2e suite
- `pnpm --filter @portfolio/site build:budgets` - performance budgets
- `node scripts/generate-tokens-css.mjs` - regenerate tokens CSS

## AI scripts (chatbot + resume)

- `pnpm exec tsc -p scripts/ai/tsconfig.json` - build the AI helper scripts
- `node .tmp/chatbot-build/build-chatbot-index.js` - refresh chatbot embeddings + anchors after tech stack/experience edits
- Resume tailoring workflow:
  - Follow the prompt + template in `apps/job-studio/job-description-compression.md` to compress the job description in ChatGPT.
  - Save the compressed job description output to `apps/job-studio/job-description-compact.txt` (or another path).
  - Run `node .tmp/chatbot-build/generate-tailored-resume.js` to produce the 1‑page markdown resume (defaults to `apps/job-studio/job-description-compact.txt` + `apps/job-studio/tailored-resume.md`; optional: `--job`, `--out`, `--locale`, `--json-out`, `--model`, `--no-header`).

## Pipelines (when to run)

- Design tokens: update `packages/ui/tokens.json` then run `node scripts/generate-tokens-css.mjs`.
- Performance: `pnpm build` generates critical CSS; run `pnpm --filter @portfolio/site build:budgets` and `pnpm --filter @portfolio/site lhci:collect` for budget/Lighthouse checks.
- Testing: `pnpm test` (coverage), `pnpm test:a11y`, and `pnpm --filter @portfolio/site playwright:test`.
- Chatbot: after tech stack or resume updates, rebuild embeddings/anchors with the AI scripts above.

## WBS (work breakdown structure)

The WBS is the authoritative scope tracker for launch. Each item has a deliverable/DoD and links to supporting notes.

- `WBS/FINAL_WBS.md` - source of truth for launch scope, status buckets, and DoD per task.
- `WBS/Task_*.md` - task-specific notes, QA logs, and decisions.
- `COMPLETED_TASKS.md` - completed WBS items with dates and short notes.
- `WBS/Old WBS/` - archived legacy planning artifacts.

## Workspace layout

- `apps/site` - Next.js app
- `apps/job-studio` - job description compression + resume generation inputs/outputs
- `packages/ui` - shared UI system + tokens
- `packages/config` - shared linting/formatting/TS config
- `content` - MDX notes + authored content
- `scripts` - automation (performance, tests, tokens)
- `docs` - runbooks and quality gates
