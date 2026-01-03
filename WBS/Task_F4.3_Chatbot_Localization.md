# Task F4.3 — Chatbot Localization Notes

Date: 2026-Jan-02

## What the chatbot sends (current pipeline)

### Client → `/api/chat`
File: `apps/site/src/components/chat/ChatbotProvider.tsx`

Payload fields:
- `message` (user input)
- `locale`
- `sessionId`
- `history` (last 6 user/assistant messages)
- `captchaToken` (when hCaptcha is required)

### Server prompt assembly
File: `apps/site/app/api/chat/route.ts`

Key steps:
- Sanitizes `message` (redacts emails/phones, trims whitespace), caps to 1200 chars.
- Trims/sanitizes history (last 6 entries, 1200 chars each).
- Loads AI assets via `apps/site/src/lib/ai/chatbot.ts` from `apps/site/data/ai/`:
  - `chatbot-instructions.md` (system instructions)
  - `tech-anchors.json` (allowed links/labels)
  - `chatbot-embeddings.json` (retrieval chunks)
- Retrieves top context chunks for the request locale (fallback to `en` if missing).
- Builds a “retrieved context” block + allowed-links list (always includes `/resume.pdf`).

### OpenRouter payload
File: `apps/site/app/api/chat/route.ts`

`messages` sent to the model:
1) **system**: `chatbot-instructions.md` + guardrails (2–5 sentences, use only retrieved context, link policy, FLAG_NO_FUN behavior).
2) **history**: sanitized last 6 user/assistant messages.
3) **user**: prompt containing locale, retrieved context block, allowed links list, and the user question.

Model params:
- `temperature: 0.3`
- `top_p: 0.9`
- `max_tokens: 1600`

### Moderation (if OpenRouter key is present)
File: `apps/site/app/api/chat/route.ts`

Separate moderation request with:
- System prompt instructing strict JSON-only output + safety criteria.
- User payload containing normalized message, intent hints, local cues, and suspicion score.

### Logging
File: `apps/site/app/api/chat/route.ts`

JSONL records are appended under:
- `apps/site/logs/chatbot/`

## Tokenizer updates (2026-Jan-02)

Issue:
- The prior tokenizer stripped non-Latin characters, leading to weak JA/ZH matching.

Resolution:
- Added locale-specific tokenizers:
  - Japanese: `kuromoji`
  - Chinese: `@node-rs/jieba`
- Tokenization is now locale-aware in both the index builder and runtime retrieval.

Files updated:
- `scripts/ai/build-chatbot-index.ts`
  - Initializes kuromoji + jieba.
  - Uses locale-specific tokenization per chunk.
  - Tokenizer metadata bumped to `locale-v1`.
- `apps/site/src/lib/ai/chatbot.ts`
  - Lazy-loads tokenizers at runtime.
  - `tokenize` is now async + locale-aware.
  - `retrieveContext` and `buildWorkEducationFacts` updated to await tokenization.
- `apps/site/app/api/chat/route.ts`
  - Awaits `buildWorkEducationFacts`.
- `apps/site/next.config.mjs`
  - Added tokenizer deps to `serverComponentsExternalPackages`.

Dependencies:
- `kuromoji`
- `@node-rs/jieba`

Rebuild steps:
1) `pnpm exec tsc -p scripts/ai/tsconfig.json`
2) `node .tmp/chatbot-build/build-chatbot-index.js`
3) Restart the app server (tokenizers are cached per process).

## Name alias expansion (2026-Jan-03)

- Tokenization now expands Japanese/Chinese name aliases (ジャク / ジャクさん / 夹克) to `jack`.
- Tokenizer metadata bumped to `locale-v2`.
