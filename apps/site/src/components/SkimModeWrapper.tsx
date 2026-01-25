"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
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
  const skimActive = useMemo(
    () => resolveSkimFromSearchParams(searchParams),
    [searchParams]
  );

  useEffect(() => {
    document.documentElement.dataset.skimMode = skimActive ? "true" : "false";
  }, [skimActive]);

  return (
    <div data-skim-mode={skimActive ? "true" : "false"}>
      {children}
    </div>
  );
}
