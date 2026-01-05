# FINAL_WBS — Launch Pivot

This WBS locks the launch scope after the REVOLT audit, trims feature creep, and reserves a small fast-follow lane for the Tor mirror. Legend: LC = launch-critical; FF = fast-follow after launch; AX = archived/not pursuing now.

## Launch-Critical Streams
### F1 — REVOLT Return to Order (LC)
| ID    | Task                             | Scope / Notes                                                                                  | Deliverable / DoD                                                    |
|-------|----------------------------------|------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| F1.1  | WBS reset & codes                | Lock this FINAL_WBS format/codes; remove reliance on legacy WBS; record archived tracks.       | FINAL_WBS committed with stable F-codes; archived list confirmed.    |
| F1.2  | Diagram/tooling cleanup decision | Decide on removing Mermaid/PlantUML + /api/plantuml; if unused, plan removal steps and owners. | Decision noted; removal checklist opened or closed.                  |
| F1.3  | Availability bug fix             | Implement fix and re-run availability/meetings UI across locales; capture QA notes.            | Slots render correctly; QA notes linked.                             |
| F1.4  | High-contrast fixes              | Address high-contrast regressions in core pages.                                               | Before/after screenshots; axe/contrast checks pass for target pages. |
| F1.5  | Chatbot UI & states              | Clean rate-limit/error/captcha states; align styling with contrast/theme.                      | Chatbot UI screenshots; manual QA notes for error flows.             |
| F1.6  | CI restore                       | Get typecheck/Jest/Playwright/budgets green; update flaky tests if needed.                     | CI pipeline green; notes on any test adjustments.                    |
| F1.7  | SVG slimming / Performance       | Identify heavy SVGs and simplify/compress. Aim to minimize site load time.                     | Size deltas recorded; optimized assets committed.                    |

### F2 — Skim Mode MVP (LC)
| ID   | Task                   | Scope / Notes                                                                                                                                                                                                                 | Deliverable / DoD                              |
|------|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| F2.1 | Skim rules & test plan | Freeze skim rules: dictionary-driven one-page skim with evidence + tech only; hide hero/roadmap/audio/nav; surface email and resume/“Need proof fast?” CTA; target single-screen desktop; write test matrix/screenshots list. | Documented rules + test checklist.             |
| F2.2 | Implementation         | Add dictionary entries. Build the one-page skim layout per rules (compact evidence block as primary heading, tech stack, email + CTA cluster visible, no anchor nav); hide hero/media/audio/roadmap/nav.                      | UI built. Dictionary wiring complete.          |
| F2.3 | Toggle + data gating   | Ensure `?skim` toggles state using dictionary skim entries; gate on non-empty data; keep resume/CTA/email intact; no nav for one-page layout.                                                                                 | Jest/Playwright coverage for toggle and gating |

### F3 — Frontend Refinement (LC)
| ID   | Task                            | Scope / Notes                                                                                                                                                        | Deliverable / DoD                                                                       |
|------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| F3.1 | Manual a11y audit               | Targeted manual audit (SR paths, tab order, focus traps) for home/experience/meetings/skim.                                                                          | Audit notes with no P0/P1; fixes linked.                                                |
| F3.2 | Portrait & brand assets         | Add portrait and Codex logo; finalize tech-stack assets. Add GitHub and LinkedIn links.                                                                              | Assets committed; references updated; visual check attached.                            |
| F3.3 | AudioPlayer stability           | Fix AudioPlayer issues; add music track; verify desktop + mobile playback.                                                                                           | Playback works across devices; regression test or QA notes.                             |
| F3.4 | SEO/canonicals/robots/sitemap   | Audit sitemap/robots/canonicals/meta; fix gaps introduced by copy/layout changes.                                                                                    | Updated files; spot-check log.                                                          |
| F3.5 | Light Theme Redesign (& ui fix) | Redesign the light theme to stop hurting my eyes. Ensure High Contrast Light displays properly as well. Fix the "ghost" border near the hero image and audio player. | The Light Normal and Light High Contrast themes are consistent and pleasant to look at. |
| F3.6 | JSON-LD spot checks             | Re-run rich results checks for home/notes/experience after copy changes.                                                                                             | Validation screenshots/notes; tests passing.                                            |
| F3.7 | Mobile / Medium layout sweeps   | Verify hero/tech stack/audio/skim/chat on mobile and medium scaling; adjust columns/spacing; ensure sticky CTA behavior is sane. Add dedicated medium scaling mode.  | List of fixes applied.                                                                  |

