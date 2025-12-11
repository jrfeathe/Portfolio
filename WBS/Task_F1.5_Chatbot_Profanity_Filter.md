# Task F1.5 (F1.5.2) — Chatbot Profanity Filter

## Objective
- Add a hardened, two-pass profanity/trolling/gross-personal-question check for chatbot prompts using `glin-profanity` as a first-pass filter and an OpenRouter moderation prompt as a second opinion.
- Keep pass 1 lightweight on resources (minimal context, short prompt, small/cheap model); preserve current chatbot behavior for clean prompts.
- Extend coverage and QA for Japanese and Simplified Chinese inputs.

## Proposed flow
- Normalize inbound text (casefold, Unicode NFKC, strip zero-width/extra whitespace, de-leet) before checks; keep a copy of the raw prompt for logging with redaction.
- Pass 1 (local/blocklist): run `glin-profanity` with categories tuned for profanity, trolling/harassment cues, and gross personal questions; treat empty/URL-only/system prompts as benign and skip.
- If pass 1 is clean → go directly to existing chatbot flow (pass 2) unchanged.
- If pass 1 flags → send the prompt to OpenRouter with a short moderation system prompt to classify: obscene/profane, trolling/harassment, sexual/innuendo, doxxing/gross personal question (only when harmful/overly intrusive beyond public portfolio facts), self-harm or violence encouragement. Reply only with a label and confidence; do not include completions.
- On confirmed/ambiguous unsafe labels: return the existing refusal message; log the label + trigger terms; no chatbot call. Bias toward leniency on portfolio-relevant personal questions (e.g., “Where does he work?”) unless intent is malicious or asks for non-public details.
- On clear-safe label: proceed to pass 2 (normal chatbot) but retain the moderation label in logs for auditing.

## AI-first refinement (reduce false positives):
- Keep only the minimal local gates: doxxing regex (addresses/IDs), slurs/profanity via glin+LDNOOBW, and obvious sexual/body-part hits. Remove broad catch-alls like generic “love”/“broad” so we stop fighting false
  positives locally.
- Provide minimal but explicit context: “Portfolio chatbot. Normal questions: skills/tech/experience/availability. Only block harassment/sexual innuendo/PII. Don’t block ordinary professional questions or neutral words like
    ‘broad’ when used non-sexually.”
- Ask the model to return structured JSON with label + confidence + a short reason. Labels: SAFE, PROFANITY, HARASSMENT_OR_TROLLING, SEXUAL_INNUENDO, PRIVACY/DOXXING, SELF_HARM/VIOLENCE, OTHER_UNSAFE.
- Add a confidence threshold and ambiguity handling:
  - If label != SAFE and confidence ≥ 0.7 → block (use FLAG_NO_FUN).
  - If label != SAFE but confidence < 0.7 → treat as ambiguous: allow through but log moderation metadata.
  - If SAFE → proceed.
- Lean on the moderation model with richer intent cues.
- Include a “professional intent” hint: pass a short descriptor (e.g., { intent: "professional/tech Q&A about Jack's skills" }) so the model understands expected safe usage.
- Add a small allowlist check for tech terms (React, TypeScript, skills, experience) that can downgrade low-confidence unsafe labels to SAFE when the text is otherwise professional.
- Always send non-structural prompts (anything beyond empty/URL-only/system markers) to the OpenRouter moderation pass. Use local cues to compute a lightweight “suspicion score” (self-harm/doxxing +0.4, harassment/profanity/sexual-body +0.25, personal-sensitive +0.2, unprofessional intent +0.1; cap at 1). Block when label != SAFE and (confidence ≥ 0.7 **or** suspicion ≥ 0.5); otherwise allow and log. If OpenRouter is unavailable, fall back to blocking only severe local cues (self-harm/doxxing/explicit sexual), allow the rest, and log suspicion.

## Implementation notes
- `glin-profanity` setup: enable stemming/inflection where possible; add aliases for leetspeak; keep an allowlist to avoid collisions (e.g., Scunthorpe-style issues, “assess”) and to permit portfolio-context questions about school/tech/experience/employer/location/schedule. Store the list/version so hits can be reproduced.
- Japanese/Simplified Chinese handling: add language detection or script detection; route JA/ZH into language-specific lists/heuristics (common slurs, harassment templates). Ensure normalization retains CJK characters; avoid Latin-only filters.
- OpenRouter moderation prompt: keep context tiny—only the normalized user prompt + a 3–5 line system instruction defining the labels and refusal behavior. For doxxing, require explicit harmful intent or requests for non-public/sensitive personal data; allow benign portfolio questions. Use a small/fast model for this step.
- Resource minimization: avoid sending history/embeddings in pass 1; cap tokens to a small window (e.g., 256–512); short timeouts with a retry of 1 at most. Pass 2 continues to use the current rich context.
- Logging/observability: log pass/fail, label, language, allowlist hits, and which detector fired (`glin`, `OpenRouter`). Strip or hash PII-like substrings when storing logs; keep retention short.
- QA: craft JA/ZH/EN test cases for profanity, innuendo, trolling, and near-miss words. Capture refusal UX and clean-pass UX. Track false positives/negatives and tune allowlist.

## Owner / status
- Owner: Jack
- Status: Planned — flow/design accepted; implementation pending.
