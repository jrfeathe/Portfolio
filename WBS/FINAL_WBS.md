# FINAL_WBS — REVOLT Launch Pivot

This WBS locks the launch scope after the REVOLT audit, trims feature creep, and reserves a small fast-follow lane for the Tor mirror. Legend: LC = launch-critical; FF = fast-follow after launch; AX = archived/not pursuing now.

## Launch-Critical Streams
### F1 — REVOLT Return to Order (LC)
| ID    | Task                             | Scope / Notes                                                                                                   | Deliverable / DoD                                                    |
|-------|----------------------------------|-----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| F1.1  | WBS reset & codes                | Lock this FINAL_WBS format/codes; remove reliance on legacy WBS; record archived tracks.                        | FINAL_WBS committed with stable F-codes; archived list confirmed.    |
| F1.2  | Diagram/tooling cleanup decision | Decide on removing Mermaid/PlantUML + /api/plantuml; if unused, plan removal steps and owners.                  | Decision noted; removal checklist opened or closed.                  |
| F1.3  | Availability bug fix             | Implement fix and re-run availability/meetings UI across locales; capture QA notes.                             | Slots render correctly; QA notes linked.                             |
| F1.4  | Meetings copy + locale sweep     | Verify meetings/availability copy across locales; align tone and slot labels.                                   | Copy updated; screenshots per locale.                                |
| F1.5  | High-contrast fixes              | Address high-contrast regressions in core pages.                                                                | Before/after screenshots; axe/contrast checks pass for target pages. |
| F1.6  | Chatbot UI & states              | Clean rate-limit/error/captcha states; align styling with contrast/theme.                                       | Chatbot UI screenshots; manual QA notes for error flows.             |
| F1.7  | Mobile layout sweeps             | Verify hero/tech stack/audio/skim/chat on mobile; adjust columns/spacing; ensure sticky CTA behavior is sane.   | Mobile screenshots; list of fixes applied.                           |
| F1.8  | SVG slimming                     | Identify heavy SVGs and simplify/compress.                                                                      | Size deltas recorded; optimized assets committed.                    |
| F1.9  | Manual a11y audit                | Targeted manual audit (SR paths, tab order, focus traps) for home/experience/meetings/skim.                     | Audit notes with no P0/P1; fixes linked.                             |
| F1.10 | Portrait & brand assets          | Add portrait and Codex logo; finalize tech-stack assets.                                                        | Assets committed; references updated; visual check attached.         |
| F1.11 | AudioPlayer stability            | Fix AudioPlayer issues; add music track; verify desktop + mobile playback.                                      | Playback works across devices; regression test or QA notes.          |
| F1.12 | CI restore                       | Get typecheck/Jest/Playwright/budgets green; update flaky tests if needed.                                      | CI pipeline green; notes on any test adjustments.                    |
| F1.13 | SEO/canonicals/robots/sitemap    | Audit sitemap/robots/canonicals/meta; fix gaps introduced by copy/layout changes.                               | Updated files; spot-check log.                                       |
| F1.14 | JSON-LD spot checks              | Re-run rich results checks for home/notes/experience after copy changes.                                        | Validation screenshots/notes; tests passing.                         |

### F2 — Skim Mode MVP (LC)
| ID   | Task                       | Scope / Notes                                                                                                                                                      | Deliverable / DoD                                                                           |
|------|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| F2.1 | Skim rules & test plan     | Freeze skim rules (experience + tech only; hide intro/roadmap/audio; keep nav/resume/need-proof/chat); write test matrix/screenshots list.                         | Documented rules + test checklist.                                                          |
| F2.2 | Layout implementation      | Implement skim layout per rules, including health tile placement (hero in full, footer in skim).                                                                   | UI built; screenshots for desktop/mobile; health tile positions verified.                   |
| F2.3 | Toggle + data gating       | Ensure `?skim` toggles state using skim matrix data; prevent draft content leakage; keep resume/CTA intact.                                                        | Jest/Playwright coverage for toggle and gating; skim matrix wired.                          |
| F2.4 | QA sweep                   | Manual skim/full compare; ensure anchor nav, resume download filename, and chatbot behavior are consistent.                                                        | QA notes filed; issues resolved.                                                            |

