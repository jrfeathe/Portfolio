# Success Metrics – Portfolio Program

The portfolio succeeds when recruiters can verify fit quickly and signal for next steps. Metrics are tracked in a simple scorecard and reviewed bi-weekly.

## Core Metrics

| Metric | Target | Measurement                                                                                          | Notes |
| --- | --- |------------------------------------------------------------------------------------------------------| --- |
| Recruiter contact-to-screen conversion | ≥ 60% | Track number of inbound recruiter contacts that progress to a phone screen within 10 business days.  | Signals positioning clarity and trust. |
| Time-to-proof artifact | ≤ 2 minutes | User testing sessions with recruiters: measure time from landing to opening any proof chip artifact. | Validates navigation and evidence density. |
| Portfolio uptime (rolling 30-day) | ≥ 99.5% | Observability dashboard fed by edge ping service.                                                    | Maintains reliability expectations. |
| Lighthouse performance score (mobile) | ≥ 90 | Automated CI Lighthouse audit on master branch.                                                      | Correlates with recruiter patience on mobile. |
| Accessibility violations (axe automated) | 0 critical / 0 serious | CI axe-core suite against core page shells.                                                          | Reinforces inclusive design. |

## Leading Indicators

- Newsletter or update subscription confirmations ≥ 20 per quarter.
- Bounce rate for recruiter skim mode page ≤ 35%.
- Resume PDF downloads per unique recruiter ≥ 1.5.

## $1K Bonus Condition

The program unlocks the $1,000 performance bonus when all conditions below are met within a rolling 60-day window:

1. At least three recruiter-driven process advancements (screen → onsite or equivalent) directly attributed to the portfolio.
2. Documented hiring manager feedback citing the portfolio as a differentiator on two separate opportunities.
3. Core metric targets are achieved for two consecutive Lighthouse/axe/uptime reporting cycles.

## Metric Operations

- Metrics are logged in a Notion or spreadsheet dashboard with weekly updates.
- During each iteration review, confirm whether measures are trending toward targets and identify corrective experiments.
- Any metric off track for two reviews triggers a scoped improvement task added to the WBS backlog.
