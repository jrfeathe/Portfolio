import { getDictionary } from "../dictionaries";

describe("dictionaries", () => {
  it("returns english dictionary by default", () => {
    const dictionary = getDictionary("en");
    expect(dictionary.metadata.title).toContain("Jack F.");
    expect(dictionary.home.hero.title).toBe("Jack Featherstone");
    expect(dictionary.home.hero.cta.actions[0]?.label).toBe("Download resume");
    expect(dictionary.home.sections.techStack.items.length).toBeGreaterThan(10);
    expect(dictionary.experience.techStack.length).toBeGreaterThan(10);
    expect(dictionary.notes.detail.tocLabel).toBe("On this page");
  });

  it("returns localized hero copy for japanese locale", () => {
    const dictionary = getDictionary("ja");
    expect(dictionary.metadata.title).toBe("Jack F. ポートフォリオ");
    expect(dictionary.home.hero.title).toBe("Jack Featherstone");
    expect(dictionary.notes.index.empty).toContain("近日");
  });

  it("returns localized hero copy for chinese locale", () => {
    const dictionary = getDictionary("zh");
    expect(dictionary.metadata.title).toContain("作品集");
    expect(dictionary.home.hero.title).toBe("Jack Featherstone");
    expect(dictionary.home.sections.proof.proofChips).toHaveLength(4);
  });
});