### F3 — Localization (LC)
| ID   | Task                  | Scope / Notes                                                                                          | Deliverable / DoD                                                     |
|------|-----------------------|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| F3.1 | Dictionary completion | Finish EN/JA/ZH copy for home/experience/meetings/skim/resume.json; align resume filenames per locale. | Dictionaries updated; lint/tests pass; spot-check of key pages.       |
| F3.2 | Tone/consistency QA   | Tone-check localized strings and ensure formatting consistency (dates, numbers, availability labels).  | QA notes; fixes applied; screenshots per locale.                      |
| F3.3 | Chatbot localization  | Localize chatbot system prompts/UI text; ensure allowed links + moderation copy respect locale.        | Chatbot renders correctly per locale; rate-limit/captcha UX verified. |

### F4 — Deployment (LC)
| ID   | Task                | Scope / Notes                                                                     | Deliverable / DoD                             |
|------|---------------------|-----------------------------------------------------------------------------------|-----------------------------------------------|
| F4.1 | Oracle deployment   | Deploy clear-web site on Oracle Cloud; capture env var/config/runbook.            | Live Oracle deployment; runbook documented.   |
| F4.2 | Domain + TLS        | Configure custom domain + HTTPS; verify redirects/non-www/www and locale routing. | Domain live with TLS; redirect checks logged. |
| F4.3 | Vercel fallback doc | Document fallback path and config if Oracle is unstable.                          | Short fallback guide committed.               |

### F5 — Reliability & Consent (LC)
| ID   | Task               | Scope / Notes                                                                                                                             | Deliverable / DoD                                                              |
|------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| F5.1 | Ping job/script    | Add minimal ping/uptime check (scheduled or manual) and persist sample data.                                                              | Script/job checked in; sample output recorded.                                 |
| F5.2 | Health tile wiring | Render simple health tile using ping data with offline/fallback messaging (hero in full mode, footer in skim).                            | Tile renders with live/sample data and fallback state.                         |
| F5.3 | Consent flow       | Ask permission before setting cookies/telemetry; default to cookieless when declined.                                                     | Consent UI implemented; opt-in/out paths tested.                               |
| F5.4 | Privacy note/tests | Document collected data and consent behavior; add tests for consent persistence and analytics toggle.                                     | Privacy note updated; Jest/Playwright coverage for consent paths.              |

## Fast-Follow
### F6 — Engineering Writeup (FF, content-critical)
| ID   | Task                    | Scope / Notes                                                                                                          | Deliverable / DoD                                           |
|------|-------------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| F6.1 | Draft build/lessons MDX | Draft single MDX note covering build lessons + “Why an Onion Mirror”; remove diagram deps; keep MDX pipeline minimal.  | Draft committed; no Mermaid/PlantUML deps referenced.       |
| F6.2 | Publish & wire links    | Publish note in notes route; add nav/link surface; validate rendering and metadata.                                    | Note live with working links; metadata/JSON-LD still valid. |

### F7 — Tor Mirror (FF after public launch)
| ID   | Task                       | Scope / Notes                                                                                                         | Deliverable / DoD                                                  |
|------|----------------------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| F7.1 | VPS provisioning/hardening | Provision Tor-friendly VPS; firewall/systemd hardening; logging posture defined.                                      | VPS ready; hardening checklist completed.                          |
| F7.2 | NoScript-first render      | Ship JS-free render path for mirror; ensure core content loads at Tor Browser “Safest.”                               | NoScript page serves key content; screenshot proof.                |
| F7.3 | Header/CSP parity          | Align headers/CSP/privacy posture between clear web and mirror; disable trackers by default.                          | Header parity documented; tests or curl captures attached.         |
| F7.4 | Onion-Location + health    | Add Onion-Location header to clear site once mirror is live; optional mirror healthcheck alongside clear-site status. | Header present; mirror status displayed next to clear-site health. |

## Icebox / Archived (AX)
- Our original WBS and associated files have been moved to "WBS/Old WBS".
- Proof chips mapping (1.1), hero/proof rework (10b.0), ADR gallery + diagram pipeline (14.0/14.1), micro-demos (15.x), trade-off explorer (19.x).
- Release automation + roadmap board (17.x); contact page + CLI (18.x); perf badge (20.x).
- Extra content backlog (24.x); cross-browser QA matrix (25.0); final perf hardening push (26.1); announcement/backup task (26.2); headers diagnostics without mirror (21.0/21.1 when mirror absent).
- Tor mirror is captured in F7; reliability (16.x) merges into F5; Onion writeup folds into F6.

## Assumptions & constraints
- Oracle Cloud is the primary host; Vercel is only a documented fallback.
- Telemetry requires explicit consent; default to cookieless mode when not granted.
- Health tile placement: hero area on full layout; footer on skim mode.
- Tor mirror targets immediately post-launch; Onion-Location ships only when the mirror is live.
