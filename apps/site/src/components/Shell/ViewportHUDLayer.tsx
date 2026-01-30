"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export const HUD_LAYER_ID = "hud-layer";
export const HUD_SLOT_IDS = {
  menu: "hud-slot-menu",
  widgets: "hud-slot-widgets",
  chat: "hud-slot-chat"
} as const;

export type HudSlot = keyof typeof HUD_SLOT_IDS;

type HUDViewport = {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
  safeTop: number;
  safeRight: number;
  safeBottom: number;
  safeLeft: number;
};

const DEFAULT_VIEWPORT: HUDViewport = {
  width: 0,
  height: 0,
  offsetTop: 0,
  offsetLeft: 0,
  safeTop: 0,
  safeRight: 0,
  safeBottom: 0,
  safeLeft: 0
};

let hudViewportSnapshot = DEFAULT_VIEWPORT;
const hudViewportListeners = new Set<() => void>();

const getSnapshot = () => hudViewportSnapshot;
const getServerSnapshot = () => DEFAULT_VIEWPORT;
const subscribe = (listener: () => void) => {
  hudViewportListeners.add(listener);
  return () => hudViewportListeners.delete(listener);
};

function updateHUDViewport(next: HUDViewport) {
  const prev = hudViewportSnapshot;
  if (
    prev.width === next.width &&
    prev.height === next.height &&
    prev.offsetTop === next.offsetTop &&
    prev.offsetLeft === next.offsetLeft &&
    prev.safeTop === next.safeTop &&
    prev.safeRight === next.safeRight &&
    prev.safeBottom === next.safeBottom &&
    prev.safeLeft === next.safeLeft
  ) {
    return;
  }
  hudViewportSnapshot = next;
  hudViewportListeners.forEach((listener) => listener());
}

function readSafeArea(root: HTMLElement) {
  const styles = getComputedStyle(root);
  const readPx = (value: string) => Number.parseFloat(value) || 0;
  return {
    top: readPx(styles.getPropertyValue("--safe-top")),
    right: readPx(styles.getPropertyValue("--safe-right")),
    bottom: readPx(styles.getPropertyValue("--safe-bottom")),
    left: readPx(styles.getPropertyValue("--safe-left"))
  };
}

export function useHUDViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ViewportHUDLayer() {
  const rafRef = useRef<number | null>(null);
  const thresholdRef = useRef(2);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const root = document.documentElement;

    const update = () => {
      rafRef.current = null;
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const offsetLeft = viewport?.offsetLeft ?? 0;
      const safe = readSafeArea(root);
      const roundPx = (value: number) => Math.round(value);
      const threshold = thresholdRef.current;
      const prev = hudViewportSnapshot;
      const next = {
        width: roundPx(width),
        height: roundPx(height),
        offsetTop: roundPx(offsetTop),
        offsetLeft: roundPx(offsetLeft),
        safeTop: roundPx(safe.top),
        safeRight: roundPx(safe.right),
        safeBottom: roundPx(safe.bottom),
        safeLeft: roundPx(safe.left)
      };
      const applyThreshold = (prevValue: number, nextValue: number) =>
        Math.abs(nextValue - prevValue) >= threshold ? nextValue : prevValue;
      const stabilized = {
        width: applyThreshold(prev.width, next.width),
        height: applyThreshold(prev.height, next.height),
        offsetTop: applyThreshold(prev.offsetTop, next.offsetTop),
        offsetLeft: applyThreshold(prev.offsetLeft, next.offsetLeft),
        safeTop: applyThreshold(prev.safeTop, next.safeTop),
        safeRight: applyThreshold(prev.safeRight, next.safeRight),
        safeBottom: applyThreshold(prev.safeBottom, next.safeBottom),
        safeLeft: applyThreshold(prev.safeLeft, next.safeLeft)
      };
      const changed =
        stabilized.width !== prev.width ||
        stabilized.height !== prev.height ||
        stabilized.offsetTop !== prev.offsetTop ||
        stabilized.offsetLeft !== prev.offsetLeft ||
        stabilized.safeTop !== prev.safeTop ||
        stabilized.safeRight !== prev.safeRight ||
        stabilized.safeBottom !== prev.safeBottom ||
        stabilized.safeLeft !== prev.safeLeft;

      if (!changed) {
        return;
      }

      root.style.setProperty("--hud-width", `${stabilized.width}px`);
      root.style.setProperty("--hud-height", `${stabilized.height}px`);
      root.style.setProperty("--hud-offset-top", `${stabilized.offsetTop}px`);
      root.style.setProperty("--hud-offset-left", `${stabilized.offsetLeft}px`);
      root.style.setProperty("--hud-safe-top", `${stabilized.safeTop}px`);
      root.style.setProperty("--hud-safe-right", `${stabilized.safeRight}px`);
      root.style.setProperty("--hud-safe-bottom", `${stabilized.safeBottom}px`);
      root.style.setProperty("--hud-safe-left", `${stabilized.safeLeft}px`);

      updateHUDViewport(stabilized);
    };

    const schedule = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    schedule();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  return (
    <div id={HUD_LAYER_ID} data-hud-layer="true" className="hud-layer">
      <div id={HUD_SLOT_IDS.menu} data-hud-slot="menu" />
      <div id={HUD_SLOT_IDS.widgets} data-hud-slot="widgets" />
      <div id={HUD_SLOT_IDS.chat} data-hud-slot="chat" />
    </div>
  );
}

type HudPortalProps = {
  children: ReactNode;
  slot?: HudSlot;
};

export function HudPortal({ children, slot = "widgets" }: HudPortalProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const updateTarget = () => {
      const nextTarget =
        document.getElementById(HUD_SLOT_IDS[slot]) ?? document.getElementById(HUD_LAYER_ID);
      setTarget((current) => (current === nextTarget ? current : nextTarget));
    };

    updateTarget();

    const observer = new MutationObserver(updateTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [slot]);

  if (!target) {
    return null;
  }

  return createPortal(children, target);
}
