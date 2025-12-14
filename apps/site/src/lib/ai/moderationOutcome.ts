import type { LocalModerationResult } from "./moderation";

export type ModerationLabel =
  | "safe"
  | "profanity"
  | "harassment_or_trolling"
  | "sexual_innuendo"
  | "privacy_or_doxxing"
  | "self_harm_or_violence"
  | "other_unsafe";

export type ModerationDecision = {
  label: ModerationLabel;
  confidence?: number;
  model?: string;
  finishReason?: string;
  raw?: string;
  reason?: string;
};

export function normalizeModerationLabel(value?: string): ModerationLabel {
  const normalized = (value ?? "").toLowerCase().replace(/[^a-z]+/g, "_");
  if (normalized.includes("safe")) return "safe";
  if (normalized.includes("profan")) return "profanity";
  if (normalized.includes("harass") || normalized.includes("troll")) return "harassment_or_trolling";
  if (normalized.includes("sexual") || normalized.includes("nsfw") || normalized.includes("innuendo")) {
    return "sexual_innuendo";
  }
  if (normalized.includes("dox") || normalized.includes("privacy")) return "privacy_or_doxxing";
  if (normalized.includes("self") || normalized.includes("harm") || normalized.includes("violence")) {
    return "self_harm_or_violence";
  }
  return "other_unsafe";
}

export function clampConfidence(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return Math.min(1, Math.max(0, parsed));
}

export function computeModerationOutcome(
  decision: ModerationDecision | null,
  local: Pick<LocalModerationResult, "techIntent" | "reasons">,
  suspicionScore: number
): { effectiveLabel: ModerationLabel; shouldBlock: boolean; downgraded: boolean; decisionLabel?: ModerationLabel } {
  if (!decision) {
    return { effectiveLabel: "other_unsafe", shouldBlock: true, downgraded: false, decisionLabel: undefined };
  }

  const confidence = decision.confidence ?? 1;
  const unsafeLabel = decision.label !== "safe";
  const meetsBlockThreshold = unsafeLabel && (confidence >= 0.7 || suspicionScore >= 0.5);
  const isAmbiguousUnsafe = unsafeLabel && !meetsBlockThreshold;
  const canDowngradeForTech =
    isAmbiguousUnsafe &&
    local.techIntent &&
    decision.label !== "privacy_or_doxxing" &&
    decision.label !== "self_harm_or_violence" &&
    !local.reasons.includes("doxxing");

  if (meetsBlockThreshold) {
    return { effectiveLabel: decision.label, shouldBlock: true, downgraded: false, decisionLabel: decision.label };
  }

  if (canDowngradeForTech) {
    return { effectiveLabel: "safe", shouldBlock: false, downgraded: true, decisionLabel: decision.label };
  }

  return {
    effectiveLabel: decision.label,
    shouldBlock: unsafeLabel ? false : false,
    downgraded: false,
    decisionLabel: decision.label
  };
}
