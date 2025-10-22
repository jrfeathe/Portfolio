# Project Charter – Portfolio Web Application

## Mission

Create a recruiter-friendly, evidence-backed engineering portfolio that demonstrates delivery ability, leadership range, and operating maturity.

## Primary Goals

- Launch a production-ready web experience that surfaces proof of impact in under 3 recruiter clicks.
- Present positioning and skim-friendly content that speeds decision-making for technical hiring managers.
- Establish a repeatable content and operations workflow so new achievements and artifacts can be published in under 48 hours.

## Scope

- Build and maintain the documentation, design system, architecture, and automations described in the WBS.
- Produce supporting copy, schema, and assets necessary for recruiter skim mode and deep-dive evaluation.
- Wire observability, performance, accessibility, and security guardrails to uphold reliability targets once the site is live.

## Target Audience

- **Primary:** Technical recruiters and talent partners validating engineering candidates.
- **Secondary:** Engineering leaders evaluating strategic and operational thinking, plus procurement stakeholders checking compliance.

## Non-Goals

- Creating a generalized CMS or multi-tenant platform.
- Supporting legacy browsers outside the evergreen browser baseline.
- Serving as a personal blog or long-form content hub beyond curated engineering notes.

## Constraints & Assumptions

- Delivery cadence follows the Essential WBS as the single source of truth.
- No external network connectivity is assumed during development; staging and production deploy pipelines must operate within that constraint.
- Budget for third-party SaaS integrations is zero; all services must be open source or already provisioned.

## Governance & Decision-Making

- **Product owner:** Jack (program sponsor).
- **Engineering lead:** Assigned per sprint; accountable for technical decisions and standards.
- **Review cadence:** Weekly charter review and WBS alignment check; docs updated when scope changes.

## Definition of Done

- Documentation artifacts are version-controlled and peer-reviewed.
- Acceptance criteria mapped in `WBS/Essential_WBS.csv` are satisfied with traceability to commits.
- Success metrics trend toward the targets outlined in `SUCCESS_METRICS.md`.
