# Task 10a.1 — Personalized Home Copy Rewrites

## Objective
Rewrite every piece of home-page copy so the experience reflects the tonal pillars captured in `docs/personalization/brief.md` and the concrete sentences in `docs/personalization/brief_draft.md`. This task owns the textual and content-architecture changes (hero headline, CTAs, section names, chip content, footer language, tech stack data) while leaving the visual/UI refactors (portrait swap, slider controls, carousel affordances) to Task 10a.2.

## Inputs
- Personalization brief (`docs/personalization/brief.md`) and draft copy notes (`docs/personalization/brief_draft.md`)
- Tone guardrails in `docs/content-style-guide.md#personalization-tone`
- Current dictionary + component implementation (`apps/site/src/utils/dictionaries.ts`, `apps/site/app/[locale]/page.tsx`)
- Footer component (`apps/site/src/components/Shell/Footer.tsx`)
- Existing Playwright smoke coverage (`apps/site/tests/home.skim.spec.ts`, `apps/site/tests/downloads.spec.ts`)

## In Scope
- Replacing the hero heading, subtitle, and breadcrumb copy (H1 becomes “Jack Featherstone,” subtitle replaced with the autobiographical paragraph, breadcrumb reduced to a single `Home` link).
- Reordering and renaming hero CTAs so `Download resume` (primary) comes first, `View experience` (secondary → `/experience`), and `Book a short intro` (ghost → `/meetings`). Remove the CTA description text entirely.
- Updating section metadata so the navigation and content blocks read `Site purpose`, `Tech stack & skills`, `Past achievements`, and `Current projects & plans`, with the new paragraphs, lists, and chip content outlined below.
- Defining the tech stack data (name, href, asset slug) for React, HTML, CSS, JavaScript, TypeScript, C, C++, Java, Linux, JSON, Bash, XML, KVM, QEMU, PostgreSQL, SQL, Lua, Prisma, Oracle Cloud, AWS, Stellaris Mods, and Minecraft Mods. Task 10a.1 just publishes the structured data; Task 10a.2 will handle the carousel UI.
- Rewriting the footer headline, tagline, contact email, and copyright line per the brief.
- Keeping English, Japanese, and Chinese (Simplified) dictionaries in sync: English ships first, but stub entries (with TODO comments) must exist for ja/zh so the build does not regress. Link any missing translations to Task 12.x or note inline for follow-up.
- Updating automated tests and snapshots so they assert against the new CTA labels and section headings instead of the removed copy.

## Out of Scope
- Designing/implementing the new portrait asset, rounded 3-position toggles, skim-mode button, or the tech-stack carousel interaction (Task 10a.2).
- Building the `/experience` or `/meetings` routes; this task only wires CTAs to those paths and documents that they currently 404 until their respective tasks land.
- Any adjustments to localization routing, skim-mode logic, or structural SEO schema beyond what is required to deliver the new text strings.

## Deliverables
- Updated dictionary file (`apps/site/src/utils/dictionaries.ts`) with:
  - Hero heading/subtitle swaps, CTA configuration changes, and optional CTA description handling.
  - New `home.sections.techStack` entry (eyebrow/title/description/overview + array of tech logo metadata).
  - Rewritten `mission`, `proof`, and `roadmap` entries renamed to `sitePurpose`, `pastAchievements`, `currentProjects` (or keep existing keys but with the new text if refactor risk is too high), including the bullet/next-steps arrays.
  - Placeholder TODO strings for ja/zh with clear comments when translations are not ready.
- Adjusted breadcrumb resolver in `apps/site/app/[locale]/page.tsx` (or a helper) so only the `Home` crumb renders until a secondary destination exists.
- CTA/layout fallback updates so `StickyCTA` renders without a description and CTA actions always render as anchors with `href`s.
- Footer copy edits inside `apps/site/src/components/Shell/Footer.tsx`, including the new email (`jfstone2000@proton.me`) and closing line (“2025. Jack Featherstone. Built with Codex, Next.js, pnpm, and spiritual pressure.”).
- Documentation snippet inside `docs/personalization/brief.md` (or a short appendix) pointing to this task as the implementation blueprint for copy updates.
- Passing Playwright specs reflecting the new labels (`apps/site/tests/home.skim.spec.ts`, any other tests that assert against hero/subsection strings).

## Copy Source of Truth (English)

