TASK: Add/implement a new static page: "Fixes & Maintenance" (low attack surface)
GOAL: A simple, high-converting services/menu page for website fixes, deployment help, and monthly maintenance.
SECURITY/COMPLEXITY CONSTRAINTS:
- No forms, no backend endpoints, no DB writes, no third-party form embeds.
- Primary contact method is mailto links to: jfstone2000@proton.me
- Keep the page static and cache-friendly.

ROUTE + NAV:
- Add route: /services/fixes
- Do not link the page to other pages yet. We will do nav later.

PAGE LAYOUT (STRUCTURE)
1) Hero (above the fold)
2) 3 Service Package Cards with CTAs (mailto)
3) How it works (5 steps)
4) What I can fix (grouped bullets)
5) Deliverables (what client receives)
6) Scope Box + Change Policy (anti-scope-creep, clearly stated)
7) Maintenance tiers
8) FAQ
9) Bottom CTA (repeat mailto buttons)

DESIGN NOTES
- Use existing site theme tokens and components; keep consistent typography.
- Use card layout with clear headings; mobile-first; generous spacing.
- Keep paragraphs short; prefer bullets.
- Buttons should be large, accessible, and obvious on mobile.
- Avoid any dynamic features that increase attack surface (no contact forms).

MAILTO LINKS (USE THESE EXACT VALUES FOR ENGLISH LOCALE)
- QUICK FIX CTA:
  href="mailto:jfstone2000@proton.me?subject=Quick%20Fix%20Request&body=Website%20URL%3A%20%0AWhat%E2%80%99s%20broken%20or%20goal%3A%20%0APlatform%20(if%20known)%3A%20%0ADo%20you%20have%20hosting%2FDNS%20access%3F%20(yes%2Fno%2Fnot%20sure)%3A%20%0ADeadline%20(if%20any)%3A%20%0ATime%20zone%20%2B%20best%20contact%3A%20%0A"
- DEPLOYMENT CTA:
  href="mailto:jfstone2000@proton.me?subject=Deployment%20%26%20Reliability%20Help&body=Website%20URL%3A%20%0AWhat%20are%20you%20deploying%3F%20(WordPress%2FNext.js%2FReact%2Fetc.)%3A%20%0AHosting%2FDNS%20provider%20(if%20known)%3A%20%0AWhat%20do%20you%20need%3F%20(SSL%2FCDN%2FNGINX%2Fmonitoring%2Fetc.)%3A%20%0AAny%20errors%20or%20screenshots%3F%20%0ADeadline%3A%20%0ATime%20zone%20%2B%20best%20contact%3A%20%0A"
- MAINTENANCE CTA:
  href="mailto:jfstone2000@proton.me?subject=Monthly%20Maintenance%20Request&body=Website%20URL%3A%20%0AWhat%20kind%20of%20site%20is%20this%3F%20%0AWhat%20do%20you%20want%20handled%20monthly%3F%20%0APreferred%20response%20speed%3A%20(1%E2%80%932%20days%20%2F%20same-day)%0ATime%20zone%20%2B%20best%20contact%3A%20%0A"

PAGE COPY (USE THIS VERBATIM UNLESS IT CONFLICTS WITH EXISTING BRAND VOICE)

[HERO]
Title:
Fast website fixes, reliable deployments, and ongoing maintenance.

Subtitle:
I help small businesses, creators, and small teams keep their sites fast, secure, and working.

Hero helper line (small text):
Email me your URL and what you need, and I’ll reply with a fixed-scope quote.

Primary buttons:
- Request a Quick Fix  (Quick Fix mailto)
- Request Deployment Help  (Deployment mailto)
- Request Maintenance  (Maintenance mailto)

[SERVICE PACKAGES: 3 CARDS]
Card 1 — Quick Fix (Pilot / Starter)
Tagline:
Small, high-impact fixes done fast.

Bullets:
- 48-hour delivery after access + approval
- Up to 3–5 fixes (mobile layout, broken UI, small bugs)
- Before/after screenshots + short change summary
- One revision pass included

Price line (optional but recommended):
Typical pilot pricing: $99–$199

CTA button:
Request a Quick Fix  (Quick Fix mailto)

Card 2 — Deployment & Reliability
Tagline:
Make your site stable, secure, and easy to operate.

Bullets:
- Domains/DNS, SSL, redirects, headers
- Reverse proxy (NGINX) and basic hardening
- CDN + caching strategy (when applicable)
- Health checks / uptime monitoring + a mini runbook

Price line:
Typical pilot pricing: $249–$499 (varies by stack)

CTA button:
Request Deployment Help  (Deployment mailto)

Card 3 — Monthly Maintenance
Tagline:
A dependable “call me when it breaks” plan.

Bullets:
- Small changes and fixes each month
- Uptime checks + basic monitoring
- Monthly health note (what changed, what to watch)
- Priority scheduling compared to one-off work

Price line:
Typical pilot pricing: $49–$99/month

CTA button:
Request Maintenance  (Maintenance mailto)

[HOW IT WORKS]
Heading:
How it works

Steps:
1) Email me your URL + goal (use the email template)
2) I reply with a fixed-scope plan and price (usually within 24 hours)
3) You approve + payment is handled (small jobs typically 50% upfront)
4) I deliver the work with proof (before/after + notes)
5) Optional: roll into monthly maintenance for ongoing stability

[WHAT I CAN FIX]
Heading:
Common things I fix

Group: Fixes
- Mobile layout glitches (overflow, spacing, broken sections)
- UI polish and responsive issues
- Bug fixes in frontend logic
- Broken forms, links, and redirects

Group: Performance & UX
- Oversized images and heavy scripts
- Practical Lighthouse improvements where feasible
- Caching/compression quick wins (when hosting access allows)

