# Task 10a.KING — AI Chatbot

## Objective
Add a recruiter-facing AI chatbot on the portfolio site so visitors can ask capability questions (e.g., “Can Jack use React?”, “Can Jack save my company money?”) and receive fast, persuasive, and grounded answers that link to Jack’s experience.

### Prompt Recap
- “Implement an AI chatbot so recruiters can ask quick questions about the portfolio (e.g., ‘Can Jack use React?’, ‘Can Jack save my company money?’). Bias toward saying yes while staying truthful; when a tech isn’t listed, bridge to adjacent skills (e.g., Kubernetes → mention Docker/ECS and ramp) and link to the relevant experience/tech stack entry. Provide an instructions file to guide responses.”

## Current Pain
- Recruiters skim quickly and may miss relevant experience; no interactive way to clarify skills.
- Static pages can’t tailor answers to a recruiter’s phrasing or follow-up questions.
- Without clear instructions, a chatbot might under-sell skills or hallucinate unsupported claims.

## Inputs & Dependencies
- Tech sources: `apps/site/data/tech-stack-details.json` plus project content under `apps/site/data/projects/**`; case-study pages under `apps/site/app/[locale]/**` as needed.
- Tech stack: Next.js app router, React components under `apps/site/src/**`, UI kit under `@portfolio/ui`, telemetry patterns already in use.
- API provider (e.g., OpenAI, Anthropic) or self-hosted model; API key storage via existing env/secret management.
- Optional vector store for retrieval (simple on-disk embeddings file or lightweight hosted store).

## Experience Overview
- Entry point: inline widget on key pages (home hero, experience, contact) plus a floating launcher for quick access.
- Launcher: circular button with custom icon at `apps/site/public/ai_bubble.png`, anchored bottom-right, remembers state across routes within a session, clears when a new session starts.
- UX: small chat panel with system intro (“Ask about Jack’s skills, projects, or impact.”), example chips, and persistent history within a session.
- Responses: concise (2–5 sentences), affirmative framing, links to supporting sections (e.g., “Tech stack → Frontend → React”) with anchor URLs.
- Fallback: graceful error state with a link to the resume PDF/JSON if the model or retrieval fails.

## Response Behavior & Style (Instruction Pack)
- Bias toward “yes, and” while staying truthful; when experience is adjacent, bridge explicitly (e.g., “While Kubernetes isn’t listed, Jack ships containerized services with Docker/ECS and can ramp to k8s quickly.”).
- Ground every substantive claim in a retrieved fact (experience bullet, tech stack entry, metric); include a short pointer (“See Experience → Acme Corp → Performance”) or link if available.
- Keep tone professional, confident, and concise; avoid hedging language unless risk is real.
- If unsure, state the closest verified skill and propose a next step (“Not listed, but adjacent X; can confirm in a quick call.”).
- Refuse only for inappropriate/off-topic prompts; redirect to professional context.
- Always prefer present-tense capability (“can do”), not “once did,” unless clarifying recency.
- Locale-aware: respond in the language of the prompt; default to the page locale for initial examples/prompts.

### Recommended Instruction File
Create `apps/site/data/ai/chatbot-instructions.md` (or `.yaml`) consumed as the system prompt. Suggested sections:
- **Persona**: “You are Jack’s recruiter-facing assistant. Be confident, concise, and opportunity-focused.”
- **Answer Pattern**: 2–5 sentences → lead with yes/solution → cite supporting experience → offer link/next step.
- **Evidence Map**: bullet references to recurring proof points (React, TS, Node, Design systems, Cloud/containerization, Performance, Cost savings, Leadership, AI/LLM exposure) with the canonical link text to use.
- **Bridging Rules**: how to answer when skill not explicitly listed (mention adjacent skill + ramp statement + link to closest proof).
- **Banned/Redirect Topics**: personal data, salary, private details; respond with a redirect to professional info.
- **Style Tokens**: active voice, no emojis, no filler, markdown links allowed.
- **Examples**: A few Q→A pairs showing the desired bias and link style (include the Kubernetes pattern from the prompt).

## Data & Grounding
- Derive the knowledge base from `apps/site/data/tech-stack-details.json`, projects in `apps/site/data/projects/**`, case studies, and selected blog posts (resume JSON is being deprecated).
- Add a static tech-anchor map for chatbot linking (mirrors the dynamic tech stack carousel logic at `apps/site/app/[locale]/page.tsx:96`) so answers can pull stable anchors/URLs from one source of truth.
- Build a small embedding index (e.g., `apps/site/data/ai/chatbot-embeddings.json`) so answers stay anchored; include source URLs/anchors for linking.
- Keep PII out of the corpus; redact phone/email if not already public.
- Refresh embeddings whenever tech-stack or project content changes; script this under `scripts/ai/build-chatbot-index.ts`.

