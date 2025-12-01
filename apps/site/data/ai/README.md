# AI Chatbot Notes (v0)

This folder holds the chatbot instruction pack and future artifacts (embeddings, anchor maps).

## What’s here
- `chatbot-instructions.md` — system prompt: persona, answer pattern, bridging rules, safety, and example Q&A (includes logging notice).

## What to add next
1) **Tech anchor map**  
- Export a static list of tech items → stable anchors (mirrors the carousel logic in `apps/site/app/[locale]/page.tsx:96`).  
- Source data: `apps/site/data/tech-stack-details.json` and projects under `apps/site/data/projects/**`.  
- Suggested output: `apps/site/data/ai/tech-anchors.json` with entries `{ id, name, href, locale }`.
2) **Embedding index**  
- Script `scripts/ai/build-chatbot-index.ts` to chunk `tech-stack-details.json` + project content (and case studies if needed), generate embeddings, and write `apps/site/data/ai/chatbot-embeddings.json` (include source URLs).
3) **API route/server action**  
   - `apps/site/app/api/chat/route.ts`: read `chatbot-instructions.md`, run retrieval from the embeddings file + anchor map, call OpenRouter with low temperature, enforce 10 prompts/hour and captcha from the 3rd prompt, log with 30-day retention + QA notice.
4) **Client UI**  
   - `apps/site/src/components/chat/Chatbot.tsx`: floating circle launcher (icon at `public/ai_bubble.png`), session-persistent history, example chips, markdown rendering, retry/error states, locale-aware replies.
5) **Config & secrets**  
   - Add env vars for OpenRouter API key + model, captcha key, rate-limit salts. Document in `.env.example` and `apps/site/README.md`.
6) **Tests & QA**  
   - Unit tests for prompt builder/retrieval, mocked provider tests for the API route, Playwright happy-path + abuse/rate-limit paths, locale switching coverage.

## Usage notes
- Tone: confident, concise, affirmative; bridge adjacent skills when exact tech isn’t listed.
- Logging: surface “This chat is monitored for quality assurance purposes.”; delete logs after 30 days.
- Localization: respond in the prompt language; default examples to the page locale.
