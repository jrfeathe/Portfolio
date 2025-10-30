# Portfolio Web Application

This repository now tracks the documentation-first reboot of the portfolio initiative.
Task 0.1 scaffolds the pnpm-based monorepo that will power the live site and its
supporting packages.

## Workspace layout

- `apps/site` – Next.js application that powers the portfolio web experience.
- `packages/ui` – Shared component library published internally to the workspace.
- `packages/config` – Centralized ESLint, Prettier, Tailwind, and TypeScript settings.
- `packages/cli` – Command-line utilities for iterating on the project locally.
- `infra/` – Placeholder entry point for future infrastructure as code.
- `content/` – Source files for MDX notes, resume data, and other authored content.
- `scripts/` – Automation helpers (currently placeholders).
- `WBS/` – Authoritative work breakdown structure and schema references.

## Usage

1. Install dependencies with `pnpm install`.
2. Build everything with `pnpm -w build`.
3. Launch the site via `pnpm dev`.
4. Run linting with `pnpm lint` and formatting with `pnpm format`.

The default Node version is pinned in `.nvmrc`. Run `nvm use` (or your preferred
version manager) before installing dependencies to stay aligned with the repo.

## Observability

Task 5.0 adds OpenTelemetry traces to the portfolio site across Node, edge, and
browser runtimes. Configure an OTLP endpoint before running the app to emit
spans:

- `OTEL_EXPORTER_OTLP_ENDPOINT` – HTTPS endpoint for your collector (server/edge).
- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT` – Public endpoint exposed to the browser.
- `OTEL_EXPORTER_OTLP_HEADERS` / `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS` – Optional
  `key=value` header pairs (comma-separated) for authentication.
- `OTEL_SERVICE_NAME` – Optional override for the trace service name (defaults to `portfolio-site`).

When the endpoint variables are unset, instrumentation remains dormant and no
spans are generated.

### Local environment template

A `.env.example` file is provided at the repo root with the required variables.
Copy it to `.env` or `.env.local`, fill in your Honeycomb API key and dataset,
and load the env file before running local commands.

## Security Headers

Task 6 hardens runtime responses with a strict Content Security Policy (no
`unsafe-inline` scripts) and a comprehensive security header suite. Every HTML
and API response receives the policy via edge middleware, and a per-request
nonce is exposed on the `x-nonce` request header so server or client components
can opt into inline scripts if needed. The nonce is also mirrored to
`data-csp-nonce` on `<body>` and applied to runtime style/script injection so
Next.js internals and dynamic diagram styles continue to run without relaxing
the policy. During local development Next.js still requires `unsafe-eval` and
some inline styles for its overlay tooling; the policy adds those automatically
outside production. The defaults allow self-hosted assets, OTLP `https`/`wss`
calls, and block framing or cross-domain embedding.

## Branch protection & workflow expectations

- All changes land via pull request; direct pushes to `master` are disabled.
- Enable GitHub branch protection with:
  - Required status checks: `CI / ci/build`, `CI / ci/lint` (backed by pnpm build and lint workflows; add more as CI grows).
  - Require at least one approval and up-to-date branches before merge.
  - Block force pushes and deletions; optional: require signed commits.
- CI workflow runs on pushes and pull requests targeting `master` and `dev`.
- GitHub automatically requests review based on `CODEOWNERS`, currently defaulting to @jrfeathe.
- Use the PR template in `.github/pull_request_template.md` to link WBS tasks and document testing.

## Issue templates & labels

- GitHub issue forms cover feature requests, bug reports, and tech debt work in `.github/ISSUE_TEMPLATE/`.
- Each template requires a WBS ID so new issues stay aligned to the Essential WBS.
- Sync repository labels (workflow + `WBS:*`) by running `GITHUB_TOKEN=<token> pnpm exec node scripts/sync-wbs-labels.mjs owner/repo`.
- The sync script can be re-run any time the WBS changes; it upserts labels without removing custom ones.
