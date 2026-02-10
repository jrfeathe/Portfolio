"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { setSkimMode } from "../utils/skim-mode";

type SkimModeRouteGuardProps = {
  locale: string;
};

export function SkimModeRouteGuard({ locale }: SkimModeRouteGuardProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    if (!pathname || typeof window === "undefined") {
      return;
    }

    const homePath = `/${locale}`;
    const isHome = pathname === homePath || pathname === `${homePath}/`;

    if (isHome) {
      return;
    }

    const hasSkimParam = Boolean(searchParams?.get("skim"));
    const hasSkimDataset = document.documentElement.dataset.skimMode === "true";

    if (hasSkimParam || hasSkimDataset) {
      setSkimMode(false, { replace: true });
    }
  }, [locale, pathname, searchParams]);

  return null;
}
