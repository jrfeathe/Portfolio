# Dependency Policy

Renovate automates dependency upkeep for the monorepo and runs on a scheduled
batch every Monday at 02:00 UTC. This policy defines how the team triages the
resulting pull requests, handles security advisories, and rolls back changes
when necessary.

## Weekly workflow
- Check the Renovate dashboard each Monday after the scheduler runs and confirm
  open PRs are grouped as expected (runtime, testing, linting, etc.).
- Assign yourself (or the week’s on-call) to each Renovate PR so ownership is
  clear; PRs auto-request review from CODEOWNERS.
- Verify CI results — the workflow runs `pnpm lint`, `pnpm -w build`, and
  `pnpm test` so green checks indicate the release is safe to merge.
- Merge grouped dependency PRs within the same sprint; don’t allow them to
  carry over unless a linked issue documents the blocker.

## Security advisories
- Renovate labels security-driven PRs with `security`; these are auto-approved
  once CI succeeds.
- Review any security PR within 24 hours; leave a status comment within 24
  hours if CI is red or the change needs manual intervention.
- No security PR should remain open longer than 7 days without an explicit
  owner comment describing next steps or pending upstream fixes.

## Handling failures
- If CI breaks, reproduce locally with `pnpm install --frozen-lockfile`,
  `pnpm lint`, `pnpm -w build`, and `pnpm test`.
- For component-specific failures (e.g., Playwright), use `pnpm --filter` to
  narrow the failing scope and capture notes in the PR.
- When a dependency requires manual remediation, open a follow-up issue with
  WBS 6.2, assign an owner, and add it to the current iteration backlog.

## Rollback & ignore procedure
- To roll back a problematic update, revert the Renovate merge commit via
  GitHub UI (preferred) or `git revert <sha>` in a follow-up PR.
- If we must postpone an update, close the PR with a comment linking to a new
  tracking issue and add a calendar reminder to revisit before the next sprint
  boundary.
- Ignoring a security advisory requires engineering lead approval. Document the
  justification, target revisit date, and mitigation plan in the tracking issue
  and list it in `RISK_LOG.md` if the exposure persists longer than one sprint.
