import type { Metadata } from "next";

import { getPublicResume } from "../../../src/lib/resume/public";

export const metadata: Metadata = {
  title: "Resume — Jack R. Featherstone",
  description: "Printable resume for Jack R. Featherstone."
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric"
});

function formatDate(value: string) {
  const parsed = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return DATE_FORMATTER.format(parsed);
}

function formatDateRange(start: string, end?: string) {
  const startLabel = formatDate(start);
  if (!end) {
    return `${startLabel} — Present`;
  }

  return `${startLabel} — ${formatDate(end)}`;
}

function formatLinkLabel(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SkillsList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="rounded bg-slate-100 px-2 py-1 leading-tight">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumePrintPage() {
  const resume = getPublicResume();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 py-10 text-slate-900 print:px-0 print:py-0">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">
          {resume.profile.name}
        </h1>
        <p className="mt-2 text-lg font-medium text-slate-700">
          {resume.profile.headline}
        </p>
        {resume.summary.scope ? (
          <p className="mt-4 text-base leading-relaxed">
            {resume.summary.scope}
          </p>
        ) : null}
        {resume.summary.positioning ? (
          <p className="mt-2 text-base leading-relaxed">
            {resume.summary.positioning}
          </p>
        ) : null}
        <dl className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
          <div>
            <dt className="inline font-semibold uppercase tracking-wide">
              Location:
            </dt>{" "}
            <dd className="inline">
              {resume.profile.location.region}, {resume.profile.location.countryCode}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold uppercase tracking-wide">
              Availability:
            </dt>{" "}
            <dd className="inline">
              {resume.profile.location.availableLocations
                .map((entry) => `${entry.name} (${entry.availability})`)
                .join(", ")}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold uppercase tracking-wide">
              Languages:
            </dt>{" "}
            <dd className="inline">
              {resume.profile.languages.join(", ")}
            </dd>
          </div>
        </dl>
        <ul className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {resume.profile.sameAs.map((url) => (
            <li key={url}>
              <a href={url}>{formatLinkLabel(url)}</a>
            </li>
          ))}
        </ul>
      </header>

      {resume.summary.strengths.length ? (
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
            Strengths
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {resume.summary.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {resume.experience.length ? (
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
            Experience
          </h2>
          <div className="mt-4 space-y-6">
            {resume.experience.map((experience) => (
              <article key={`${experience.role}-${experience.company}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">
                      {experience.role}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {experience.company}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {formatDateRange(experience.start, experience.end)}
                  </span>
                </div>
                {experience.summary ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {experience.summary}
                  </p>
                ) : null}
                {experience.highlights.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {resume.projects.length ? (
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
            Projects
          </h2>
          <div className="mt-4 space-y-6">
            {resume.projects.map((project) => (
              <article key={project.name}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">
                      {project.name}
                    </h3>
                    {project.role ? (
                      <p className="text-sm text-slate-600">{project.role}</p>
                    ) : null}
                  </div>
                  {project.period ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {project.period}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {project.summary}
                </p>
                {project.highlights?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {project.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
                {project.stack?.length ? (
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                    Stack: {project.stack.join(", ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
          Skills & Tools
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <SkillsList
            title="Languages"
            items={
              resume.skills.languages?.map((entry) =>
                entry.years
                  ? `${entry.name} (${entry.proficiency}, ${entry.years} yrs)`
                  : `${entry.name} (${entry.proficiency})`
              ) ?? []
            }
          />
          <SkillsList
            title="Frameworks"
            items={
              resume.skills.frameworks?.map((entry) =>
                entry.years
                  ? `${entry.name} (${entry.proficiency}, ${entry.years} yrs)`
                  : `${entry.name} (${entry.proficiency})`
              ) ?? []
            }
          />
          <SkillsList
            title="Tools"
            items={resume.skills.tools ?? []}
          />
          <SkillsList
            title="Spoken Languages"
            items={resume.skills.spokenLanguages}
          />
        </div>
      </section>

      {resume.education.length ? (
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
            Education
          </h2>
          <div className="mt-4 space-y-6">
            {resume.education.map((entry) => (
              <article key={`${entry.institution}-${entry.credential}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">
                      {entry.credential}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {entry.institution}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {entry.status}
                    {entry.graduation ? ` · ${entry.graduation}` : ""}
                  </span>
                </div>
                {entry.notes?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {entry.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {resume.domains?.length ? (
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
            Domains of Impact
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            {resume.domains.map((domain) => (
              <li key={domain.name}>
                <span className="font-semibold">{domain.name}</span>
                {domain.status ? ` · ${domain.status}` : ""}
                {domain.note ? ` — ${domain.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        {resume.eligibility?.us_status ? (
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
              Work Eligibility
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              {resume.eligibility.us_status.value}
            </p>
            {resume.eligibility.us_status.note ? (
              <p className="mt-2 text-xs text-slate-600">
                {resume.eligibility.us_status.note}
              </p>
            ) : null}
          </div>
        ) : null}

        {resume.availability ? (
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide text-slate-500">
              Availability
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              {resume.availability.start_date?.value
                ? `Start: ${resume.availability.start_date.value}`
                : "Start date: TBD"}
            </p>
            {resume.availability.timezone ? (
              <p className="mt-2 text-sm text-slate-600">
                {resume.availability.timezone.label} · Collaboration window{" "}
                {resume.availability.timezone.collaboration_window}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <footer className="border-t border-slate-200 pt-4 text-xs uppercase tracking-wide text-slate-500">
        <p>Resume version {resume.version}</p>
        {resume.lastModified ? (
          <p>Last modified {resume.lastModified}</p>
        ) : null}
        <p>
          Download this resume at <code>{resume.downloads.pdf}</code> or JSON
          at <code>{resume.downloads.json}</code>.
        </p>
      </footer>
    </main>
  );
}
