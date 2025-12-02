# AI Chatbot Implementation Notes (Task 10a.KING)

Owner: Jack Featherstone  
Scope: Recruiter-facing AI assistant surfaced on key pages with rate limits, captcha, retrieval grounding, and logging notice.

## Data + Prompt Assets
- `apps/site/data/ai/chatbot-instructions.md`: System prompt with persona, answer pattern (2–5 sentences, “yes-and” tone), bridging rules, banned topics, logging notice, and Kubernetes adjacency example.
- `apps/site/data/ai/tech-anchors.json`: Stable map of tech/experience anchors per locale (`/locale/experience#id` + resume). Generated from tech stack + project experience.
- `apps/site/data/ai/chatbot-embeddings.json`: Lightweight bag-of-words index of tech stack entries, project experience highlights, and resume summary (PII scrubbed).

### Refreshing Anchors/Embeddings
1) Build artifacts:
   ```bash
   pnpm exec tsc -p scripts/ai/tsconfig.json
   node .tmp/chatbot-build/build-chatbot-index.js
   ```
2) Commit the updated `tech-anchors.json` and `chatbot-embeddings.json`.
3) Re-run when tech stack or project content changes.

## Backend API (`/api/chat`)
- Runtime: Node.
- Flow: sanitize → rate-limit (10 prompts/hour/IP) → captcha gate from 3rd prompt → retrieval (top 5 chunks) → OpenRouter call (low temp) → fallback reply if model unavailable → return references + logging notice.
- Captcha: returns a 6-char code when required; solves persist for 1 hour; TTL 10 minutes per code.
- Payload: `{ message, locale?, sessionId?, history?, captchaToken? }` → `{ reply, references, usedFallback, promptCount, rateLimitRemaining, captchaRequired? }`.
- Fallback: Uses retrieved evidence/resume link when model missing or API fails.
- Env: `OPENROUTER_API_KEY` (optional), `OPENROUTER_MODEL` (optional, default `openrouter/anthropic/claude-3-haiku-20240307`).

## Retrieval Library (`apps/site/src/lib/ai/chatbot.ts`)
- Loads instruction pack, anchors, and embedding index (cached in-memory).
- Tokenizes + scores chunks; supplies bridge hint for Kubernetes → Docker/ECS ramp.
- Builds context block and reference list for the prompt and client rendering.

## Client UI
- Provider: `ChatbotProvider` wraps the app in `app/layout.tsx`, using locale-specific copy from dictionaries.
- Floating launcher: bottom-right circle using `public/ai_bubble_icon.svg`; state stored in `sessionStorage` (clears per session).
- Panel: intro, example chips, markdown-friendly replies, reference links, captcha entry, error + resume fallback, logging notice.
- Inline CTA: `ChatInlineCard` embedded in home, experience, and meetings sidebars to seed prompts quickly.
- Accessibility: focus management on open, buttons labeled, minimal motion, respects reduced-motion via global styles.

## Telemetry and Safety
- Logging notice always shown: “This chat is monitored for quality assurance purposes.” (aligns with WBS guardrail).
- Rate limit + captcha enforced server-side; client mirrors prompt count status.
- PII scrubbing in retrieval corpus (email/phone redaction).

## Known Gaps / Follow-ups
- TypeScript type errors currently present (dictionaries/experience types) — not fixed per request.
- Tests pending: retrieval scoring, API contract (mocked OpenRouter), and Playwright happy-path + captcha + rate-limit flows.
- Secrets: add `OPENROUTER_API_KEY` (and optional `OPENROUTER_MODEL`) to `.env.example` and deployment environment.
- Abuse logging/retention: ensure downstream storage honors 30-day deletion; add redaction guardrails if persisting server-side logs.

## Quick Usage
- Local smoke: start dev server, open `/en` → use floating launcher; try 3rd prompt to trigger captcha.
- Fallback path: remove `OPENROUTER_API_KEY` to verify graceful resume-link response.
