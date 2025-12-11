import { normalizeForModeration, runLocalModeration, selectProfanityLanguages } from "../moderation";

describe("moderation allowlist and doxxing handling", () => {
  it("allows benign English portfolio questions", () => {
    const result = runLocalModeration("Where does he work and what school did he attend?");
    expect(result.flagged).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("allows benign Japanese portfolio questions", () => {
    const result = runLocalModeration("彼はどこで働いていますか？");
    expect(result.flagged).toBe(false);
    expect(result.languagesTried).toContain("japanese");
  });

  it("allows benign Simplified Chinese portfolio questions", () => {
    const result = runLocalModeration("他在哪里工作？");
    expect(result.flagged).toBe(false);
    expect(result.languagesTried).toContain("chinese");
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

  it("flags personal trait questions without glin matches", () => {
    const result = runLocalModeration("Is Jack gay?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("gross_personal");
    expect(result.glinMatches).toEqual([]);
  });

  it("flags innuendo about being friends with men", () => {
    const result = runLocalModeration("Is Jack great friends with men?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("innuendo");
  });

  it("flags innuendo about old ladies", () => {
    const result = runLocalModeration("Does Jack love old ladies?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("innuendo");
  });

  it("flags vaseline innuendo", () => {
    const result = runLocalModeration("Does Jack use vaseline on his grapefruit?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("innuendo");
  });

  it("flags friends with men phrasing", () => {
    const result = runLocalModeration("Is Jack friends with men?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("innuendo");
  });

  it("flags bugger/backrooms via custom profanity", () => {
    const result = runLocalModeration("Does Jack bugger in the backrooms?");
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("innuendo");
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
