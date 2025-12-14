# Task F1.5 — Chatbot Rate Limits & States

## Objective
- Clean up chatbot rate-limit, error, captcha, and moderation states; keep styling consistent with theme/contrast; produce screenshots and QA notes for error flows.

## Rate limiting without cookies/tracking (guidelines)
- Keep rate limiting server-side with short-lived, non-identifying keys. Hash the client IP (e.g., `sha256` → short prefix) and store a 1h sliding bucket in memory/Redis; do not set cookies/localStorage for rate limiting.
- Treat this as “strictly necessary” processing: bound the window to 1h, drop buckets after expiry, and avoid logging raw IPs. If IP is `unknown`, fall back to a smaller allowance plus immediate captcha to reduce abuse.
- Persist captcha solves, not identities: store a 1h TTL flag keyed by the hashed session/IP; never write it to the browser.
- Multi-node: back hashed-IP buckets and captcha TTLs with a shared store (Redis with `EXPIRE`) so limits hold across instances without browser identifiers.
- Logging: keep to hashed IP + session, sanitized prompt/reply, rate-limit remaining, and model info with short retention. Note this in the consent/privacy copy; no analytics/marketing cookies are required.

## Current state (apps/site)
- API (`apps/site/app/api/chat/route.ts`): 10 prompts/hour per IP (hashed), captcha from 3rd prompt unless a 1h “solved” flag exists; no cookies are used. Logs hash IP/session to stdout + `logs/chatbot/*.jsonl`.
- Client (`apps/site/src/components/chat/ChatbotProvider.tsx`): session kept in `sessionStorage`. Generic error rendering; 429 rate-limit responses share the same danger box with the resume link. `rateLimitRemaining`/`Retry-After` are returned but not displayed. No dedicated “you hit the limit” state or localized copy.
- Styling: captcha/error blocks reuse default surface/danger tokens; high-contrast tweaks exist for header/launcher, but special states (rate-limit, captcha) lack explicit contrast/status treatments.

## Gaps to close during F1.5
- UX states: add a distinct rate-limit state (detect 429) with localized copy (“come back in X minutes”), disable input while limited, and surface remaining prompts/time when available.
- Indication of status: 
  - Differentiate generic failures vs. rate-limit vs. captcha-required vs. moderation.
  - Add "Thinking" status indicator. Disable prompting while thinking (Turn prompt field into the thinking indicator).
  - Add dictionary tokens (EN/JA/ZH) for each state.
- Styling/accessibility: 
  - Set a max height for the window.
  - Fix the "X" close button: We want a circle with the x centered perfectly.
  - Polish captcha block (contrast-friendly borders/background, focus rings, disabled/pending handling).
  - Reduce visual clutter. Trim unnecessary text.
  - Keep special states visible within the scroll area on mobile.
- QA/DoD: capture screenshots for normal, rate-limited, captcha-required, and moderation fallback states (desktop + mobile); record brief manual QA notes for error/rate-limit flows.

## Enriching resume.json to boost chatbot context
- Author/update entries in `apps/site/public/resume.json` with concise writeups per role/project (impact, metrics, tech) and ensure anchors map to existing experience/tech-stack routes.
- Regenerate chatbot corpus: run the embeddings build script (`pnpm exec tsc -p scripts/ai/tsconfig.json && node .tmp/chatbot-build/build-chatbot-index.js`) to refresh `apps/site/data/ai/chatbot-embeddings.json` and `tech-anchors.json` after resume edits.
- Spot-check retrieval: run local chat with a few new questions; confirm replies cite the new resume snippets and allowed links, then commit the updated JSON + regenerated AI data.
- Note changes in this task’s QA notes (what context was added and which questions improved).

## Owner / status
- Owner: Jack
- Status: Completed — rate-limit/captcha/moderation states polished with QA artifacts; remaining stretch items intentionally deferred per scope lock.
