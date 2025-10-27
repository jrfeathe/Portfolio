**0.x — Program & Repo (0.0–0.3)**
Spin up the monorepo and project guardrails: charter, repo scaffolding, branch protections, and GitHub issue templates. You code lightly at **0.1** (workspace, linting/build configs); the rest is setup/governance.

**1.x — Content & Positioning (1.0–1.2)**
Write the one-line promise, define “proof chips,” and lay out the skim-mode content matrix. Mostly writing/structure; no real coding here.

**2.x — Design System (2.0–2.3)**
Heavy front-end coding: Tailwind tokens, core UI components, page shells/layout, and print styles. You’re in components, CSS, Storybook-style validation.

**3.x — Architecture (3.0–3.3)**
Stand up the Next.js app, i18n routing, MDX pipeline, and diagram support. You code app/router wiring, content pipelines, and a diagram component + proxy.

**4.x — CI/CD (4.0–4.3)**
Build the pipeline: typecheck → unit → e2e → Lighthouse CI, plus coverage/quality gates. Coding is mostly workflow YAML, tests, and CI glue.

**5.x — Observability (5.0–5.2)**
Wire OpenTelemetry, a regional ping job, and a live Health/SLO tile. Code spans client/edge tracing, a cron/edge function, and a real-time component.

**6.x — Security (6.0–6.2)**
Lock down CSP/headers, publish security.txt/GPG, and set dependency policy/renovate. Mostly config + some nonce/CSP plumbing.

**7.x — Accessibility (7.0–7.1)**
Add axe/unit checks and implement reduced-motion/contrast/focus patterns. Code tests + small UX tweaks.

**8.x — Performance (8.0–8.2)**
Set budgets and enforce them, implement image pipeline, critical CSS/fonts. Code build/perf tooling and a few rendering optimizations.

**9.x — Schema & Resume (9.0–9.1)**
Generate JSON-LD per page and ship a JSON Resume + printable PDF. Code a JSON-LD helper and resume export.

**10.x — Home & Hook (10.0–10.1)**
Build the hero + proof chips and a live health tile on the home page. Code UI components and data binding.

**11.x — Skim Mode (11.0–11.1)**
Add a `?skim` route state and a renderer that pulls exactly the fields from your matrix. Code router state + condensed UI.

**12.x — Infra & Hosting (12.0–12.5)**
Deploy (Vercel/Netlify), domain/DNS, and a Tor mirror with hardened VPS + headers/CSP parity. Finish by shipping a JS-free fallback so Tor Browser at “Safest” still shows essential content. Mostly infra/config scripts with a little edge code and progressive-enhancement polish.

**13.x — Engineering Notes (13.0–13.1)**
Notes index with filters/RSS and an MDX template that bakes in trade-offs. Code pages/templates; also write content later.

**14.x — Systems Gallery (14.0–14.1)**
ADR cards + detail pages and a safer PlantUML proxy. Code gallery pages and a hardened proxy endpoint.

**15.x — Micro-demos (15.0–15.2)**
A small demo framework, a profiler panel, and two initial perf demos. Fun front-end coding (workers/WASM ready).

**16.x — Reliability (16.0–16.2)**
Public SLOs page, incident playbook/timeline component, and Tor-mirror healthcheck. Code pages/components + a cron/timer.

**17.x — Changelog (17.0–17.1)**
Automated semver notes (conventional commits) and a public roadmap page. Code generator wiring + simple page.

**18.x — Contact (18.0–18.1)**
Contact page and a tiny CLI (`npx meet-yourname`) that reads resume.json. Code a page + a publishable CLI package.

**19.x — Trade-off Explorer (19.0–19.1)**
Model scenarios and build a slider-driven UI that compares approaches. Code both the data model utilities and an interactive page.

**20.x — Perf Badge (20.0–20.1)**
Serverless SVG badge endpoint and a clickable UI badge component. Code an API route + component.

**21.x — Headers (21.0–21.1)**
/headers diagnostics page and Onion-Location header on the clear-web site. Code a page and add response headers.

**22.x — i18n (22.0)**
Language switcher + second-language content. Code the switcher/dictionaries and translate minimal strings.

**23.x — Analytics (23.0)**
Integrate a cookieless, privacy-friendly analytics wrapper. Light SDK wrapper code.

**24.x — Content (24.0–24.3)**
Write posts, diagrams, PR-review samples, and incident templates. Mostly writing (plus committing MDX/images).

**25.x — QA (25.0–25.1)**
Manual cross-browser/device QA and a deeper a11y audit. Minimal code; you’re filing issues and fixing regressions as found.

**26.x — Launch (26.0–26.3)**
SEO/sitemap/canonicals, final perf hardening, announcement/backup test, and a short post about the onion mirror. Light config/tuning + writing.
