"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button, Chip } from "@portfolio/ui";

import type { Locale } from "../../utils/i18n";
import type { AppDictionary } from "../../utils/dictionaries";
import type {
  ServiceProofItem,
  ServiceTestimonial
} from "../../../../../content/serviceProofItems";
import {
  CONTENT_TYPES,
  FILTER_SCOPES,
  useServiceProofFilters
} from "./filterStore";
import {
  formatClientAttribution,
  formatFullDate,
  formatYearMonth,
  localize,
  parseYearMonth
} from "./utils";
import { ServiceProofEmptyState } from "./ServiceProofEmptyState";

const cardClassName =
  "rounded-2xl border border-border bg-surface/90 p-5 text-sm text-text shadow-sm transition dark:border-dark-border dark:bg-dark-surface/90 dark:text-dark-text";

const bulletListClassName =
  "mt-2 list-disc space-y-2 pl-5 text-sm text-text dark:text-dark-text";

const sectionTitleClassName =
  "text-sm font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted";

type ServiceProofCopy = AppDictionary["serviceProof"];

type ServiceProofItemsSectionProps = {
  items: ServiceProofItem[];
  testimonials: ServiceTestimonial[];
  locale: Locale;
  copy: ServiceProofCopy;
  requestEmail: string;
};

function buildMailto(
  email: string,
  subjectTemplate: string,
  id: string
): string {
  const subject = subjectTemplate.replace("{id}", id);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function isExternalLink(href: string) {
  return href.startsWith("http");
}

export function ServiceProofItemsSection({
  items,
  testimonials,
  locale,
  copy,
  requestEmail
}: ServiceProofItemsSectionProps) {
  const filters = useServiceProofFilters();
  const testimonialMap = useMemo(
    () => new Map(testimonials.map((testimonial) => [testimonial.id, testimonial])),
    [testimonials]
  );

  const filteredItems = useMemo(() => {
    const query = filters.searchQuery.trim();
    const caseSensitive = filters.caseSensitive;
    const exactMatch = filters.exactMatch;
    const activeScopes = filters.scopes.length ? filters.scopes : FILTER_SCOPES;
    const activeTypes =
      filters.contentTypes.length > 0 ? filters.contentTypes : CONTENT_TYPES;
    const activeCategories = filters.categories;

    if (!activeTypes.includes("before-after")) {
      return [] as ServiceProofItem[];
    }

    const normalizedQuery = caseSensitive ? query : query.toLowerCase();

    const matchesQuery = (values: string[]) => {
      if (!normalizedQuery) {
        return true;
      }

      return values.some((value) => {
        const candidate = caseSensitive ? value : value.toLowerCase();
        return exactMatch
          ? candidate === normalizedQuery
          : candidate.includes(normalizedQuery);
      });
    };

    const shouldMatchCategory = activeCategories.length > 0;

    return items
      .filter((item) => {
        if (shouldMatchCategory && !activeCategories.includes(item.category)) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const hasClientDetails = Boolean(
          item.client?.name ||
            item.client?.org ||
            item.client?.role ||
            item.client?.note
        );
        const fallbackClientLabel = item.is_anonymized
          ? copy.item.anonymousLabel
          : copy.item.unknownClientLabel;
        const clientFields = [
          item.client?.name ?? "",
          item.client?.org ? localize(item.client.org, locale) : "",
          item.client?.role ? localize(item.client.role, locale) : "",
          item.client?.note ? localize(item.client.note, locale) : "",
          !hasClientDetails ? fallbackClientLabel : ""
        ].filter(Boolean);

        const fieldMap: Record<(typeof FILTER_SCOPES)[number], string[]> = {
          "title-outcome": [
            localize(item.title, locale),
            localize(item.outcome_one_liner, locale)
          ],
          "problem-solution": [
            ...localize(item.problem, locale),
            ...localize(item.solution, locale)
          ],
          "stack-tools": [...item.stack_tags],
          client: clientFields,
          date: [item.date, formatYearMonth(item.date, locale)]
        };

        const candidateFields = activeScopes.flatMap(
          (scope) => fieldMap[scope] ?? []
        );

        return matchesQuery(candidateFields);
      })
      .sort((a, b) => {
        const delta = parseYearMonth(a.date) - parseYearMonth(b.date);
        if (filters.sortOrder === "newest") {
          return delta === 0 ? a.id.localeCompare(b.id) : -delta;
        }
        return delta === 0 ? a.id.localeCompare(b.id) : delta;
      });
  }, [
    items,
    locale,
    copy.item.anonymousLabel,
    copy.item.unknownClientLabel,
    filters.searchQuery,
    filters.caseSensitive,
    filters.exactMatch,
    filters.scopes,
    filters.contentTypes,
    filters.categories,
    filters.sortOrder
  ]);

  if (filteredItems.length === 0) {
    return (
      <ServiceProofEmptyState
        title={copy.filters.emptyStateTitle}
        body={copy.filters.emptyStateBody}
        clearLabel={copy.filters.clearFiltersLabel}
      />
    );
  }

  return (
    <div className="space-y-5">
      {filteredItems.map((item) => {
        const categoryLabels = {
          "quick-fix": copy.filters.categoryOptions.quickFix,
          deployment: copy.filters.categoryOptions.deployment,
          maintenance: copy.filters.categoryOptions.maintenance
        };
        const attribution = formatClientAttribution({
          client: item.client,
          isAnonymized: item.is_anonymized,
          locale,
          anonymousLabel: copy.item.anonymousLabel,
          unknownLabel: copy.item.unknownClientLabel
        });
        const timeline = item.timeline;
        const mailtoSubject =
          item.mailto_subject
            ? localize(item.mailto_subject, locale)
            : copy.mailtoSubjectTemplate;
        const mailtoHref = buildMailto(requestEmail, mailtoSubject, item.id);
        const linkedTestimonials = (item.testimonial_ids ?? [])
          .map((id) => testimonialMap.get(id))
          .filter(Boolean) as ServiceTestimonial[];

        return (
          <details key={item.id} className={cardClassName}>
            <summary className="list-item cursor-pointer select-none">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                      {copy.item.idLabel} {item.id}
                    </p>
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                      {localize(item.title, locale)}
                    </h3>
                  </div>
                  <Chip
                    as="span"
                    variant="outline"
                    className="text-xs uppercase tracking-wide"
                  >
                    {categoryLabels[item.category]}
                  </Chip>
                </div>
                <p className="text-sm text-textMuted dark:text-dark-textMuted">
                  {localize(item.outcome_one_liner, locale)}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-textMuted dark:text-dark-textMuted">
                  <span>
                    {copy.item.clientLabel}: {attribution.primary}
                  </span>
                  <span>
                    {copy.item.dateLabel}: {formatYearMonth(item.date, locale)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.stack_tags.map((tag) => (
                    <Chip key={tag} as="span" variant="accent" className="text-xs">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </summary>
            <div className="mt-5 space-y-6">
              <div>
                <p className={sectionTitleClassName}>{copy.item.outcomeLabel}</p>
                <p className="mt-2 text-sm text-text dark:text-dark-text">
                  {localize(item.outcome_one_liner, locale)}
                </p>
              </div>
              <div>
                <p className={sectionTitleClassName}>{copy.item.problemLabel}</p>
                <ul className={bulletListClassName}>
                  {localize(item.problem, locale).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={sectionTitleClassName}>{copy.item.solutionLabel}</p>
                <ul className={bulletListClassName}>
                  {localize(item.solution, locale).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              {item.before || item.after ? (
                <div>
                  <p className={sectionTitleClassName}>
                    {copy.item.beforeLabel} / {copy.item.afterLabel}
                  </p>
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    {item.before ? (
                      <div className="rounded-2xl border border-border bg-surface/70 p-4 dark:border-dark-border dark:bg-dark-surface/70">
                        <p className="text-sm font-semibold text-text dark:text-dark-text">
                          {copy.item.beforeLabel}
                        </p>
                        {item.before.bullets ? (
                          <ul className={bulletListClassName}>
                            {localize(item.before.bullets, locale).map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        ) : null}
                        {item.before.images ? (
                          <div className="mt-3 grid gap-3">
                            {item.before.images.map((image) => (
                              <figure key={image.src}>
                                <img
                                  src={image.src}
                                  alt={localize(image.alt, locale)}
                                  className="w-full rounded-xl border border-border dark:border-dark-border"
                                  loading="lazy"
                                />
                                {image.caption ? (
                                  <figcaption className="mt-2 text-xs text-textMuted dark:text-dark-textMuted">
                                    {localize(image.caption, locale)}
                                  </figcaption>
                                ) : null}
                              </figure>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {item.after ? (
                      <div className="rounded-2xl border border-border bg-surface/70 p-4 dark:border-dark-border dark:bg-dark-surface/70">
                        <p className="text-sm font-semibold text-text dark:text-dark-text">
                          {copy.item.afterLabel}
                        </p>
                        {item.after.bullets ? (
                          <ul className={bulletListClassName}>
                            {localize(item.after.bullets, locale).map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        ) : null}
                        {item.after.images ? (
                          <div className="mt-3 grid gap-3">
                            {item.after.images.map((image) => (
                              <figure key={image.src}>
                                <img
                                  src={image.src}
                                  alt={localize(image.alt, locale)}
                                  className="w-full rounded-xl border border-border dark:border-dark-border"
                                  loading="lazy"
                                />
                                {image.caption ? (
                                  <figcaption className="mt-2 text-xs text-textMuted dark:text-dark-textMuted">
                                    {localize(image.caption, locale)}
                                  </figcaption>
                                ) : null}
                              </figure>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {item.artifacts ? (
                <div>
                  <p className={sectionTitleClassName}>
                    {copy.item.artifactsLabel}
                  </p>
                  <div className="mt-3 space-y-3 text-sm">
                    {item.artifacts.links ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                          {copy.item.artifactsLinksLabel}
                        </p>
                        <ul className="space-y-1">
                          {item.artifacts.links.map((link) => {
                            const label = localize(link.label, locale);
                            return (
                              <li key={label}>
                                {isExternalLink(link.href) ? (
                                  <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                                  >
                                    {label}
                                  </a>
                                ) : (
                                  <Link
                                    href={link.href}
                                    className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                                  >
                                    {label}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                    {item.artifacts.repo_or_pr ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                          {copy.item.repoLabel}
                        </p>
                        {isExternalLink(item.artifacts.repo_or_pr.href) ? (
                          <a
                            href={item.artifacts.repo_or_pr.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                          >
                            {localize(item.artifacts.repo_or_pr.label, locale)}
                          </a>
                        ) : (
                          <Link
                            href={item.artifacts.repo_or_pr.href}
                            className="font-semibold text-accent underline-offset-4 hover:underline dark:text-dark-accent"
                          >
                            {localize(item.artifacts.repo_or_pr.label, locale)}
                          </Link>
                        )}
                      </div>
                    ) : null}
                    {item.artifacts.notes ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                          {copy.item.notesLabel}
                        </p>
                        <ul className={bulletListClassName}>
                          {localize(item.artifacts.notes, locale).map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {timeline ? (
                <div>
                  <p className={sectionTitleClassName}>{copy.item.timelineLabel}</p>
                  <div className="mt-3 rounded-2xl border border-border bg-surface/70 p-4 text-sm text-text dark:border-dark-border dark:bg-dark-surface/70 dark:text-dark-text">
                    <div className="space-y-2">
                      {timeline.duration_business_days ? (
                        <p>
                          {copy.item.durationLabel}: {timeline.duration_business_days} {copy.item.businessDaysLabel}
                        </p>
                      ) : null}
                      {timeline.kickoff ? (
                        <p>
                          {copy.item.kickoffLabel}: {formatFullDate(timeline.kickoff, locale)}
                        </p>
                      ) : null}
                      {timeline.delivery ? (
                        <p>
                          {copy.item.deliveryLabel}: {formatFullDate(timeline.delivery, locale)}
                        </p>
                      ) : null}
                      {timeline.scope ? (
                        <p>
                          {copy.item.scopeLabel}: {localize(timeline.scope, locale)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {item.metrics ? (
                <div>
                  <p className={sectionTitleClassName}>{copy.item.metricsLabel}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {item.metrics.map((metric) => (
                      <div
                        key={localize(metric.label, locale)}
                        className="rounded-2xl border border-border bg-surface/70 p-4 text-sm text-text dark:border-dark-border dark:bg-dark-surface/70 dark:text-dark-text"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                          {localize(metric.label, locale)}
                        </p>
                        <div className="mt-3 space-y-1">
                          {metric.before ? (
                            <p>
                              {copy.item.beforeLabel}: {localize(metric.before, locale)}
                            </p>
                          ) : null}
                          {metric.after ? (
                            <p>
                              {copy.item.afterLabel}: {localize(metric.after, locale)}
                            </p>
                          ) : null}
                          {metric.note ? (
                            <p className="text-xs text-textMuted dark:text-dark-textMuted">
                              {copy.item.noteLabel}: {localize(metric.note, locale)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {linkedTestimonials.length > 0 ? (
                <div>
                  <p className={sectionTitleClassName}>
                    {copy.item.testimonialLabel}
                  </p>
                  <div className="mt-3 grid gap-3">
                    {linkedTestimonials.map((testimonial) => {
                      const testimonialAttribution = formatClientAttribution({
                        client: testimonial.client,
                        isAnonymized: testimonial.is_anonymized,
                        locale,
                        anonymousLabel: copy.item.anonymousLabel,
                        unknownLabel: copy.item.unknownClientLabel
                      });

                      return (
                        <div
                          key={testimonial.id}
                          className="rounded-2xl border border-border bg-surface/70 p-4 text-sm text-text dark:border-dark-border dark:bg-dark-surface/70 dark:text-dark-text"
                        >
                          <p className="text-sm italic">
                            “{localize(testimonial.quote, locale)}”
                          </p>
                          <div className="mt-2 text-xs text-textMuted dark:text-dark-textMuted">
                            <p>{testimonialAttribution.primary}</p>
                            {testimonialAttribution.secondary ? (
                              <p>{testimonialAttribution.secondary}</p>
                            ) : null}
                            {testimonialAttribution.note ? (
                              <p>{testimonialAttribution.note}</p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" href={mailtoHref}>
                  {copy.item.requestCtaLabel}
                </Button>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
