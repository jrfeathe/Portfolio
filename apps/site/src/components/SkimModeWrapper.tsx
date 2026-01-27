"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useSkimMode } from "../utils/skim-mode";

type SkimModeWrapperProps = {
  children: ReactNode;
};

export function SkimModeWrapper({ children }: SkimModeWrapperProps) {
  const [hydrated, setHydrated] = useState(false);
  const skimActive = useSkimMode();

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      return;
    }
    document.documentElement.dataset.skimMode = skimActive ? "true" : "false";
  }, [hydrated, skimActive]);

  return (
    <div data-skim-mode={hydrated && skimActive ? "true" : "false"}>
      {children}
    </div>
  );
}
