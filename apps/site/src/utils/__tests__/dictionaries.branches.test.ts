import type {
  ExperienceEntry,
  LocalizedExperienceEntry,
  LocalizedTechExperienceEntry,
  TechExperienceEntry
} from "../dictionaries";
import { __testables } from "../dictionaries";

const {
  ensureLocalizedString,
  localizeStringList,
  getRoadmapStep,
  normalizeTechExperience,
  localizeTechExperience,
  localizeExperienceEntry
} = __testables;

describe("dictionaries branch coverage helpers", () => {
  it("wraps plain strings when ensuring localized strings", () => {
    expect(ensureLocalizedString("hello")).toEqual({ en: "hello" });
  });

  it("returns arrays unchanged and falls back when localized values are missing", () => {
    const values = ["one", "two"];
    expect(localizeStringList(values, "ja")).toBe(values);

    const fallback = ["fallback"];
    expect(localizeStringList(undefined, "ja", fallback)).toBe(fallback);
  });

  it("returns roadmap fallback when locale content is missing", () => {
    const project = { id: "proj", home: undefined } as unknown as {
      id: string;
      home?: { roadmapNextStep?: Partial<Record<string, string>> };
    };
    expect(getRoadmapStep(project, "ja")).toBe("");
  });

  it("normalizes tech experience with string fields and localizes with fallbacks", () => {
    const techEntry: TechExperienceEntry = {
      id: "tech-1",
      title: "Title",
      context: "Context",
      summary: "Summary",
      highlights: ["Alpha"]
    };

    const normalized = normalizeTechExperience(techEntry);
    const normalizedTitle = normalized.title as Record<string, string>;
    const normalizedHighlights = normalized.highlights as Record<string, string[]>;
    expect(normalizedTitle.en).toBe("Title");
    expect(normalizedHighlights.en).toEqual(["Alpha"]);

    const localized = localizeTechExperience(
      {
        ...normalized,
        highlights: { en: ["Alpha"], ja: ["Bravo"] }
      },
      "ja"
    );
    expect(localized.highlights).toEqual(["Bravo"]);

    const fallbackLocalized = localizeTechExperience(
      {
        ...normalized,
        title: { en: "Title", ja: "題名" },
        context: { en: "Context" },
        summary: { en: "Summary" },
        highlights: { en: ["Alpha"] }
      } as LocalizedTechExperienceEntry,
      "zh"
    );
    expect(fallbackLocalized.title).toBe("Title");
    expect(fallbackLocalized.highlights).toEqual(["Alpha"]);
  });

  it("normalizes tech experience when fields are missing", () => {
    const normalized = normalizeTechExperience({ id: "bare" } as unknown as LocalizedTechExperienceEntry);
    expect(normalized.title).toEqual({});
    expect(normalized.context).toEqual({});
    expect(normalized.summary).toEqual({});
    expect(normalized.highlights).toEqual({});
  });

  it("localizes tech experience when title is a string and when locale data is absent", () => {
    const stringTitleEntry: LocalizedTechExperienceEntry = {
      id: "string-title",
      title: "Plain",
      context: {},
      summary: {},
      highlights: {}
    };
    const stringTitle = localizeTechExperience(stringTitleEntry, "ja");
    expect(stringTitle.title).toBe("Plain");

    const missingTitleEntry: LocalizedTechExperienceEntry = {
      id: "missing-title",
      title: {},
      context: {},
      summary: {},
      highlights: {}
    };
    const missingTitle = localizeTechExperience(missingTitleEntry, "ja");
    expect(missingTitle.title).toBe("");
    expect(missingTitle.summary).toBe("");
  });

  it("falls back to english highlights when locale data is missing", () => {
    const entry: LocalizedExperienceEntry = {
      id: "exp",
      company: { en: "Co" },
      role: { en: "Engineer" },
      timeframe: { en: "2025" },
      summary: { en: "Did things" },
      highlights: { en: ["One", "Two"] }
    };

    const localized: ExperienceEntry = localizeExperienceEntry(entry, "ja");
    expect(localized.highlights).toEqual(["One", "Two"]);
  });
});
