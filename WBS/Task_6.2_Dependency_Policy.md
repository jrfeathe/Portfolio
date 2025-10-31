# Task 6.2 — Dependency Policy

## Objective
Stand up an opinionated dependency governance workflow that keeps every workspace package on supported versions, surfaces security advisories quickly, and ensures fixes are merged on a predictable cadence without breaking the monorepo build.

## In Scope
- Authoring a `renovate.json` tuned for a pnpm-powered monorepo (apps + shared packages).
- Establishing schedules, reviewers, and automerge rules so update PRs land weekly.
- Defining how Software Composition Analysis (SCA) alerts are triaged and documented.
- Automating routine health checks (e.g., `pnpm audit`, `pnpm outdated`) inside CI or Renovate pipelines.

## Out of Scope
- Pinning binary or Docker dependencies (handled later in infra tracks).
- Adding third-party SaaS scanners; rely on built-in GitHub advisories + Renovate data.
- Writing remediation code for vulnerabilities surfaced by other teams.

## Deliverables
- `renovate.json` at the repo root with:
  - pnpm workspace detection enabled (`enabledManagers: ["pnpm"]`).
  - Scheduled runs (e.g., `schedule: ["after 02:00 on monday"]`) so updates batch weekly.
  - Grouping rules that open a single PR per dependency family (e.g., testing, linting, Next.js runtime).
  - Automerge policy for non-breaking (`patch`, security) updates once CI succeeds.
  - Labels (`"labels": ["dependencies", "WBS:6.2"]`) and reviewers bound to CODEOWNERS.
- Documentation snippet (README Security or new `docs/dependency-policy.md`) describing triage expectations, SLAs, and rollback steps.
- CI or Renovate post-update hooks to run `pnpm -w build`, `pnpm lint`, and `pnpm test` ensuring PRs are merge-ready.
- Backlog issue template entry or checklist noting that weekly Renovate PRs must be reviewed/merged each iteration.

## Acceptance Criteria
- At least one Renovate PR lands automatically each week (GitHub Insights shows consistent cadence).
- Security advisories trigger PRs within 24h and never remain open >7 days without an owner comment.
- All dependency PRs pass the monorepo build/lint/test pipeline before merge.
- The triage process is documented and linked from `RISK_LOG.md` mitigation R4.

## Implementation Plan

1. **Baseline inventory**
   - Run `pnpm -r list --depth 0` and `pnpm outdated` to identify critical packages.
   - Capture supported Node/PNPM versions from `.nvmrc` and ensure Renovate enforces them.
   - Note packages that require manual upgrades (e.g., Next.js major releases) for grouping.

2. **Author Renovate config**
   - Start from Renovate’s `config:recommended` preset.
   - Enable pnpm cache busting (`"dependencyDashboard": true`, `"rangeStrategy": "bump"`).
   - Create package rules:
     - Group React + Next.js + related swc packages.
     - Group testing stack (`@testing-library/*`, `@playwright/test`, Jest).
     - Force security updates (`"matchUpdateTypes": ["major", "minor", "patch"]`, `"matchManagers": ["npm"]`, `"labels": ["security"]`).
   - Configure automerge for lockfile-only PRs and patch-level dev dependencies after CI success.
   - Add onboarding config comments explaining expectations for reviewers.

3. **Wire CI hooks**
   - Ensure Renovate PRs trigger existing GitHub Actions pipeline (`ci.yml`).
   - If needed, add a lightweight `pnpm audit --prod` step gated on Renovate/security labels.
   - Fail the pipeline when audit reports `critical` vulnerabilities.

4. **Document triage process**
   - Add a “Dependency Policy” section to README or create `docs/dependency-policy.md` covering:
     - Weekly review cadence.
     - Required assignee/label flow.
     - How to escalate when CI fails.
     - Procedure for ignoring advisories (requires justification + calendar reminder).
   - Reference this doc from `RISK_LOG.md` (R4 mitigation) and the incident playbook (Task 16.1).

5. **Dry run + iterate**
   - Trigger Renovate onboarding PR in a dry run environment (or run `pnpm exec renovate-config-validator` locally).
   - Address any config warnings, merge onboarding PR, and observe first scheduled run.
   - Adjust grouping or automerge rules based on PR volume/CI results.

## Risks & Mitigations
- **Excessive PR volume** — Group related dependencies and limit schedule to once weekly.
- **CI flakiness blocks automerge** — Follow up by triaging failing suites, rerun with `pnpm test --filter ...`.
- **Security fixes stalled by reviewers** — Add CODEOWNERS + Slack/Email notifications; escalate in standups.

## Open Questions
- Should Dependabot alerts also be enabled alongside Renovate for redundancy?
- Do we need a mirror strategy for air-gapped environments (e.g., Artifactory) later?
- Should production builds enforce signed commits/tags for dependency PRs?
