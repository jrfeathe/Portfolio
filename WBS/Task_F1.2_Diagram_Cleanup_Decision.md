# Task F1.2 — Diagram Tooling Cleanup Decision

## Decision
- Remove Mermaid, PlantUML, and the `/api/plantuml` proxy; they are unused in the planned launch scope and add CSP/attack-surface and bundle risk.
- Diagram rendering in content will be dropped; no diagram features are in the FINAL_WBS launch scope.

## Evidence
- Usage is limited to the sample MDX note (`content/notes/mdx-pipeline.mdx`), the diagram components/tests, and the PlantUML proxy.
- No launch-critical tasks depend on diagrams; the audit explicitly called for removing diagram tooling.

## Removal checklist
- [x] Replace diagram fences in `content/notes/mdx-pipeline.mdx` with prose or screenshots; remove diagram samples.
- [x] Remove diagram components and plumbing: `apps/site/src/components/Diagram/*`, diagram wiring in `apps/site/src/components/mdx/MdxComponents.tsx`, and related types (`apps/site/src/types/plantuml-encoder.d.ts`).
- [x] Remove PlantUML library code: `apps/site/src/lib/diagram/plantuml.ts` and `apps/site/app/api/plantuml/route.ts`.
- [x] Drop dependencies from `apps/site/package.json`: `mermaid`, `@types/mermaid`, `plantuml-encoder` (and lockfile refresh).
- [x] Delete diagram-specific tests: `apps/site/tests/diagram.spec.ts` and any fixtures.
- [x] Run `rg "mermaid|plantuml|Diagram"` to confirm no remaining references; update docs/changelogs if needed.

## Owner / status
- Owner: Jack
- Status: Completed — diagram tooling removed per decision.
