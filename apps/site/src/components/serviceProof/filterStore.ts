"use client";

import { useSyncExternalStore } from "react";
import type { ProofCategory } from "../../../../../content/serviceProofItems";

export type FilterScopeKey =
  | "title-outcome"
  | "problem-solution"
  | "stack-tools"
  | "client"
  | "date";

export const FILTER_SCOPES: FilterScopeKey[] = [
  "title-outcome",
  "problem-solution",
  "stack-tools",
  "client",
  "date"
];

export type ContentTypeFilter = "before-after" | "testimonials";

export const CONTENT_TYPES: ContentTypeFilter[] = [
  "before-after",
  "testimonials"
];

export type SortOrder = "newest" | "oldest";

export type ServiceProofFilterState = {
  searchInput: string;
  searchQuery: string;
  caseSensitive: boolean;
  exactMatch: boolean;
  scopes: FilterScopeKey[];
  contentTypes: ContentTypeFilter[];
  categories: ProofCategory[];
  sortOrder: SortOrder;
};

const createDefaultFilters = (): ServiceProofFilterState => ({
  searchInput: "",
  searchQuery: "",
  caseSensitive: false,
  exactMatch: false,
  scopes: [],
  contentTypes: [],
  categories: [],
  sortOrder: "newest"
});

let state = createDefaultFilters();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

const emit = () => {
  listeners.forEach((listener) => listener());
};

export function updateServiceProofFilters(
  next: Partial<ServiceProofFilterState>
) {
  state = {
    ...state,
    ...next
  };
  emit();
}

export function resetServiceProofFilters() {
  state = createDefaultFilters();
  emit();
}

export function useServiceProofFilters() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
