import { Button } from "@portfolio/ui";

import {
  ShellLayout,
  StickyCTA
} from "../src/components/Shell";

export const runtime = "edge";

const sections = [
  {
    id: "mission",
    eyebrow: "Orientation",
    title: "Why this portfolio exists",
    description:
      "Give recruiters and hiring managers measurable proof of delivery, leadership, and operational maturity in under three clicks.",
    content: (
      <>
        <p>
          The portfolio initiative reframes a personal site as an operating
          system. Every artifact is instrumented so talent partners can quickly
          sample outcomes, delivery patterns, and working agreements.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Documentation-first case studies with linked telemetry.</li>
          <li>Design system primitives shared across the app and print views.</li>
          <li>Automations that keep resume, notes, and demos in sync.</li>
        </ul>
      </>
    )
  },
  {
    id: "proof",
    eyebrow: "Evidence",
    title: "Proof chips & supporting artifacts",
    description:
      "Each claim on the landing page links directly to proof so stakeholders can verify impact without booking a call.",
    content: (
      <>
        <p>
          Proof chips map key promises to tangible evidence: recorded demos,
          performance dashboards, stakeholder quotes, and delivery matrices.
        </p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <dt className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Shipping velocity
            </dt>
            <dd className="mt-2 text-sm">
              DORA metrics exported weekly with regression alerts surfaced on the
              site.
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <dt className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Leadership range
            </dt>
            <dd className="mt-2 text-sm">
              Case studies document org design choices, trade-off memos, and
              stakeholder alignment rituals.
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <dt className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Operational excellence
            </dt>
            <dd className="mt-2 text-sm">
              Playbooks cover rollout gates, observability baselines, and
              incident response posture.
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <dt className="text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Hiring enablement
            </dt>
            <dd className="mt-2 text-sm">
              Recruiter skim mode aggregates eligibility, timezone, compensation
              guardrails, and references.
            </dd>
          </div>
        </dl>
      </>
    )
  },
  {
    id: "roadmap",
    eyebrow: "Roadmap",
    title: "What ships next",
    description:
      "The Essential WBS guides delivery so the experience lands in iterative, verifiable slices.",
    content: (
      <>
        <p>
          Design system foundations are in place. Next milestones add localized
          content, MDX-based engineering notes, and Lighthouse-backed CI.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Publish recruiter skim matrix with structured data for search.</li>
          <li>Wire i18n routing with English, Japanese, and Chinese toggles.</li>
          <li>Introduce MDX pipeline for engineering notes and diagrams.</li>
        </ol>
      </>
    )
  }
];

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Workspace overview" }
];

export default function HomePage() {
  return (
    <ShellLayout
      title="Portfolio"
      subtitle="Blueprinting a recruiter-friendly experience that foregrounds measurable impact, operating rituals, and proof you can audit."
      breadcrumbs={breadcrumbs}
      sections={sections}
      cta={
        <StickyCTA
          title="Need proof fast?"
          description="Grab the highlights, download artifacts, or book time to walk through the operating model."
        >
          <Button variant="primary">View case studies</Button>
          <Button variant="secondary">Download resume</Button>
          <Button variant="ghost">Book a 20-minute intro</Button>
        </StickyCTA>
      }
    />
  );
}