## Safety & Quality Guardrails
- Provider/model: start with OpenRouter (free/low-cost tier acceptable) with strict rate limiting.
- Rate limits & abuse controls: 10 prompts/hour per user/IP. Allow first two prompts without captcha; require captcha on the third and beyond. Monitor for abuse.
- Inject safety instructions: stay professional, avoid confidential info, no speculative salary/location talk.
- Length cap per reply (e.g., 120–180 words); invite a follow-up instead of overlong answers.
- Deterministic defaults: low–mid temperature (0.2–0.4), top_p ≤ 0.9, max_tokens tuned for brevity.
- Logging: capture prompt, retrieved chunks, and response (with PII scrub) for QA; store only if privacy-compliant.
- Transcript policy: show notice “This chat is monitored for quality assurance purposes.” Store logs server-side and delete after 30 days.

## Implementation Plan
1. **Instruction Pack**: author `apps/site/data/ai/chatbot-instructions.md` with persona, rules, examples (include the Kubernetes “adjacent skill” pattern). Version it alongside WBS notes.
2. **Retrieval Corpus**: export resume/experience into chunks with URLs, build embeddings file, and document the refresh script and trigger.
3. **API Wiring**: add server action or API route (e.g., `apps/site/app/api/chat/route.ts`) that reads the instruction file, runs retrieval, and calls OpenRouter with safety settings; enforce 10 prompts/hour, add captcha from the third prompt onward, and monitor abuse.
4. **UI**: create `Chatbot` component under `apps/site/src/components/chat/` with a floating trigger, example chips, markdown rendering, and retry/error states. Respect light/dark and reduced motion. Persist chat state across routes within a session; clear on new sessions.
5. **Linking**: ensure responses can insert internal anchors (`/experience#react`, `/tech-stack#cloud`) and that these anchors exist; expose the static tech-anchor map to the chatbot.
6. **Telemetry**: log question categories, retrieval hits, completion latency, and failures; include captcha/rate-limit events; retain transcripts 30 days with the visible notice.
7. **QA**: add unit tests for the retrieval + prompt builder, mock-provider tests for the API route, and Cypress/Playwright happy-path plus safety-path checks. Include locale-switch tests to confirm language matching.
8. **Docs**: update `COMPLETED_TASKS.md` and add a short README under `apps/site/data/ai/` explaining how to refresh the corpus, rotate keys, and manage rate-limit/captcha settings.

## Acceptance Criteria
- Instruction file exists at `apps/site/data/ai/chatbot-instructions.md` with persona, answer pattern, bridging rules, banned topics, and examples.
- Chat UI renders on key pages, supports multi-turn within a session, and links to supporting sections.
- Responses are affirmative yet truthful, citing at least one grounded source when applicable; unsupported skills are bridged to adjacent strengths.
- Retrieval index built from resume/case-study content; refresh script documented and runnable locally.
- Errors degrade gracefully with a resume link fallback; telemetry captures usage and failures; rate limiting (10/hr) and captcha-on-3rd+ prompt in place.
- Locale-aware responses verified; tests for prompt assembly/retrieval run and pass; manual QA confirms tone, links, and safety behaviors.

## Answered Questions
- Which LLM provider/model/tier should we target first (cost/performance), and do we need an offline/dev fallback?
  - OpenRouter seems like a good choice. We are aiming for free tier/ low cost. Heavy rate limiting is acceptable.
- Where should the floating launcher live (site-wide layout vs. select pages), and should it remember state across routes?
  - We want a circle in the bottom right with a custom icon. Demo drawing at /apps/site/public/ai_bubble.png. It should remember state across pages, but should be cleared for a new session.
- What anchor/link structure do we want for tech stack/experience references to keep links stable for the chatbot?
  - We should give the chatbot a map of tech items and their links, that way it can simply grab the redirection point from one source of truth. This data is already present in the project for the tech stack carousel, but is done with logic at apps/site/app/[locale]/page.tsx:96. We effectively want a static version of this logic, so the chatbot can quickly redirect.
- Do we want localization-aware instructions (per-locale system prompts) or English-only responses for v1?
  - Yes we want to be locale specific. The replies should match the selected language, unless the user types in a different language. We should reply in the language of the prompt.
- How strict should rate limits be for anonymous traffic, and do we need captcha/abuse monitoring?
  - Rate limits should be rather strict as this utility has a high abuse potential. The first two prompts should not have a captcha, but for the third prompt we should have one. Set a rate limit of ten prompts per hour. Monitor for abuse.
- Is logging of chat transcripts allowed for QA, and if so, where/how long can we retain them?
  - Yes we should log. Users will be warned "This chat is monitored for quality assurance purposes". Store on the server and delete after 30 days.

Document owner: Jack Featherstone. Update this spec as implementation details evolve during 10a.KING.