### F4 — Localization (LC)
| ID   | Task                  | Scope / Notes                                                                                                 | Deliverable / DoD                                               |
|------|-----------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| F4.1 | Dictionary completion | Finish EN/JA/ZH copy for home/experience/meetings/skim/resume.json; align resume filenames per locale.        | Dictionaries updated; lint/tests pass; spot-check of key pages. |
| F4.2 | Tone/consistency QA   | Tone-check localized strings and ensure formatting consistency (dates, numbers, availability labels).         | QA notes; fixes applied; screenshots per locale.                |
| F4.3 | Chatbot localization  | Localize chatbot system prompts/UI text; ensure allowed links + moderation copy respect locale.               | Chatbot renders correctly per locale; captcha UX verified.      |

### F5 — Deployment (LC)
| ID   | Task                | Scope / Notes                                                                     | Deliverable / DoD                             |
|------|---------------------|-----------------------------------------------------------------------------------|-----------------------------------------------|
| F5.1 | Oracle deployment   | Deploy clear-web site on Oracle Cloud; capture env var/config/runbook.            | Live Oracle deployment; runbook documented.   |
| F5.2 | Domain + TLS        | Configure custom domain + HTTPS; verify redirects/non-www/www and locale routing. | Domain live with TLS; redirect checks logged. |
| F5.3 | Vercel fallback doc | Document fallback path and config if Oracle is unstable.                          | Short fallback guide committed.               |

### F6 — Reliability & Consent (LC)
| ID   | Task                | Scope / Notes                                                                                                       | Deliverable / DoD                                                 |
|------|---------------------|---------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| F6.1 | Ping job/script     | Add minimal ping/uptime check (scheduled or manual) and persist sample data.                                        | Script/job checked in; sample output recorded.                    |
| F6.2 | Health tile wiring  | Render simple health tile using ping data with offline/fallback messaging (hero in full mode, footer in skim).      | Tile renders with live/sample data and fallback state.            |
| F6.3 | Consent flow        | Ask permission before setting cookies/telemetry; default to cookieless when declined.                               | Consent UI implemented; opt-in/out paths tested.                  |
| F6.4 | Privacy note/tests  | Document collected data and consent behavior; add tests for consent persistence and analytics toggle.               | Privacy note updated; Jest/Playwright coverage for consent paths. |
| F6.5 | Chatbot Reliability | Observe and test common questions. Ensure the moderation is appropriate in strength. Ensure high quality responses. | Chatbot responds well to ~25 most common prompts.                 |

## Fast-Follow
### F7 — Engineering Writeup (FF, content-critical)
| ID   | Task                    | Scope / Notes                                                                                                          | Deliverable / DoD                                           |
|------|-------------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| F7.1 | Draft build/lessons MDX | Draft single MDX note covering build lessons + “Why an Onion Mirror”; remove diagram deps; keep MDX pipeline minimal.  | Draft committed; no Mermaid/PlantUML deps referenced.       |
| F7.2 | Publish & wire links    | Publish note in notes route; add nav/link surface; validate rendering and metadata.                                    | Note live with working links; metadata/JSON-LD still valid. |

