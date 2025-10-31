# Risk Log – Portfolio Program

| ID | Risk Description | Impact | Likelihood | Mitigation / Contingency | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Content pipeline stalls, delaying new proof artifacts. | High | Medium | Maintain backlog grooming with alternate artifacts; schedule weekly capture sessions. | Product owner | Open |
| R2 | Recruiters experience slow load times on shared networks. | Medium | Medium | Enforce performance budgets, pre-render critical pages, monitor Core Web Vitals. | Engineering lead | Open |
| R3 | Accessibility regressions slip past review. | High | Low | Expand automated axe-core coverage, add manual keyboard testing checklist. | Engineering lead | Open |
| R4 | Security posture gaps (headers/CSP) block enterprise review. | High | Low | Implement strict CSP, regular dependency audits, security.txt contact path, and follow `docs/dependency-policy.md`. | Engineering lead | Open |
| R5 | Observability integrations exceed available tooling budget. | Medium | Low | Use open-source OTEL collector; export to self-hosted storage. Adjust scope if costs appear. | Engineering lead | Monitoring |
| R6 | Portfolio fails to stay up-to-date with new achievements. | Medium | Medium | Assign monthly review cadence, create update SOP, automate reminders. | Product owner | Open |
| R7 | Lack of localized content undermines global recruiter engagement. | Medium | Medium | Prioritize i18n setup early, enlist translators or bilingual peers for QA. | Product owner | Open |

Risks are reviewed during the weekly governance check-in noted in `CHARTER.md`. Updates are reflected in this log and synchronized with the WBS backlog.
