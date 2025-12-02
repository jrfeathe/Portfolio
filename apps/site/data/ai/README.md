# AI Chatbot Notes (v1)

This folder holds the chatbot instruction pack and retrieval artifacts.

## What’s here
- `chatbot-instructions.md` — system prompt: persona, answer pattern, bridging rules, safety, and example Q&A (includes logging notice).
- `tech-anchors.json` — stable anchors for tech stack + experience, per locale.
- `chatbot-embeddings.json` — lightweight bag-of-words index built from tech-stack details, project experience entries, and resume summary.

## Refreshing the corpus
1) Generate artifacts:
   ```
   pnpm exec tsc -p scripts/ai/tsconfig.json
   node .tmp/chatbot-build/build-chatbot-index.js
   ```
   This rewrites `tech-anchors.json` and `chatbot-embeddings.json`.
2) Commit the refreshed files.

## API and UI behavior
- API: `/api/chat` loads the instruction pack, retrieves top chunks, and calls OpenRouter when `OPENROUTER_API_KEY` is set (fallback templated replies otherwise). Reply length is capped to a short, affirmative 2–5 sentences with resume fallback on errors.
- Guardrails: rate limit 10 prompts/hour per IP; captcha required from the 3rd prompt onward (code returned in the response). Logging notice is always included: “This chat is monitored for quality assurance purposes.”
- Client: floating launcher (icon at `public/ai_bubble_icon.svg`) plus inline CTA on home/experience/meetings. State persists in `sessionStorage` per session and clears on a new tab/session.

## Usage notes
- Tone: confident, concise, affirmative; bridge adjacent skills when exact tech isn’t listed.
- Linking: prefer internal anchors from `tech-anchors.json`; otherwise fall back to the closest experience or resume link.
- Localization: respond in the prompt language; default examples to the page locale.
