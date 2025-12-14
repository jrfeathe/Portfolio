# Task 10a.0 — Personalization Brief

## Objective
Capture a concrete creative brief that explains how the portfolio home experience should feel once personalization lands. The brief must summarize the current site audit, codify tonal/voice goals (warm, first-person, credible), and provide mood-board references so downstream tasks (10a.1–10a.3) can ship copy and visuals without reinterpreting intent.

## In Scope
- Auditing the existing home experience end-to-end (hero, proof chips, CTA buttons, footer) to document what currently feels mechanical or impersonal, including screenshots and notes on color, typography, and microcopy.
- Collecting 4–6 inspiration references (portfolio sites, brand guidelines, photography palettes) and distilling shared attributes: warmth, approachability, credibility, inclusivity.
- Defining tonal pillars (e.g., “calm confidence,” “evidence-forward warmth”) and mapping each to copy, imagery, and interaction guardrails.
- Updating the content style guide with first-person voice principles: tense defaults, sentence length, pronoun usage, CTA tone, and when to switch to third-person for credibility.
- Describing priority home modules and their narrative job (hero, proof bar, testimonials, tech-stack spotlight) so follow-on tasks understand what must be rewritten versus visually refreshed.
- Aligning on success signals and sign-off path with stakeholders (self + any reviewers) and capturing next steps for Tasks 10a.1–10a.3.

## Out of Scope
- Writing new production copy (Task 10a.1 handles rewrites).
- Adjusting design tokens or implementing UI changes in code (covered by Task 10a.2).
- Building the tech-stack spotlight layout (Task 10a.3).
- Running user interviews or quantitative surveys; rely on heuristic audit + existing qualitative feedback.

## Deliverables
- `docs/personalization/brief.md` (new) with:
  - Current-state audit table (section, observation, tone issue, opportunity).
  - Mood-board collage links and adjective matrix.
  - Tonal pillars + do/don’t lists.
  - Narrative priorities per home module and CTA.
- Updated content style guidance appended to `docs/content-style-guide.md` (or a new section if the file does not exist yet) covering person voice, contractions, CTA verbs, and accessibility notes for inclusive language.
- Screenshots (PNG or embedded image links) stored under `docs/personalization/reference/` to make the audit repeatable.
- Stakeholder approval notes (date, reviewer, decision) appended to the brief.

## Acceptance Criteria
- Brief explicitly lists pain points from the current home experience and maps each to an actionable personalization lever (copy, imagery, motion, hierarchy).
- Mood-board inspirations cover at least three distinct sources and annotate why each supports the “warmer feel” objective.
- Tonal pillars translate into concrete writing guardrails referenced by Task 10a.1 (e.g., max reading grade, when to use humor).
- Content style guide reflects the new tone and is referenced inside the brief.
- Stakeholder sign-off recorded in the brief with next steps for copy, design tokens, and layout work.

## Implementation Plan

1. **Discovery & Inputs**
   - Capture current `/[locale]` home screenshots in light/dark themes.
   - Export existing copy blocks (hero headline/subheadline, CTA labels, proof chips, intro paragraph).
   - Gather any prior feedback from `COMPLETED_TASKS.md` or changelog entries that mention tone.

2. **Audit Current Experience**
   - Create an audit table noting color temperature, spacing, typography, and copy tone per section.
   - Score each section on warmth/approachability (1–5) and explain the rating.
   - Highlight blockers preventing immediate personalization (e.g., shared tokens, hard-coded CTAs).

3. **Mood-board & Inspiration**
   - Collect references (Dribbble shots, Behance spreads, screenshots, photography swatches) that align with “warm professionalism.”
   - Group references by theme (color, typography, microcopy) and annotate overlap with the site’s brand values.

4. **Define Tonal Pillars & Guidelines**
   - Draft 3–4 tonal pillars with descriptions, supported emotions, and example sentences.
   - Document writing mechanics: POV, tense, sentence length, CTA verbs, inclusive language (avoid gendered metaphors).
   - Update/author the content style guide section and link it from the brief.

5. **Prioritize Sections & Next Steps**
   - Outline the narrative job of each home module and specify whether it needs copy, visual, or structural changes.
   - List dependencies for Tasks 10a.1–10a.3 (e.g., token changes, content entry updates).
   - Obtain reviewer sign-off, record decisions, and open follow-up TODOs/issues if needed.

## Risks & Mitigations
- **Subjective tone alignment stalls progress** — Anchor pillars in concrete examples and secure early async feedback on the mood-board before finalizing the brief.
- **Scope creep into copy/design execution** — Maintain a strict boundary: document what to change and why, but defer actual implementations to Tasks 10a.1–10a.3.
- **Missing content style guide baseline** — If no guide exists, create a lightweight version now; future tasks can expand it, but 10a.0 must establish MVP guidance.

## Open Questions
- Which stakeholders must sign off (self only, mentor, hiring partner)? Document expectations before scheduling review.
  - Self only
- Are there specific industries or companies whose tone should influence the brief (e.g., developer advocacy vs. product leadership)?
  - Tone should be professional but also casual. For Japanese, formal speech yet also touches of whimsical. Avoid corporate speak and cringe. Keep things to the point. Trim all fat.
- Should the warmer tone extend to system emails/notes, or only the marketing site? Flag for later tasks if broader scope is desired.
  - Tone should apply to all text everywhere.
