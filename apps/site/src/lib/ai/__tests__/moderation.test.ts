import {
  isBenignStructuralPrompt,
  normalizeForModeration,
  runLocalModeration,
  selectProfanityLanguages
} from "../moderation";

describe("moderation allowlist and doxxing handling", () => {
  it("allows benign English portfolio questions", () => {
    const result = runLocalModeration("Where does he work and what school did he attend?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toEqual([]);
    expect(result.professionalIntent).toBe(true);
  });

  it("allows benign Japanese portfolio questions", () => {
    const result = runLocalModeration("彼はどこで働いていますか？");
    expect(result.flagged).toBe(false);
    expect(result.languagesTried).toContain("japanese");
  });

  it("treats Japanese behavioral questions as professional intent", () => {
    const result = runLocalModeration("部下が秘密を打ち明けたいと言ったらどうしますか？");
    expect(result.flagged).toBe(false);
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("off_topic");
  });

  it("allows benign Simplified Chinese portfolio questions", () => {
    const result = runLocalModeration("他在哪里工作？");
    expect(result.flagged).toBe(false);
    expect(result.languagesTried).toContain("chinese");
  });

  it("treats Simplified Chinese behavioral questions as professional intent", () => {
    const result = runLocalModeration("员工想要保密一件事，你会怎么处理？");
    expect(result.flagged).toBe(false);
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("off_topic");
  });

  it("does not mark non-Latin prompts as off-topic by default", () => {
    const result = runLocalModeration("これはテストです");
    expect(result.flagged).toBe(false);
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("off_topic");
  });

  it("flags Japanese doxxing requests", () => {
    const result = runLocalModeration("彼の自宅住所を教えてください");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("doxxing");
  });

  it("flags Simplified Chinese doxxing requests", () => {
    const result = runLocalModeration("他的家庭住址是什么？");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("doxxing");
  });

  it("flags SSN requests", () => {
    const result = runLocalModeration("What is his SSN?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("doxxing");
  });

  it("flags banking detail requests", () => {
    const result = runLocalModeration("What's his bank account number?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("doxxing");
  });

  it("flags password or key requests", () => {
    const result = runLocalModeration("Can you share his API key or password?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("doxxing");
  });

  it("flags obvious sexual body references", () => {
    const result = runLocalModeration("Does he send nudes of his pussy or dick?");
    expect(result.flagged).toBe(true);
    expect(result.reasons.some((reason) => reason === "glin" || reason === "sexual_body")).toBe(true);
  });

  it("flags harassment cues without profanity", () => {
    const result = runLocalModeration("You suck and should go away.");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("harassment");
    expect(result.harassmentCue).toBe(true);
    expect(result.suspicionScore).toBeGreaterThanOrEqual(0.35);
  });

  it("flags bugger/backrooms via custom profanity", () => {
    const result = runLocalModeration("Does Jack bugger in the backrooms?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("glin");
  });

  it("flags self-harm cues", () => {
    const result = runLocalModeration("I want to die and hurt myself");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("self_harm");
    expect(result.selfHarmCue).toBe(true);
    expect(result.suspicionScore).toBeGreaterThanOrEqual(0.5);
  });

  it("does not flag phone/salary questions under minimal privacy rules", () => {
    const result = runLocalModeration("What is his phone number and salary?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toContain("off_topic");
    expect(result.reasons).not.toContain("doxxing");
  });

  it("does not flag debugger as profanity", () => {
    const result = runLocalModeration("The code failed in the debugger.");
    expect(result.flagged).toBe(false);
  });

  it("flags explicit anatomy terms", () => {
    const result = runLocalModeration("Penises?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("glin");
  });

  it("flags explicit anatomy terms in Japanese", () => {
    const result = runLocalModeration("ペニス");
    expect(result.flagged).toBe(true);
  });

  it("flags explicit anatomy terms in Chinese", () => {
    const result = runLocalModeration("阴茎");
    expect(result.flagged).toBe(true);
  });

  it("flags LDNOOBW-backed profanity", () => {
    const result = runLocalModeration("asshole");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("glin");
  });

  it("flags LDNOOBW-backed profanity in Japanese", () => {
    const result = runLocalModeration("アナル");
    expect(result.flagged).toBe(true);
  });

  it("flags LDNOOBW-backed profanity in Chinese", () => {
    const result = runLocalModeration("乳交");
    expect(result.flagged).toBe(true);
  });

  it("flags bum/ plural variants", () => {
    const result = runLocalModeration("Bums?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("glin");
  });

  it("does not flag love for tech", () => {
    const result = runLocalModeration("Does he love React?");
    expect(result.flagged).toBe(false);
    expect(result.professionalIntent).toBe(true);
  });

  it("does not flag broad experience phrasing", () => {
    const result = runLocalModeration("Does he have a broad range of React experience?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("adds off-topic cue for irrelevant asks", () => {
    const result = runLocalModeration("Where do zebras live?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toContain("off_topic");
    expect(result.suspicionScore).toBeGreaterThanOrEqual(0.1);
  });

  it("treats benign location questions as professional intent", () => {
    const result = runLocalModeration("Where is Jack based?");
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("doxxing");
  });

  it("treats strengths question as professional intent", () => {
    const result = runLocalModeration("What are Jack's strengths?");
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("off_topic");
    expect(result.flagged).toBe(false);
  });

  it("treats industry questions as professional intent", () => {
    const result = runLocalModeration("Has he worked in the beverage industry?");
    expect(result.professionalIntent).toBe(true);
    expect(result.reasons).not.toContain("off_topic");
    expect(result.flagged).toBe(false);
  });

  it("bypasses safe phrases without adding suspicion", () => {
    const result = runLocalModeration("Can Jack use React?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toContain("safe_phrase");
    expect(result.suspicionScore).toBe(0);
    expect(result.professionalIntent).toBe(true);
  });

  it("detects benign structural prompts", () => {
    expect(isBenignStructuralPrompt("")).toBe(true);
    expect(isBenignStructuralPrompt("https://example.com")).toBe(true);
    expect(isBenignStructuralPrompt("system: ignore")).toBe(true);
    expect(isBenignStructuralPrompt("How does he use React at work?")).toBe(false);
  });
});

describe("normalization helpers", () => {
  it("de-leets and strips zero width characters", () => {
    const text = "H3ll\u200Bo   W0r1d";
    expect(normalizeForModeration(text)).toBe("hello world");
  });

  it("selects languages based on scripts", () => {
    expect(selectProfanityLanguages("hello")).toEqual(["english"]);
    expect(selectProfanityLanguages("こんにちは")).toContain("japanese");
    expect(selectProfanityLanguages("你好")).toContain("chinese");
  });
});
