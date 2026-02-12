"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";

import type { Locale } from "../../utils/i18n";
import type { AppDictionary } from "../../utils/dictionaries";
import type { ProofCategory } from "../../../../../content/serviceProofItems";
import {
  resetServiceProofFilters,
  updateServiceProofFilters,
  useServiceProofFilters,
  type ContentTypeFilter,
  type FilterScopeKey,
  type SortOrder
} from "./filterStore";

const SEARCH_DEBOUNCE_MS = 300;
const DESKTOP_BREAKPOINT = 1024;

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus-visible:border-dark-accent dark:focus-visible:ring-dark-accent/40";

const selectClassName =
  "rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus-visible:border-dark-accent dark:focus-visible:ring-dark-accent/40";

const checkboxClassName =
  "h-4 w-4 rounded border-border text-accent accent-accent dark:border-dark-border dark:text-dark-accent dark:accent-dark-accent";

type FilterCopy = AppDictionary["serviceProof"]["filters"];

type ServiceProofFilterBarProps = {
  copy: FilterCopy;
  locale: Locale;
};

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

function toggleListValue<T extends string>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

type MultiSelectMenuProps<T extends string> = {
  label: string;
  options: Array<ToggleOption<T>>;
  selected: T[];
  onChange: (next: T[]) => void;
  id: string;
};

function MultiSelectMenu<T extends string>({
  label,
  options,
  selected,
  onChange,
  id
}: MultiSelectMenuProps<T>) {
  const selectedCount = selected.length;

  return (
    <details className="relative inline-block">
      <summary
        className={clsx(
          "flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text shadow-sm transition",
          "cursor-pointer list-none",
          "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          "dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:focus-visible:ring-dark-accent/40",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <span>{label}</span>
        {selectedCount ? (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-semibold text-textMuted dark:border-dark-border/60 dark:text-dark-textMuted">
            {selectedCount}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="ml-auto text-xs text-textMuted dark:text-dark-textMuted"
        >
          ▾
        </span>
      </summary>
      <div
        className={clsx(
          "absolute left-0 top-full z-30 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-3 pr-8 shadow-xl",
          "dark:border-dark-border dark:bg-dark-surface"
        )}
      >
        <fieldset className="space-y-2" aria-label={label}>
          {options.map((option) => {
            const inputId = `${id}-${option.value}`;
            const checked = selected.includes(option.value);

            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className="flex items-center gap-2 text-sm text-text dark:text-dark-text"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(toggleListValue(selected, option.value))}
                  className={checkboxClassName}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </details>
  );
}

export function ServiceProofFilterBar({ copy, locale }: ServiceProofFilterBarProps) {
  const filters = useServiceProofFilters();
  const searchId = useId();
  const sortId = useId();
  const scopeId = useId();
  const contentTypeId = useId();
  const categoryId = useId();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateIsDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);

    return () => {
      window.removeEventListener("resize", updateIsDesktop);
    };
  }, []);

  useEffect(() => {
    resetServiceProofFilters();
  }, [locale]);

  useEffect(() => {
    const handle = setTimeout(() => {
      updateServiceProofFilters({
        searchQuery: filters.searchInput.trim()
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [filters.searchInput]);

  const scopeOptions: Array<ToggleOption<FilterScopeKey>> = [
    { value: "title-outcome", label: copy.scopeOptions.titleOutcome },
    { value: "problem-solution", label: copy.scopeOptions.problemSolution },
    { value: "stack-tools", label: copy.scopeOptions.stackTools },
    { value: "client", label: copy.scopeOptions.client },
    { value: "date", label: copy.scopeOptions.date }
  ];

  const contentTypeOptions: Array<ToggleOption<ContentTypeFilter>> = [
    { value: "before-after", label: copy.contentTypeOptions.beforeAfter },
    { value: "testimonials", label: copy.contentTypeOptions.testimonials }
  ];

  const categoryOptions: Array<ToggleOption<ProofCategory>> = [
    { value: "quick-fix", label: copy.categoryOptions.quickFix },
    { value: "deployment", label: copy.categoryOptions.deployment },
    { value: "maintenance", label: copy.categoryOptions.maintenance }
  ];

  const sortOptions: Array<ToggleOption<SortOrder>> = [
    { value: "newest", label: copy.sortOptions.newest },
    { value: "oldest", label: copy.sortOptions.oldest }
  ];
  const caseFilterClassName = clsx(
    "flex",
    isDesktop
      ? "flex-col items-start gap-0.5"
      : "flex-row items-center gap-3"
  );

  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-2">
          <input
            id={searchId}
            type="text"
            placeholder={copy.searchPlaceholder}
            value={filters.searchInput}
            onChange={(event) =>
              updateServiceProofFilters({ searchInput: event.target.value })
            }
            className={inputClassName}
          />
        </div>
        <div className={caseFilterClassName}>
          <label className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={filters.caseSensitive}
              onChange={() =>
                updateServiceProofFilters({
                  caseSensitive: !filters.caseSensitive
                })
              }
              className={checkboxClassName}
            />
            <span>{copy.caseSensitiveLabel}</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={filters.exactMatch}
              onChange={() =>
                updateServiceProofFilters({ exactMatch: !filters.exactMatch })
              }
              className={checkboxClassName}
            />
            <span>{copy.exactMatchLabel}</span>
          </label>
        </div>
        <div className="flex flex-wrap items-start gap-3 lg:flex-nowrap">
          <MultiSelectMenu
            id={scopeId}
            label={copy.scopeLabel}
            options={scopeOptions}
            selected={filters.scopes}
            onChange={(next) => updateServiceProofFilters({ scopes: next })}
          />
          <MultiSelectMenu
            id={contentTypeId}
            label={copy.contentTypeLabel}
            options={contentTypeOptions}
            selected={filters.contentTypes}
            onChange={(next) =>
              updateServiceProofFilters({ contentTypes: next })
            }
          />
          <MultiSelectMenu
            id={categoryId}
            label={copy.categoryLabel}
            options={categoryOptions}
            selected={filters.categories}
            onChange={(next) => updateServiceProofFilters({ categories: next })}
          />
          <label
            htmlFor={sortId}
            className={clsx(
              "text-sm font-semibold text-text dark:text-dark-text",
              "flex items-center gap-2"
            )}
          >
            {copy.sortLabel}
            <select
              id={sortId}
              value={filters.sortOrder}
              onChange={(event) =>
                updateServiceProofFilters({
                  sortOrder: event.target.value as SortOrder
                })
              }
              className={selectClassName}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
