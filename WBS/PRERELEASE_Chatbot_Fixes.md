# PRERELEASE — Chatbot Fixes (Jan 23, 2026)

Scope: fixes and tuning applied during prerelease QA. This file captures the recent changes made across UI, retrieval, and moderation behavior.

## UI + UX
- Standardized chat auto-scroll using a bottom anchor and `scrollIntoView` for sends, replies, and captcha states; added a captcha “ready” hook to scroll after widget render.
- Empty-state card background moved from muted surface to surface for better contrast.
- Chat panel title updated to “Portfolio Assistant” across locales (JA: ポートフォリオ・アシスタント, ZH: 作品集助手).

## Instructions + output formatting
- Updated chatbot instructions to avoid “case studies” language and removed obsolete `/tech-stack#cloud` example.
- Clarified that identity/role questions like “Who is Jack?” are safe and should be answered.
- Added a rule to avoid raw URLs in the reply body (references list is authoritative).
- Added guidance for cost/efficiency responses: infer potential savings from performance/observability work without claiming explicit savings unless present in context.

## Retrieval + grounding
- Improved cost/efficiency retrieval by expanding cost-related tokens and adding a cost-efficiency bridge hint that points to portfolio performance/observability evidence.
- Fixed work/education filtering to avoid resume-only truncation when the question isn’t explicitly about the resume (future-proofed for new roles).

## Moderation + safety
- Safe-phrase bypass now skips pass1 moderation; expanded local matching with regex templates and pronoun/tense normalization.
- Added JA/zh safe-intent patterns to reduce false blocks on common recruiting questions.
- Pass1 prompt now uses a compact safe-topics guide instead of a long safe-phrase list (lower token usage).
- Pass2 (answering) now receives a safe-intent hint when local moderation indicates a standard recruiting question, and system instructions explicitly forbid FLAG_NO_FUN on safe intent.

## History handling
- Only complete user→assistant message pairs are sent as history; any blocked or FLAG_NO_FUN turns are dropped to avoid model confusion on subsequent questions.

## Files touched
- apps/site/src/components/chat/ChatbotProvider.tsx
- apps/site/src/components/chat/HCaptchaWidget.tsx
- apps/site/src/utils/dictionaries.ts
- apps/site/data/ai/chatbot-instructions.md
- apps/site/src/lib/ai/chatbot.ts
- apps/site/data/moderation/safe-phrases.txt
- apps/site/data/moderation/safe-phrase-patterns.txt
- apps/site/src/lib/ai/moderation.ts
- apps/site/app/api/chat/route.ts