### Header & Hero
| Element | Copy / Link | Notes |
| --- | --- | --- |
| Breadcrumbs | Single crumb: `Home` → `/{locale}` | Remove “Workspace overview.” |
| Hero `title` | `Jack Featherstone` | Replaces “Portfolio.” |
| Hero `subtitle` | `Hi, I'm Jack and this is my Software Engineering portfolio! I'm looking to begin my career as a Junior Fullstack Developer. The intent of this site is to prove my skills and abilities, and to capitalize on opportunities to network.` | Break into two sentences if needed for responsive layouts. |
| Hero media caption | `Self portrait captured for the 2025 personalization refresh.` | Alt text: “Portrait of Jack Featherstone standing under warm light.” (Asset swap handled later.) |
| CTA title | Keep `Need proof fast?` unless future guidance emerges. |
| CTA description | Remove (set to `undefined`). Sticky CTA component must gracefully hide empty descriptions. |
| CTA actions | 1) `Download resume` — variant `primary`, `href="/resume.pdf"`, retains download attribute.<br>2) `View experience` — variant `secondary`, `href="/experience"`. <br>3) `Book a short intro` — variant `ghost`, `href="/meetings"`. | Ensure `View experience` no longer points to `/notes`. Even if `/experience` 404s today, wire the new path and document the dependency. |

### Sections & Sidebar Copy
| Section | Eyebrow | Title | Description | Body content |
| --- | --- | --- | --- | --- |
| Site purpose | `Site purpose` | `Site purpose` | `Create distinctive evidence of my abilities for fullstack development, showcasing my capabilities to job recruiters in under three clicks.` | Overview paragraph: `While the site began as a dedicated service to host my resume, it evolved into a central place for hosting my personal projects.` No bullet list. |
| Tech stack & skills | `Skills` | `Tech stack & skills` | `Quick snapshot of the tools I rely on for coursework, hobby projects, and freelance tinkering.` | Overview paragraph: `Every logo links to canonical documentation so you can jump straight to the source.` Data rows defined in the Tech Stack inventory below. |
| Past achievements | `Past achievements` | `Past achievements` | `Relatable highlights from the past few years.` | Overview: `Each card focuses on a project or role that tells the story behind the skills shown above.` Chips:<br>- `Rollodex` — `Co-led development of a contact management web application.`<br>- `Quester2000` — `A point tracking to-do list tool for managing your work-life balance.`<br>- `SER321 TA` — `Supported a high level Distributed Software Systems course as a teacher’s assistant.`<br>- `Stellaris Modding` — `Upgraded the memory management library for Stellaris to boost performance.` |
| Current projects & plans | `Current projects & plans` | `Current projects & plans` | `My current focus is on building some small scale projects that make a difference in my life. G.O.A.T.: Grind, Optimize, Automate, Thrive.` | Overview: `While it is very rewarding to optimize and automate, I also find joy in learning new skills and technologies!`<br>`nextSteps` list:<br>1. `Revisit Quester2000: Add more functionality and improve UI. Possible smartwatch integration.`<br>2. `The Four Horsemen: Develop a new mod for Stellaris to spawn an end-game crisis, compatible with Gigastructural Engineering.`<br>3. `Pixelmon Problem: Continue work to backport an update to Pixelmon to fix a periodic client-side crash on my private server.`<br>4. `C++ Game Engine: Continue work on a private game / engine. Abstract loosely-autobiographical RPG adventure.`<br>5. `Social Networking: Find events to meet people in industry. Considering indie games conventions in NYC.` |

### Tech Stack Inventory (data only; UI handled later)
Create an ordered array of `{ name, href, assetId }` objects (or reuse the existing `ImageDescriptor`) for:
1. React → `https://react.dev/`
2. HTML → `https://html.spec.whatwg.org/`
3. CSS → `https://www.w3.org/Style/CSS/`
4. JavaScript → `https://developer.mozilla.org/docs/Web/JavaScript`
5. TypeScript → `https://www.typescriptlang.org/`
6. C → `https://en.cppreference.com/w/c`
7. C++ → `https://en.cppreference.com/w/cpp`
8. Java → `https://dev.java/`
9. Linux → `https://www.linuxfoundation.org/`
10. JSON → `https://www.json.org/json-en.html`
11. Bash → `https://www.gnu.org/software/bash/`
12. XML → `https://www.w3.org/XML/`
13. KVM → `https://www.linux-kvm.org/page/Main_Page`
14. QEMU → `https://www.qemu.org/`
15. PostgreSQL → `https://www.postgresql.org/`
16. SQL → `https://www.iso.org/standard/63555.html` (or MDN primer)
17. Lua → `https://www.lua.org/`
18. Prisma → `https://www.prisma.io/`
19. Oracle Cloud → `https://www.oracle.com/cloud/`
20. AWS → `https://aws.amazon.com/`
21. Stellaris Mods → `https://steamcommunity.com/app/281990/workshop/`
22. Minecraft Mods → `https://modrinth.com/` (or primary mod distribution site)

