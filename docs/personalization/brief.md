# Personalization Brief — Home Experience (Task 10a.0)

Prepared to unblock Tasks 10a.1–10a.3 by capturing the audit, tonal direction, inspiration sources, module priorities, and next steps already aligned through stakeholder answers.

## Objective & Guardrails
- Deliver a warmer, first-person home experience while keeping the current color palette intact.
- All rewrites currently target English; tone guidance will inform Japanese and Simplified Chinese copy with a slightly more formal register.
- Visual screenshots are optional. Scope centers on narrative, component direction, and asset swaps.

## Current-State Audit
| Section | Observation | Tone Issue | Personalization Lever |
| --- | --- | --- | --- |
| Header shell | Breadcrumb shows “Home / Workspace overview” and H1 “Portfolio.” | Sounds like an internal tool, not a personal site. | Trim breadcrumb to “Home,” rename H1 to “Jack Featherstone,” pair with autobiographical hero line. |
| Hero visual | Abstract gradient hero art. | Anonymous and sterile—no personal anchor point. | Replace with a 4:3 self portrait paired with a first-person hero statement. |
| Hero copy | “Blueprinting a recruiter-friendly experience…” | Jargon-heavy, third-person tone. | Swap with “Hi, I'm Jack…” paragraph in the draft copy. |
| Mode toggles | Simple dark/high-contrast/language switches. | Utility UI clashes with softer tone. | Use rounded 3-position sliders (Light/Sys/Dark, Normal/Sys/High, 日本語/English/简体中文) plus an obvious Skim Mode button. |
| Side nav | Sections titled “Why this portfolio exists,” “Proof chips & supporting artifacts,” etc. | Mechanical naming; unclear value. | Rename to “Site purpose,” “Past achievements,” “Current projects & plans,” add “Tech stack & skills.” |
| Sidebar CTAs | Secondary paragraph and CTAs (“View case studies,” “Book a 20-minute intro”). | Verbose fluff + routes that mis-match. | Remove filler, make “Download resume” first, add “View experience” → `/experience`, “Book a short intro” → `/meetings`. |
| Site purpose block | Focuses on delivering “measurable proof” in three clicks. | Reads like sales collateral; no personal story. | Replace with clear explanation of site intent and evolution. |
| Tech capabilities | No dedicated tech stack section. | Recruiters infer skills indirectly. | Introduce “Tech stack & skills” carousel with linked logos. |
| Proof chips grid | DORA metrics, leadership range, etc. | Highlights process, not relatable achievements. | Replace with Rollodex, Quester2000, SER321 TA, Stellaris Modding cards. |
| Roadmap section | “What ships next” and “Essential WBS.” | PMO tone, lacks personal motivation. | Rename to “Current projects & plans,” showcase personal goals (Quester2000 updates, Four Horsemen mod, Pixelmon fix, C++ engine, Social networking). |
| Footer | “Jack F. Engineering Portfolio,” old email. | Detached and impersonal. | Update to the new title/tagline, Codex acknowledgment, `jfstone2000@proton.me`. |

## Mood-board & Inspiration
Language drives the warmth, but these references support the desired simplicity and legitimacy.

| Source | URL | Why It Works |
| --- | --- | --- |
| React documentation | https://react.dev/ | Clean typography, direct voice, approachable explanations. |
| HTML Living Standard | https://html.spec.whatwg.org/multipage/ | Uncluttered layout, authoritative but human copy. |
| W3C CSS overview | https://www.w3.org/Style/CSS/Overview.en.html | Straightforward navigation, minimal ornamentation. |
| Tech stack logo links | e.g., `react.svg` → React docs | Each logo doubles as proof-of-skill linking to canonical resources. |

Adjectives: uncluttered, high-contrast, compassionate, concise. Avoid corporate clichés, oversaturated gradients, or gimmicky motion.

## Tonal Pillars & Guardrails
| Pillar | Description | Do | Don’t |
| --- | --- | --- | --- |
| Straightforward Warmth | Speak in first person with concise empathy. | “Hi, I'm Jack…” statements, acknowledge intent. | Slip into third-person bio voice. |
| Evidence Without Ego | Let tangible achievements speak. | Mention specific work (Rollodex, SER321 TA). | Inflate claims with buzzwords or vague metrics. |
| Playful Discipline | Showcase curiosity and rigor without cringe. | Use light phrases like “G.O.A.T.: Grind, Optimize, Automate, Thrive.” | Add slang, emoji-laden sentences, or filler humor. |

