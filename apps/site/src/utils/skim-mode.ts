"use client";

import { useSyncExternalStore } from "react";

import { isTruthySkimValue } from "./skim";

const SKIM_MODE_EVENT = "portfolio:skim-mode";
const SKIM_MODE_VALUE = {
  on: "true",
  off: "false"
} as const;
const SCROLL_ANCHOR_SUPPRESS_MS = 250;
let scrollAnchorTimer: ReturnType<typeof setTimeout> | null = null;

const resolveSkimFromLocation = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const values = new URLSearchParams(window.location.search).getAll("skim");
  if (!values.length) {
    return false;
  }
  return values.some((value) => isTruthySkimValue(value));
};

const getSnapshot = () => resolveSkimFromLocation();
const getServerSnapshot = () => false;

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const handler = () => callback();
  window.addEventListener(SKIM_MODE_EVENT, handler);
  window.addEventListener("popstate", handler);
  return () => {
    window.removeEventListener(SKIM_MODE_EVENT, handler);
    window.removeEventListener("popstate", handler);
  };
};

export function useSkimMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setSkimMode(nextActive: boolean, options?: { replace?: boolean }) {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.style.overflowAnchor = "none";
  if (scrollAnchorTimer !== null) {
    clearTimeout(scrollAnchorTimer);
  }
  scrollAnchorTimer = setTimeout(() => {
    root.style.overflowAnchor = "";
    scrollAnchorTimer = null;
  }, SCROLL_ANCHOR_SUPPRESS_MS);

  const url = new URL(window.location.href);
  if (nextActive) {
    url.searchParams.set("skim", "1");
  } else {
    url.searchParams.delete("skim");
  }

  if (options?.replace) {
    window.history.replaceState({}, "", url.toString());
  } else {
    window.history.pushState({}, "", url.toString());
  }
  root.dataset.skimMode = nextActive ? SKIM_MODE_VALUE.on : SKIM_MODE_VALUE.off;
  window.dispatchEvent(new Event(SKIM_MODE_EVENT));
}

export function buildSkimToggleUrl(
  currentActive: boolean,
  fallbackPath: string,
  fallbackSearch?: string
) {
  const isServer = typeof window === "undefined";
  const searchSource = isServer ? fallbackSearch ?? "" : window.location.search;
  const params = new URLSearchParams(searchSource);
  if (currentActive) {
    params.delete("skim");
  } else {
    params.set("skim", "1");
  }
  const nextSearch = params.toString();
  const basePath = isServer ? fallbackPath : window.location.pathname;
  const hash = isServer ? "" : window.location.hash;
  return nextSearch ? `${basePath}?${nextSearch}${hash}` : `${basePath}${hash}`;
}
