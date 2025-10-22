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
