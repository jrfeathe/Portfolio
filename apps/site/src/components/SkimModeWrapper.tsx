"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { useSkimMode } from "../utils/skim-mode";

type SkimModeWrapperProps = {
  children: ReactNode;
};

export function SkimModeWrapper({ children }: SkimModeWrapperProps) {
  const [hydrated, setHydrated] = useState(false);
  const skimActive = useSkimMode();
  const prevSkimRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      return;
    }
    document.documentElement.dataset.skimMode = skimActive ? "true" : "false";
  }, [hydrated, skimActive]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    if (prevSkimRef.current === null) {
      prevSkimRef.current = skimActive;
      return;
    }
    if (prevSkimRef.current === skimActive) {
      return;
    }
    prevSkimRef.current = skimActive;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    const scrollContainer = document.querySelector<HTMLElement>("[data-mobile-scroll-container=\"true\"]");
    const scrollToTop = () => {
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior });
        return;
      }
      const scrollingElement = document.scrollingElement;
      if (scrollingElement) {
        scrollingElement.scrollTo({ top: 0, behavior });
        return;
      }
      window.scrollTo({ top: 0, behavior });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTop();
      });
    });
  }, [hydrated, skimActive]);

  return (
    <div data-skim-mode={hydrated && skimActive ? "true" : "false"}>
      {children}
    </div>
  );
}
