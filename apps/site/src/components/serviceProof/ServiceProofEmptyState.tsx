"use client";

import { Button } from "@portfolio/ui";

import { resetServiceProofFilters } from "./filterStore";

type ServiceProofEmptyStateProps = {
  title: string;
  body: string;
  clearLabel: string;
};

export function ServiceProofEmptyState({
  title,
  body,
  clearLabel
}: ServiceProofEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-sm text-text shadow-sm dark:border-dark-border dark:bg-dark-surface/60 dark:text-dark-text">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-text dark:text-dark-text">
          {title}
        </h3>
        <p className="text-sm text-textMuted dark:text-dark-textMuted">
          {body}
        </p>
      </div>
      <Button
        variant="secondary"
        className="mt-4 w-full sm:w-auto"
        onClick={resetServiceProofFilters}
      >
        {clearLabel}
      </Button>
    </div>
  );
}
