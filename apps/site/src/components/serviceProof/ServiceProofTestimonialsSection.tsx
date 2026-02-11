"use client";

import { useMemo } from "react";
import { Chip } from "@portfolio/ui";

import type { Locale } from "../../utils/i18n";
import type { AppDictionary } from "../../utils/dictionaries";
import type { ServiceTestimonial } from "../../../../../content/serviceProofItems";
import {
  CONTENT_TYPES,
  FILTER_SCOPES,
  useServiceProofFilters
} from "./filterStore";
import {
  formatClientAttribution,
  formatYearMonth,
  localize,
  parseYearMonth
} from "./utils";
import { ServiceProofEmptyState } from "./ServiceProofEmptyState";

type ServiceProofCopy = AppDictionary["serviceProof"];

type ServiceProofTestimonialsSectionProps = {
  testimonials: ServiceTestimonial[];
  locale: Locale;
  copy: ServiceProofCopy;
};

export function ServiceProofTestimonialsSection({
  testimonials,
  locale,
  copy
}: ServiceProofTestimonialsSectionProps) {
  const filters = useServiceProofFilters();

  const filteredTestimonials = useMemo(() => {
    const query = filters.searchQuery.trim();
    const caseSensitive = filters.caseSensitive;
    const exactMatch = filters.exactMatch;
    const activeScopes = filters.scopes.length ? filters.scopes : FILTER_SCOPES;
    const activeTypes =
      filters.contentTypes.length > 0 ? filters.contentTypes : CONTENT_TYPES;
    const activeCategories = filters.categories;

    if (!activeTypes.includes("testimonials")) {
      return [] as ServiceTestimonial[];
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

    return testimonials
      .filter((testimonial) => {
        if (
          shouldMatchCategory &&
          (!testimonial.category ||
            !activeCategories.includes(testimonial.category))
        ) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const hasClientDetails = Boolean(
          testimonial.client?.name ||
            testimonial.client?.org ||
            testimonial.client?.role ||
            testimonial.client?.note
        );
        const fallbackClientLabel = testimonial.is_anonymized
          ? copy.item.anonymousLabel
          : copy.item.unknownClientLabel;
        const clientFields = [
          testimonial.client?.name ?? "",
          testimonial.client?.org ? localize(testimonial.client.org, locale) : "",
          testimonial.client?.role ? localize(testimonial.client.role, locale) : "",
          testimonial.client?.note ? localize(testimonial.client.note, locale) : "",
          !hasClientDetails ? fallbackClientLabel : ""
        ].filter(Boolean);

        const fieldMap: Record<(typeof FILTER_SCOPES)[number], string[]> = {
          "title-outcome": [localize(testimonial.quote, locale)],
          "problem-solution": [],
          "stack-tools": testimonial.stack_tags ? [...testimonial.stack_tags] : [],
          client: clientFields,
          date: [testimonial.date, formatYearMonth(testimonial.date, locale)]
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
    testimonials,
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

  if (filteredTestimonials.length === 0) {
    return (
      <ServiceProofEmptyState
        title={copy.filters.emptyStateTitle}
        body={copy.filters.emptyStateBody}
        clearLabel={copy.filters.clearFiltersLabel}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {filteredTestimonials.map((testimonial) => {
        const categoryLabels = {
          "quick-fix": copy.filters.categoryOptions.quickFix,
          deployment: copy.filters.categoryOptions.deployment,
          maintenance: copy.filters.categoryOptions.maintenance
        };
        const attribution = formatClientAttribution({
          client: testimonial.client,
          isAnonymized: testimonial.is_anonymized,
          locale,
          anonymousLabel: copy.item.anonymousLabel,
          unknownLabel: copy.item.unknownClientLabel
        });

        return (
          <article
            key={testimonial.id}
            className="rounded-2xl border border-border bg-surface/90 p-5 text-sm text-text shadow-sm dark:border-dark-border dark:bg-dark-surface/90 dark:text-dark-text"
          >
            <div className="space-y-3">
              <p className="text-sm italic">
                “{localize(testimonial.quote, locale)}”
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-textMuted dark:text-dark-textMuted">
                <span>{attribution.primary}</span>
                {attribution.secondary ? <span>{attribution.secondary}</span> : null}
                <span>{formatYearMonth(testimonial.date, locale)}</span>
              </div>
              {testimonial.category ? (
                <Chip as="span" variant="outline" className="text-xs uppercase tracking-wide">
                  {categoryLabels[testimonial.category]}
                </Chip>
              ) : null}
              {attribution.note ? (
                <p className="text-xs text-textMuted dark:text-dark-textMuted">
                  {attribution.note}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