### Writing Mechanics
- Reading level: graduate/professional; only use complex vocabulary when it adds clarity.
- Sentence length: vary naturally, one idea per sentence, trim fluff.
- POV: first person when referencing Jack; “you” only for direct reader guidance.
- Contractions: lightly discouraged—prefer full forms unless stiffness results.
- CTA verbs: respectful, direct (“Download,” “View experience,” “Book a short intro”).
- Accessibility: keyboard navigation must work for sliders/skim button; emoji limited to UI icons.
- Localization: apply the same guidance to Japanese and Simplified Chinese (zh) with slightly more formal tone to maintain respect.
- Full guidance lives in `docs/content-style-guide.md#personalization-tone`.

## Module Narrative Priorities
| Module | Narrative Job | Required Changes |
| --- | --- | --- |
| Hero (breadcrumb + H1 + portrait) | Introduce Jack instantly with a face + intent. | Update breadcrumb/H1/copy, swap hero art for portrait. |
| Mode controls + Skim toggle | Let visitors tailor the experience without leaving hero context. | Implement three-position sliders and prominent Skim button. |
| Side nav | Guide recruiters to purpose, skills, achievements, plans. | Rename sections, insert Tech stack & skills anchor. |
| Site purpose | Explain why the site exists and what visitors gain. | Use the new autobiographical paragraphs. |
| Tech stack & skills | Provide quick evidence of technical breadth. | Build horizontal carousel with linked logos (React, HTML, CSS, JS, TS, C, C++, Java, Linux, JSON, Bash, XML, KVM, QEMU, PostgreSQL, SQL, Lua, Prisma, Oracle Cloud, AWS, Stellaris Mods, Minecraft Mods). |
| Past achievements grid | Humanize impact through relatable work. | Replace proof chips with Rollodex, Quester2000, SER321 TA, Stellaris Modding. |
| Current projects & plans | Share present focus and mindset. | Update intro paragraph + list (Quester2000 refresh, Four Horsemen mod, Pixelmon fix, C++ engine, Social networking). |
| Sidebar CTAs | Offer immediate next steps. | Reorder CTAs, rename routes, remove filler copy. |
| Footer | Close with identity and contact info. | Update name, tagline, stack callout, email. |

## Asset & Reference Plan
- Hero portrait: new 4:3 self photo (captured later) replaces gradient; tracked under Task 10a.2.
- Tech stack carousel: store SVG/PNG assets (React, C, etc.) under `public/tech-stack/`; custom art for Minecraft/Stellaris if needed. Placeholder text badge allowed when assets unavailable.
- Reference directory: `docs/personalization/reference/` reserved for future screenshots or mood-board exports. Current plan does not require uploads; document rationale in `README`.
- Color usage: retain existing palette; avoid low-contrast combinations when introducing new cards or sliders.

## Dependencies & Next Steps
1. **Task 10a.1** — apply copy rewrites sourced from this brief.
2. **Task 10a.2** — implement UI changes (hero swap, sliders, CTA routing, carousel scaffolding).
3. **Task 10a.3** — finalize tech stack spotlight visuals/interactions and integrate assets.
4. Capture hero portrait + missing logos before Task 10a.2 reaches QA.

## Task 10a.2 Implementation Notes
- Hero gradient replaced by the temporary portrait placeholder at `apps/site/public/media/hero/portrait-placeholder.svg`, wired through the hero media dictionary entries with localized alt/caption text.
- Theme, contrast, and language controls now use rounded segmented sliders (`SegmentedControl`) with visible focus states, while a dedicated `SkimToggleButton` enables/disables `?skim` directly from the hero block.
- Sticky CTA layout upgraded to a responsive grid so the three CTAs balance in one row on mobile and stack cleanly inside the sidebar on desktop.
- Tech stack data renders through the new `TechStackCarousel` component that scroll-snaps on mobile and becomes a multi-column grid on larger screens; placeholder SVG logos live under `apps/site/public/tech-stack/`.
- Placeholder routes for `/experience` and `/meetings` exist under `apps/site/app/experience` and `apps/site/app/meetings` until their full content ships.

## Stakeholder Sign-off
| Date | Reviewer | Decision | Notes |
| --- | --- | --- | --- |
| 2025-11-10 | Jack Featherstone | ✅ Approved | Self sign-off; completion recorded once downstream tasks execute. |

Document owner: Jack Featherstone. Update this brief if new modules or tone shifts arise.