Group: Deployment & Reliability
- DNS/SSL setup and cleanup
- NGINX reverse proxy configuration
- CDN configuration and cache strategy
- Monitoring, basic runbooks, and safer deployments

[DELIVERABLES]
Heading:
What you’ll get

Bullets:
- Before/after screenshots (and metrics when relevant)
- A short “what changed” summary
- Any setup notes needed to operate the site safely
- For deployments: a mini runbook (deploy/rollback, SSL notes, key settings)

[SCOPE BOX + CHANGE POLICY]
Heading:
Scope and change policy (to prevent scope creep)

Subheading: Quick Fix scope
Included:
- Up to 5 fixes from the approved list
- Up to 2 pages/components touched
- 1 revision pass
- Delivery in 48 hours after access + payment

Not included:
- Full redesigns, new pages, or new features (This is beyond a Quick Fix. Let's discuss.)
- Copywriting/content creation (unless explicitly quoted)
- Ongoing support beyond 7 days (unless on maintenance)

Change policy:
Anything outside the scope becomes a separate fixed quote (or hourly work in 30-minute blocks, only with your approval).

Subheading: Deployment & Reliability scope
Included:
- Agreed deployment tasks listed in the quote (DNS/SSL/CDN/NGINX/monitoring as applicable)
- Deployment-blocking fixes required to make the app start and serve traffic in the target environment (up to 2 hours), with anything beyond quoted separately
- Setup notes + a mini runbook
- One verification pass after delivery

Not included:
- Large feature work or app rewrites
- Non-deployment-related bug hunts or refactors
- Ongoing on-call support (unless on maintenance)

Change policy:
Out-of-scope items are quoted separately before work starts.

[MAINTENANCE TIERS]
Heading:
Maintenance options

Tier: Starter
- Small fixes/edits monthly (defined in contract or quote)
- Uptime checks + basic monitoring
- Response: typically 1–2 business days

Tier: Plus
- More monthly work capacity
- Faster response when possible
- Priority scheduling

Note:
If something breaks urgently, I can usually jump in quickly. Quoted before work begins.

[FAQ]
Heading:
FAQ

Q: Do you need access to my source code?
A: Not always. Many fixes and reliability improvements can be done via hosting/DNS/CMS settings. Deeper performance refactors may require repo access.

Q: What platforms do you work with?
A: Common stacks are fine (custom React/Next.js, static sites, and many hosted platforms). If I’m not a fit, I’ll tell you quickly.

Q: How do payments work?
A: For small jobs, it’s typically 50% upfront and 50% on delivery (or paid upfront for very small fixed tasks).

Q: How fast is turnaround?
A: Quick Fix is designed for 48 hours once access/payment is in place. Larger work depends on scope.

Q: How do you handle credentials?
A: I request the minimum access needed. Temporary credentials are preferred when possible. I don’t need more access than the job requires.

Q: What if we discover more issues?
A: I’ll list them clearly and quote them separately. Nothing expands silently.

[BOTTOM CTA]
Heading:
Ready to get unstuck?

Text:
Email me your URL and what you want fixed. I’ll reply with a fixed-scope plan and price.

Buttons (repeat):
- Request a Quick Fix
- Request Deployment Help
- Request Maintenance

[CONTRACTS NOTE]
Add a small section near the bottom:
Before I start, I’ll confirm scope and pricing in a short agreement. See: /services

===========================================================
CONTRACTS PAGE: FILL CONTENT (STATIC CONTENT, NO FORMS)
Goal: Provide a clear, friendly agreement summary that matches the Scope Box. Keep it readable and not overly legalistic.

Contracts page sections (copy to implement):

Title:
Service Terms (Fixes, Deployment, and Maintenance)

Intro:
These terms exist to keep work predictable: clear scope, clear deliverables, and no surprise creep.

Section: Engagement types
- One-off Quick Fix
- Deployment & Reliability setup
- Monthly Maintenance

Section: Scope & deliverables
- Scope is defined in writing (email + accepted quote).
- Deliverables are the items listed in the quote (screenshots/notes/runbook if applicable).

Section: Change orders
- Anything not listed in scope is out-of-scope.
- Out-of-scope items require a new fixed quote (or hourly approval) before work begins.
- No surprise expansions.

Section: Access & credentials
- Client provides required access (hosting/DNS/CMS/repo as needed).
- Minimum access principle; temporary credentials preferred.
- Client is responsible for maintaining backups unless backup setup is included in scope.

Section: Payment
- Typical: 50% upfront / 50% on delivery for small fixed-scope jobs.
- Maintenance billed monthly in advance (or per the agreed schedule).
- Work begins after payment and access are in place.

Section: Timelines
- Timelines are estimates based on receiving access + needed info.
- Quick Fix target: 48 hours after access/payment (unless otherwise stated).

Section: Support window
- One-off jobs include a short support window (e.g., 7 days) for issues directly related to delivered changes.
- Ongoing support is via Maintenance plan.

Section: Client responsibilities
- Provide accurate requirements and timely feedback.
- Verify deliverables in a timely manner.
- Own content/legal compliance for their site.

Section: Limitations
- No guarantee of specific SEO ranking outcomes.
- Performance improvements depend on platform constraints and available access.
- Third-party outages/services are outside control.

Final CTA on contracts page:
Questions? Email jfstone2000@proton.me
(add mailto link with subject "Contracts Question")

===========================================================
IMPLEMENTATION CHECKLIST
- Create /services/fixes page with the layout + copy above.
- Add mailto buttons with prefilled subject/body.
- Add /services content per above (fill existing page; keep static).
- Ensure accessibility: semantic headings, focus states, readable contrast, button labels.
- Ensure mobile layout is clean: stacked cards, large tap targets.
- No forms; no new APIs; no new dependencies unless already in repo.
