import { computeModerationOutcome, normalizeModerationLabel, type ModerationDecision } from "../moderationOutcome";

const baseLocal = { techIntent: false, reasons: [] };

describe("computeModerationOutcome", () => {
  it("blocks unsafe labels at or above threshold", () => {
    const decision: ModerationDecision = { label: "profanity", confidence: 0.75 };
    const outcome = computeModerationOutcome(decision, baseLocal, 0.2);
    expect(outcome.shouldBlock).toBe(true);
    expect(outcome.effectiveLabel).toBe("profanity");
    expect(outcome.downgraded).toBe(false);
  });

  it("downgrades ambiguous unsafe labels when tech intent is present", () => {
    const decision: ModerationDecision = { label: "harassment_or_trolling", confidence: 0.4 };
    const outcome = computeModerationOutcome(decision, { techIntent: true, reasons: [] }, 0.2);
    expect(outcome.shouldBlock).toBe(false);
    expect(outcome.effectiveLabel).toBe("safe");
    expect(outcome.downgraded).toBe(true);
  });

  it("passes through ambiguous unsafe labels without downgrade when tech intent is absent", () => {
    const decision: ModerationDecision = { label: "sexual_innuendo", confidence: 0.4 };
    const outcome = computeModerationOutcome(decision, baseLocal, 0.2);
    expect(outcome.shouldBlock).toBe(false);
    expect(outcome.effectiveLabel).toBe("sexual_innuendo");
    expect(outcome.downgraded).toBe(false);
  });

  it("blocks on suspicion score even with low confidence", () => {
    const decision: ModerationDecision = { label: "harassment_or_trolling", confidence: 0.3 };
    const outcome = computeModerationOutcome(decision, baseLocal, 0.6);
    expect(outcome.shouldBlock).toBe(true);
    expect(outcome.effectiveLabel).toBe("harassment_or_trolling");
  });
});

describe("normalizeModerationLabel", () => {
  it("normalizes a variety of label formats", () => {
    expect(normalizeModerationLabel("SAFE")).toBe("safe");
    expect(normalizeModerationLabel("profan")).toBe("profanity");
    expect(normalizeModerationLabel("Harassment/Trolling")).toBe("harassment_or_trolling");
    expect(normalizeModerationLabel("Privacy/Doxxing")).toBe("privacy_or_doxxing");
  });
});
