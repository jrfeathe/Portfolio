"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import { isTruthySkimValue } from "../utils/skim";

type SkimModeWrapperProps = {
  children: ReactNode;
};

function resolveSkimFromSearchParams(searchParams: ReadonlyURLSearchParams | null) {
  const values: string[] = searchParams?.getAll("skim") ?? [];
  if (!values.length) {
    return false;
  }
  return values.some((value) => isTruthySkimValue(value));
}

export function SkimModeWrapper({ children }: SkimModeWrapperProps) {
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const skimActive = useMemo(() => {
    if (!hydrated) {
      return false;
    }
    return resolveSkimFromSearchParams(searchParams);
  }, [hydrated, searchParams]);

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      return;
    }
    document.documentElement.dataset.skimMode = skimActive ? "true" : "false";
  }, [hydrated, skimActive]);

  return (
    <div data-skim-mode={skimActive ? "true" : "false"}>
      {children}
    </div>
  );
}