### F8 — Mainland China Experience (jrfeathe.cn + China-native Chat) (FF after global site live)
| ID    | Task                                  | Scope / Notes                                                                                                                                         | Deliverable / DoD                                                                                     |
|-------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| F8.1  | Register `jrfeathe.cn` + verification | Purchase `.cn`; complete real-name verification; set registrar/DNS ownership under same China cloud account where possible.                           | Domain active; WHOIS/registrar verified; DNS zone editable.                                           |
| F8.2  | Mainland origin provisioning          | Provision ECS in **cn-shanghai** or **cn-hangzhou**; baseline hardening (SSH, firewall, unattended upgrades, log policy).                             | Origin online; hardening checklist completed; Nginx serving placeholder page.                         |
| F8.3  | China DNS setup (AliDNS/Tencent DNS)  | Configure authoritative DNS in China; A/AAAA records to origin/CDN; short TTL during cutover; document rollback plan.                                 | `jrfeathe.cn` resolves reliably inside CN; rollback documented/tested.                                |
| F8.4  | Mainland CDN enablement               | Enable China CDN (prefer same provider as origin); HTTPS at CDN; cache policy (long TTL for assets, short for HTML); HTTP/2 + compression.            | CDN serving traffic; cache headers verified; synthetic test shows improved TTFB/LCP vs origin-only.   |
| F8.5  | ICP filing (备案)                       | Prepare required site info; submit ICP filing; add备案号 in footer post-approval; keep site content portfolio-only (no onion/VPN/circumvention refs).    | ICP备案 approved;备案号 displayed;备案 info stored in repo/docs.                                             |
| F8.6  | PSB filing (公安备案)                     | Complete public security filing after site is live; ensure required footer/linkage as applicable.                                                     | 公安备案 completed; confirmation captured in docs.                                                        |
| F8.7  | China-safe asset audit                | Remove/replace blocked third-party dependencies (e.g., Google fonts/analytics/recaptcha); self-host fonts/assets; avoid cross-border hard deps.       | Lighthouse/Perf run shows no blocked resources; “all assets load” test from CN passes.                |
| F8.8  | “China mode” chatbot backend          | Add domain-based routing/feature flag: `.cn` uses China LLM; `.com` keeps OpenRouter; keep prompts/telemetry separated.                               | Requests from `.cn` route to CN provider; `.com` unchanged; integration tests pass.                   |
| F8.9  | Integrate China LLM (e.g., DeepSeek)  | Implement provider adapter (OpenAI-style compatibility if available); timeout/retry strategy tuned for low-latency mainland calls.                    | Chat responses succeed from CN; p95 latency target met; error handling + fallback copy shipped.       |
| F8.10 | Replace CAPTCHA for `.cn`             | Swap hCaptcha with CN-friendly CAPTCHA (Tencent CAPTCHA / Aliyun CAPTCHA / GeeTest); server-side verify; rate limiting regardless of CAPTCHA.         | CAPTCHA loads in CN; verification succeeds; abuse tests/rate limits validated.                        |
| F8.11 | CN performance monitoring             | Synthetic checks from mainland vantage points (multi-ISP if possible); alert on DNS/CDN/origin regressions; define perf budgets.                      | Dashboard + alerts configured; baseline metrics recorded; perf budget documented.                     |
| F8.12 | WeChat Mini Program MVP (optional)    | Register personal Mini Program; minimal portfolio pages + AI “Ask about my projects”; backend endpoints hosted in CN; app review checklist.           | Mini Program approved/published; AI demo works; links/contact flows validated.                        |

### F9 — Tor Mirror (FF after public launch)
| ID   | Task                       | Scope / Notes                                                                                                         | Deliverable / DoD                                                  |
|------|----------------------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| F9.1 | VPS provisioning/hardening | Provision Tor-friendly VPS; firewall/systemd hardening; logging posture defined.                                      | VPS ready; hardening checklist completed.                          |
| F9.2 | NoScript-first render      | Ship JS-free render path for mirror; ensure core content loads at Tor Browser “Safest.”                               | NoScript page serves key content; screenshot proof.                |
| F9.3 | Header/CSP parity          | Align headers/CSP/privacy posture between clear web and mirror; disable trackers by default.                          | Header parity documented; tests or curl captures attached.         |
| F9.4 | Onion-Location + health    | Add Onion-Location header to clear site once mirror is live; optional mirror healthcheck alongside clear-site status. | Header present; mirror status displayed next to clear-site health. |

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
