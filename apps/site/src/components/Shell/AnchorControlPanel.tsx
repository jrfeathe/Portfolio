"use client";

import clsx from "clsx";

type AnchorControlPanelProps = {
  className?: string;
  enabled?: boolean;
  expandLabel: string;
  collapseLabel: string;
};

function dispatchEvent(name: string) {
  if (typeof document === "undefined") {
    return;
  }
  document.dispatchEvent(new CustomEvent(name));
}

export function AnchorControlPanel({
  className,
  enabled = false,
  expandLabel,
  collapseLabel
}: AnchorControlPanelProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted",
        className
      )}
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => dispatchEvent("shell-anchor-expand-all")}
          className="rounded-full border border-border/60 px-2 py-0.5 transition hover:border-accent hover:text-text dark:border-dark-border/60 dark:hover:border-dark-accent"
        >
          {expandLabel}
        </button>
        <button
          type="button"
          onClick={() => dispatchEvent("shell-anchor-collapse-all")}
          className="rounded-full border border-border/60 px-2 py-0.5 transition hover:border-accent hover:text-text dark:border-dark-border/60 dark:hover:border-dark-accent"
        >
          {collapseLabel}
        </button>
      </div>
    </div>
  );
}