Store assets under `apps/site/public/tech-stack/` (or similar) and reference them via predictable filenames (`react.svg`, `postgresql.svg`, etc.) even if Task 10a.2 later swaps the rendering approach.

### Footer
- Heading: `Jack Featherstone - Software Engineering Portfolio`
- Body copy: `Showcasing my purpose, skills, achievements, and interests!`
- Email: `jfstone2000@proton.me`
- Secondary links: keep `Engineering notes` + `Resume (PDF)` until `/experience` ships, but ensure link text aligns with CTA nomenclature.
- Closing line: `2025. Jack Featherstone. Built with Codex, Next.js, pnpm, and spiritual pressure.`

## Implementation Plan
1. **Refactor dictionary structure**
   - Update `AppDictionary` types (and any consumer types) to include `techStack` data and allow optional CTA descriptions.
   - Populate the English strings above verbatim, remove unused mission bullet points, and add the tech stack list.
   - Drop the workspace breadcrumb from `resolveBreadcrumbs` and ensure locale switching keeps working.
2. **Wire copy into the layout**
   - Expand `buildSections` in `apps/site/app/[locale]/page.tsx` to include the new `techStack` entry (even if it reuses placeholder markup for now).
   - Confirm anchor nav order matches the new section order.
3. **Localize + annotate**
   - Update `ja` and `zh` dictionaries with equivalent phrasing. If time-boxed, add TODO comments pointing to Task 10a.4 for proper translations so linters/tests still pass.
4. **Refresh footer + CTAs**
   - Apply the new footer copy and email; ensure `mailto:` link updates.
   - Reorder CTA actions and ensure Playwright selectors reference the new labels; convert the ghost CTA into a link with `href="/meetings"`.
5. **Regression sweep**
   - Run `pnpm --filter @portfolio/site test` and the home Playwright suite to capture string updates.
   - Manually verify `/en`, `/ja`, `/zh` render without missing-string fallbacks and that `/en?skim=1` still sets `data-skim-mode`.

## Acceptance Criteria
- `/en` renders the hero heading “Jack Featherstone” with the autobiographical subtitle and only one breadcrumb (“Home”).
- Hero CTAs appear in the order `Download resume`, `View experience`, `Book a short intro`, and each links to the specified path. Playwright tests assert the new labels.
- The main column shows the four sections listed above (including the newly inserted Tech stack & skills) and each section’s copy matches the Source of Truth text.
- Footer shows the updated heading/tagline/email/closing line, and mailto link opens `jfstone2000@proton.me`.
- Localization builds succeed; no `undefined` or fallback strings render for ja/zh (placeholders clearly marked if translations are pending).
- All unit/integration tests touching home copy strings are updated and passing.

## Risks & Mitigations
- **Missing translations** — If ja/zh rewrites cannot be completed immediately, add temporary English copy plus TODO comments and file a follow-up task so the build remains stable.
- **Broken CTA routes** — `/experience` and `/meetings` do not exist yet; note this dependency in task notes and consider temporary redirects to `/notes` or `/contact` if 404s are unacceptable.
- **Stale UI references** — Tech stack data lands before the carousel UI; add a short-term rendering (simple grid/list) so content is visible and QA-able until Task 10a.2 upgrades it.
- **Test brittleness** — Update Playwright selectors to target data attributes or roles when possible instead of raw text to make future copy tweaks cheaper.

## Open Questions
- Should `/experience` and `/meetings` temporarily redirect to existing pages until their dedicated routes land? (Default: allow a 404 but document the dependency in release notes.)
  - Let's get a quick placeholder / draft page set up for both.
- Do we need to expose the tech stack list via structured data (JSON-LD) in Task 10a.1? (Assumed no; defer to future SEO work unless requirements change.)
  - Not yet necessary, but in the future this is nice to have.

Document owner: Jack Featherstone. Update this file if additional copy decisions emerge before Task 10a.2 kicks off.
