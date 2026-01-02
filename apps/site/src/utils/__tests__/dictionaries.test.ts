import path from "node:path";

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
    expect(dictionary.notes.index.empty).toContain("ノートは準備中です。");
  });

  it("returns localized hero copy for chinese locale", () => {
    const dictionary = getDictionary("zh");
    expect(dictionary.metadata.title).toContain("作品集");
    expect(dictionary.home.hero.title).toBe("Jack Featherstone");
    expect(dictionary.home.sections.proof.proofChips).toHaveLength(4);
  });

  describe("fallbacks and validation", () => {
    const projectModuleMap = {
      "stellaris-mods": path.join(__dirname, "../../../data/projects/stellaris-mods.json"),
      "minecraft-mods": path.join(__dirname, "../../../data/projects/minecraft-mods.json"),
      quester2000: path.join(__dirname, "../../../data/projects/quester2000.json"),
      rollodex: path.join(__dirname, "../../../data/projects/rollodex.json"),
      "ser321-ta": path.join(__dirname, "../../../data/projects/ser321-ta.json"),
      "portfolio-site": path.join(__dirname, "../../../data/projects/portfolio.json"),
      "cpp-game-engine": path.join(__dirname, "../../../data/projects/cpp-game-engine.json")
    };

    const baseProject = {
      id: "project-id",
      names: {
        proofTitle: { en: "Proof headline" }
      },
      home: {
        proofDetails: { en: "English only proof detail" },
        roadmapNextStep: { en: "Ship the next milestone" }
      },
      techStack: {
        item: {
          name: { en: "Base stack" },
          href: "/tech",
          assetId: "base-stack"
        },
        experience: {
          id: "base-experience",
          title: { en: "Base stack title" },
          context: { en: "English context" },
          summary: { en: "English summary" },
          highlights: { en: ["English highlight"] }
        }
      },
      experienceEntry: {
        id: "base-experience",
        company: { en: "Base Co" },
        role: { en: "Engineer" },
        timeframe: { en: "2025" },
        summary: { en: "Built core features" },
        highlights: { en: ["Shipped feature"] }
      }
    };

    type ProjectOverrides = Partial<
      Record<keyof typeof projectModuleMap, Record<string, unknown>>
    >;

    const loadDictionariesWith = (
      projectOverrides: ProjectOverrides = {},
      techStackDetails = [
        {
          id: "shared-tech",
          title: { en: "Shared tech" },
          context: "Shared context",
          summary: { en: "Shared summary" },
          highlights: ["Shared highlight"]
        }
      ]
    ) => {
      jest.resetModules();

      Object.entries(projectModuleMap).forEach(([id, modulePath]) => {
        const override = projectOverrides[id as keyof typeof projectModuleMap];
        jest.doMock(modulePath, () => ({
          __esModule: true,
          default: {
            ...baseProject,
            id,
            ...override
          }
        }));
      });

      jest.doMock(path.join(__dirname, "../../../data/tech-stack-details.json"), () => ({
        __esModule: true,
        default: techStackDetails
      }));

      let moduleExports: typeof import("../dictionaries") | undefined;
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        moduleExports = require("../dictionaries");
      });

      if (!moduleExports) {
        throw new Error("Failed to load dictionaries module in test");
      }

      return moduleExports;
    };

    it("falls back to english content when a locale-specific value is missing", () => {
      const { getDictionary } = loadDictionariesWith({
        "stellaris-mods": {
          techStack: {
            item: {
              name: { en: "Localized Stack" },
              href: "/tech/stack",
              assetId: "localized"
            },
            experience: {
              id: "localized-experience",
              title: "String title falls back to English",
              context: { en: "Context in English only" },
              summary: { en: "Summary in English only" },
              highlights: { en: ["English highlight"], ja: ["Japanese highlight"] }
            }
          }
        },
        rollodex: {
          names: {},
          home: {
            proofDetails: { en: "Proof lives in English" },
            roadmapNextStep: { en: "Publish case study" }
          },
          experienceEntry: {
            ...baseProject.experienceEntry,
            highlights: ["Array highlights apply to every locale"]
          },
          techStack: {
            item: {
              name: { en: "Localized Stack" },
              href: "/tech/stack",
              assetId: "localized"
            },
            experience: {
              id: "localized-experience",
              title: "String title falls back to English",
              context: { en: "Context in English only" },
              summary: { en: "Summary in English only" },
              highlights: { en: ["English highlight"], ja: ["Japanese highlight"] }
            }
          }
        },
        quester2000: {
          home: {
            roadmapNextStep: { en: "Publish case study" }
          }
        }
      });

      const dictionary = getDictionary("ja");
      const proofChip = dictionary.home.sections.proof.proofChips[0];
      expect(proofChip.title).toBe("Rollodex");
      expect(proofChip.details).toBe("Proof lives in English");

      const firstRoadmapStep = dictionary.home.sections.roadmap.nextSteps[0];
      expect(firstRoadmapStep).toBe("Publish case study");

      const firstExperience = dictionary.experience.entries[0];
      expect(firstExperience.highlights).toEqual([
        "Array highlights apply to every locale"
      ]);

      const techStack = dictionary.experience.techStack.find(
        (entry) => entry.id === "localized-experience"
      );
      expect(techStack?.context).toBe("Context in English only");
      expect(techStack?.title).toBe("String title falls back to English");
      expect(techStack?.highlights).toContain("Japanese highlight");
    });

    it("throws a clear error when a project is missing required experience data", () => {
      expect(() =>
        loadDictionariesWith({
          rollodex: {
            experienceEntry: undefined
          }
        })
      ).toThrow('Experience entry is required for project "rollodex".');
    });

    it("throws a clear error when a project is missing required tech stack data", () => {
      expect(() =>
        loadDictionariesWith({
          "stellaris-mods": {
            techStack: undefined
          }
        })
      ).toThrow('Tech stack is required for project "stellaris-mods".');
    });
  });
});
