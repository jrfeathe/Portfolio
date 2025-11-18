import stellarisModsProjectData from "../../data/projects/stellaris-mods.json";
import minecraftModsProjectData from "../../data/projects/minecraft-mods.json";
import quester2000ProjectData from "../../data/projects/quester2000.json";
import rollodexProjectData from "../../data/projects/rollodex.json";
import ser321ProjectData from "../../data/projects/ser321-ta.json";
import portfolioProjectData from "../../data/projects/portfolio.json";
import cppGameEngineProjectData from "../../data/projects/cpp-game-engine.json";
import techStackDetailsData from "../../data/tech-stack-details.json";
import type { ImageDescriptor, ResponsiveImagePreset } from "../lib/images";
import type { Locale } from "./i18n";

export type CtaVariant = "primary" | "secondary" | "ghost";

type LocalizedStringMap = Partial<Record<Locale, string>>;

type TechStackEntry = {
  name: string;
  href: string;
  assetId: string;
};

type LocalizedTechStackEntry = {
  name: LocalizedStringMap;
  href: string;
  assetId: string;
};

type TechExperienceEntry = {
  id: string;
  title: string;
  context: string | LocalizedStringMap;
  summary: string | LocalizedStringMap;
  highlights: string[] | Partial<Record<Locale, string[]>>;
};

type LocalizedTechExperienceEntry = {
  id: string;
  title: LocalizedStringMap | string;
  context: Partial<Record<Locale, string>>;
  summary: Partial<Record<Locale, string>>;
  highlights: Partial<Record<Locale, string[]>>;
};

type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  timeframe: string;
  summary: string;
  highlights: string[];
};

type LocalizedExperienceEntry = {
  id: string;
  company: LocalizedStringMap;
  role: LocalizedStringMap;
  timeframe: LocalizedStringMap;
  summary: LocalizedStringMap;
  highlights: Partial<Record<Locale, string[]>>;
};

type ProjectContent = {
  id: string;
  names?: {
    proofTitle?: LocalizedStringMap;
    techStackTitle?: LocalizedStringMap;
  };
  home?: {
    proofDetails?: LocalizedStringMap;
    roadmapNextStep?: LocalizedStringMap;
  };
  techStack?: {
    item: LocalizedTechStackEntry;
    experience: LocalizedTechExperienceEntry | TechExperienceEntry;
  };
  experienceEntry?: LocalizedExperienceEntry;
};

export type AppDictionary = {
  metadata: {
    title: string;
    description: string;
  };
  home: {
    breadcrumbs: {
      home: string;
      workspace: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: {
        title: string;
        description?: string;
        actions: Array<{
          label: string;
          variant: CtaVariant;
          href?: string;
          download?: boolean;
        }>;
      };
      media?: {
        image: ImageDescriptor;
        preset?: ResponsiveImagePreset;
        caption?: string;
      };
    };
    sections: {
      mission: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        bulletPoints: string[];
      };
      techStack: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        items: TechStackEntry[];
      };
      proof: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        proofChips: Array<{ title: string; details: string }>;
      };
      roadmap: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        nextSteps: string[];
      };
    };
    footer: {
      heading: string;
      body: string;
      email: string;
      notesLabel: string;
      notesHref: string;
      resumeLabel: string;
      resumeHref: string;
      closing: string;
    };
  };
  notes: {
    index: {
      title: string;
      subtitle: string;
      empty: string;
    };
    detail: {
      backLabel: string;
      tocLabel: string;
    };
  };
  experience: {
    metadataTitle: string;
    title: string;
    subtitle: string;
    section1title: string;
    section1subtitle: string;
    section2title: string;
    section2subtitle: string;
    entries: ExperienceEntry[];
    techStack: TechExperienceEntry[];
  };
  meetings: {
    metadataTitle: string;
    title: string;
    subtitle: string;
    section1title: string;
    section1subtitle: string;
    intro: string;
    availability: {
      alt: string;
      description: string;
      timezoneHref?: string;
      timezoneLabel?: string;
    };
    slots: Array<{
      title: string;
      description: string;
    }>;
    contactLabel: string;
    contactHref: string;
    contactNote: string;
  };
};

const stellarisModsProject = stellarisModsProjectData as ProjectContent;
const minecraftModsProject = minecraftModsProjectData as ProjectContent;
const quester2000Project = quester2000ProjectData as ProjectContent;
const rollodexProject = rollodexProjectData as ProjectContent;
const ser321Project = ser321ProjectData as ProjectContent;
const portfolioProject = portfolioProjectData as ProjectContent;
const cppGameEngineProject = cppGameEngineProjectData as ProjectContent;
const baseTechStackDetails = techStackDetailsData as LocalizedTechExperienceEntry[];

function ensureLocalizedString(map: LocalizedStringMap | string | undefined): LocalizedStringMap {
  return typeof map === "string" ? { en: map } : (map ?? {});
}

function localizeString(map: LocalizedStringMap | undefined, locale: Locale, fallback = ""): string {
  const localized = ensureLocalizedString(map);
  return localized[locale] ?? localized.en ?? fallback;
}

function localizeStringList(
  map: Partial<Record<Locale, string[]>> | string[] | undefined,
  locale: Locale,
  fallback: string[] = []
): string[] {
  if (Array.isArray(map)) {
    return map;
  }

  const localized = map ?? {};
  return localized[locale] ?? localized.en ?? fallback;
}

function requireExperience(project: ProjectContent, id: string): LocalizedExperienceEntry {
  const experience = project.experienceEntry;
  if (!experience) {
    throw new Error(`Experience entry is required for project "${id}".`);
  }
  return experience;
}

function requireTechStack(project: ProjectContent, id: string) {
  const techStack = project.techStack;
  if (!techStack || !techStack.item || !techStack.experience) {
    throw new Error(`Tech stack is required for project "${id}".`);
  }
  return techStack;
}

function localizeTechStackItem(item: LocalizedTechStackEntry, locale: Locale): TechStackEntry {
  return {
    name: localizeString(item.name, locale),
    href: item.href,
    assetId: item.assetId
  };
}

function buildProofChip(project: ProjectContent, locale: Locale, fallbackTitle: string) {
  return {
    title: localizeString(project.names?.proofTitle, locale, fallbackTitle),
    details: localizeString(project.home?.proofDetails, locale)
  };
}

function getRoadmapStep(project: ProjectContent, locale: Locale) {
  const fallback = project.home?.roadmapNextStep?.["en"] ?? "";
  return project.home?.roadmapNextStep?.[locale] ?? fallback;
}

const { item: STELLARIS_TECH_STACK_ITEM, experience: STELLARIS_TECH_STACK_EXPERIENCE_RAW } =
  requireTechStack(stellarisModsProject, "stellaris-mods");
const { item: MINECRAFT_TECH_STACK_ITEM, experience: MINECRAFT_TECH_STACK_EXPERIENCE_RAW } =
  requireTechStack(minecraftModsProject, "minecraft-mods");

const PROJECT_EXPERIENCE_ENTRIES: LocalizedExperienceEntry[] = [
  requireExperience(portfolioProject, "portfolio-site"),
  requireExperience(rollodexProject, "rollodex"),
  requireExperience(ser321Project, "ser321-ta"),
  requireExperience(cppGameEngineProject, "cpp-game-engine"),
  requireExperience(stellarisModsProject, "stellaris-mods")
];

const buildStellarisProofChip = (locale: Locale) => buildProofChip(stellarisModsProject, locale, "Stellaris Modding");
const buildQuesterProofChip = (locale: Locale) => buildProofChip(quester2000Project, locale, "Quester2000");
const buildPortfolioProofChip = (locale: Locale) => buildProofChip(portfolioProject, locale, "Portfolio");
const buildCppGameEngineProofChip = (locale: Locale) =>
  buildProofChip(cppGameEngineProject, locale, "C++ Game Engine");
const buildSer321ProofChip = (locale: Locale) => buildProofChip(ser321Project, locale, "SER321 TA");
const buildRollodexProofChip = (locale: Locale) => buildProofChip(rollodexProject, locale, "Rollodex");

// Structure for "Evidence" section of Home page. CONTROLS FEATURED PROJECTS
const buildProofChips = (locale: Locale) => [
  buildPortfolioProofChip(locale),
  buildRollodexProofChip(locale),
  buildQuesterProofChip(locale),
  buildSer321ProofChip(locale),
  buildCppGameEngineProofChip(locale),
  buildStellarisProofChip(locale)
];

const getStellarisRoadmapStep = (locale: Locale) => getRoadmapStep(stellarisModsProject, locale);
const getMinecraftRoadmapStep = (locale: Locale) => getRoadmapStep(minecraftModsProject, locale);
const getQuesterRoadmapStep = (locale: Locale) => getRoadmapStep(quester2000Project, locale);
const getCppGameEngineRoadmapStep = (locale: Locale) => getRoadmapStep(cppGameEngineProject, locale);
const getRoadmapSteps = (locale: Locale) => [
  getQuesterRoadmapStep(locale),
  getStellarisRoadmapStep(locale),
  getMinecraftRoadmapStep(locale),
  getCppGameEngineRoadmapStep(locale)
];

function normalizeTechExperience(
  experience: TechExperienceEntry | LocalizedTechExperienceEntry
): LocalizedTechExperienceEntry {
  const title = typeof experience.title === "string" ? { en: experience.title } : (experience.title ?? {});
  const context =
    typeof experience.context === "string" ? { en: experience.context } : (experience.context ?? {});
  const summary =
    typeof experience.summary === "string" ? { en: experience.summary } : (experience.summary ?? {});
  const highlights =
    Array.isArray(experience.highlights)
      ? { en: experience.highlights }
      : (experience.highlights ?? {});

  return {
    id: experience.id,
    title,
    context,
    summary,
    highlights
  };
}

function localizeTechExperience(entry: LocalizedTechExperienceEntry, locale: Locale): TechExperienceEntry {
  const fallbackContext = entry.context.en ?? "";
  const fallbackSummary = entry.summary.en ?? "";
  const fallbackHighlights = entry.highlights.en ?? [];
  const fallbackTitle = typeof entry.title === "string" ? entry.title : entry.title.en ?? "";

  return {
    id: entry.id,
    title: typeof entry.title === "string" ? entry.title : entry.title[locale] ?? fallbackTitle,
    context: entry.context[locale] ?? fallbackContext,
    summary: entry.summary[locale] ?? fallbackSummary,
    highlights: entry.highlights[locale] ?? fallbackHighlights
  };
}

function localizeExperienceEntry(entry: LocalizedExperienceEntry, locale: Locale): ExperienceEntry {
  const fallbackHighlights = entry.highlights.en ?? [];
  return {
    id: entry.id,
    company: localizeString(entry.company, locale),
    role: localizeString(entry.role, locale),
    timeframe: localizeString(entry.timeframe, locale),
    summary: localizeString(entry.summary, locale),
    highlights: localizeStringList(entry.highlights, locale, fallbackHighlights)
  };
}

const HERO_IMAGE_BASE: Omit<ImageDescriptor, "alt"> = {
  src: "/media/hero/portrait-placeholder.svg",
  width: 960,
  height: 720,
  blurDataURL:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAr8B9ngcRwAAAABJRU5ErkJggg=="
};

const STATIC_TECH_STACK_ITEMS: TechStackEntry[] = [
  { name: "React", href: "https://react.dev/", assetId: "react" },
  { name: "HTML", href: "https://html.spec.whatwg.org/multipage/", assetId: "html" },
  { name: "CSS", href: "https://www.w3.org/Style/CSS/Overview.en.html", assetId: "css" },
  { name: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript", assetId: "javascript" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/", assetId: "typescript" },
  { name: "C", href: "https://en.cppreference.com/w/c", assetId: "c" },
  { name: "C++", href: "https://en.cppreference.com/w/cpp", assetId: "cpp" },
  { name: "Java", href: "https://dev.java/", assetId: "java" },
  { name: "Linux", href: "https://www.linuxfoundation.org/", assetId: "linux" },
  { name: "JSON", href: "https://www.json.org/json-en.html", assetId: "json" },
  { name: "Bash", href: "https://www.gnu.org/software/bash/", assetId: "bash" },
  { name: "XML", href: "https://www.w3.org/XML/", assetId: "xml" },
  { name: "KVM", href: "https://www.linux-kvm.org/page/Main_Page", assetId: "kvm" },
  { name: "QEMU", href: "https://www.qemu.org/", assetId: "qemu" },
  { name: "PostgreSQL", href: "https://www.postgresql.org/", assetId: "postgresql" },
  { name: "SQL", href: "https://www.iso.org/standard/63555.html", assetId: "sql" },
  { name: "Lua", href: "https://www.lua.org/", assetId: "lua" },
  { name: "Prisma", href: "https://www.prisma.io/", assetId: "prisma" },
  { name: "Oracle Cloud", href: "https://www.oracle.com/cloud/", assetId: "oracle-cloud" },
  { name: "AWS", href: "https://aws.amazon.com/", assetId: "aws" },
];

const getTechStackItems = (locale: Locale): TechStackEntry[] => [
  ...STATIC_TECH_STACK_ITEMS,
  localizeTechStackItem(STELLARIS_TECH_STACK_ITEM, locale),
  localizeTechStackItem(MINECRAFT_TECH_STACK_ITEM, locale)
];

const getTechStackDetails = (locale: Locale): TechExperienceEntry[] => [
  ...baseTechStackDetails.map((entry) => localizeTechExperience(entry, locale)),
  localizeTechExperience(normalizeTechExperience(STELLARIS_TECH_STACK_EXPERIENCE_RAW), locale),
  localizeTechExperience(normalizeTechExperience(MINECRAFT_TECH_STACK_EXPERIENCE_RAW), locale)
];

const getExperienceEntries = (locale: Locale): ExperienceEntry[] =>
  PROJECT_EXPERIENCE_ENTRIES.map((entry) => localizeExperienceEntry(entry, locale));

const en: AppDictionary = {
  metadata: {
    title: "Jack F. Portfolio",
    description: "Personal engineering portfolio and live project playground."
  },
  home: {
    breadcrumbs: {
      home: "Home",
      workspace: "Workspace overview"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "Hi, I'm Jack and this is my Software Engineering portfolio! I'm looking to begin my career as a Junior Fullstack Developer. The intent of this site is to prove my skills and abilities, and to capitalize on opportunities to network.",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "Portrait of Jack Featherstone standing under warm light.",
        },
        preset: "hero",
        caption: "Self portrait captured for the 2025 personalization refresh."
      },
      cta: {
        title: "Need proof fast?",
        actions: [
          {
            label: "Download resume",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "View experience", variant: "secondary", href: "/en/experience" },
          { label: "Book a short intro", variant: "ghost", href: "/en/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "Orientation",
        title: "Site purpose",
        description:
          "Create distinctive evidence of my abilities for fullstack development, showcasing my capabilities to job recruiters in under three clicks.",
        overview:
          "While the site began as a dedicated service to host my resume, it evolved into a central place for hosting my personal projects.",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "Skills",
        title: "Tech stack & skills",
        description:
          "",
        overview:
          "",
        items: getTechStackItems("en")
      },
      proof: {
        eyebrow: "Evidence",
        title: "Past achievements",
        description: "Relatable highlights from the past few years.",
        overview:
          "Each card focuses on a project or role that tells the story behind the skills shown above.",
        proofChips: buildProofChips("en")
      },
      roadmap: {
        eyebrow: "Roadmap",
        title: "Current projects & plans",
        description:
          "My current focus is on building some small scale projects that make a difference in my life. G.O.A.T.: Grind, Optimize, Automate, Thrive.",
        overview:
          "While it is very rewarding to optimize and automate, I also find joy in learning new skills and technologies!",
        nextSteps: [
          ...getRoadmapSteps("en"),
          "Social Networking: Find events to meet people in industry. Considering indie games conventions in NYC."
        ]
      }
    }
    ,
    footer: {
      heading: "Jack Featherstone - Software Engineering Portfolio",
      body: "Showcasing my purpose, skills, achievements, and interests!",
      email: "jfstone2000@proton.me",
      notesLabel: "Engineering notes",
      notesHref: "/en/notes",
      resumeLabel: "Resume (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025. Jack Featherstone. Built with Codex, Next.js, pnpm, and my spiritual pressure."
    }
  },
  notes: {
    index: {
      title: "Engineering notes",
      subtitle:
        "Long-form breakdowns of delivery choices, instrumentation tactics, and operating agreements behind the portfolio effort.",
      empty: "Notes are on the way."
    },
    detail: {
      backLabel: "Back to notes",
      tocLabel: "On this page"
    }
  },
  experience: {
    metadataTitle: "Jack F. Experience",
    title: "Experience",
    subtitle: "Major interactions that have defined my current skill set.",
    section1title: "Projects",
    section1subtitle: "Important projects and roles that have shaped my current skills.",
    section2title: "Tech stack",
    section2subtitle: "Relevant experience with each technology.",
    entries: getExperienceEntries("en"),
    techStack: getTechStackDetails("en")
  },
  meetings: {
    metadataTitle: "Jack F. Contact",
    title: "Contact",
    subtitle: "I'm open to answering any questions you may have, in any format that works for you.",
    section1title: "Availability",
    section1subtitle: "I am commonly able to schedule a short meeting during the hours listed below.",
    intro:
      "Green areas indicate my common availability (New York time, EST/EDT). If you need another window, send an email and I will do my best to accommodate you.",
    availability: {
      alt: "Calendar snapshot showing weekly availability with green blocks highlighting openings.",
      description: "Weekly snapshot of common availability.",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "Check the current New York time"
    },
    slots: [
      {
        title: "Portfolio walkthrough",
        description:
          "Fast skim of the site, tech stack, and anything you would like me to expand on (resume, telemetry, project management, etc.)."
      },
      {
        title: "Project deep dive",
        description:
          "Focus on a single project, such as Rollodex, Quester2000, or a mod. Discuss the tradeoffs, timelines, and lessons learned."
      },
      {
        title: "Open Q&A",
        description:
          "Need a second opinion on a tech issue or just want to chat? I am happy to help you without a formal agenda. Async may fit better for this case!"
      }
    ],
    contactLabel: "Email to confirm: jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote: "Available on multiple messaging platforms! Suggest something that works for you. You can typically expect an async reply within 24 hours."
  }
};

const ja: AppDictionary = {
  metadata: {
    title: "Jack F. ポートフォリオ",
    description: "エンジニアリングの成果と実験を公開するプロジェクトハブ。"
  },
  home: {
    breadcrumbs: {
      home: "ホーム",
      workspace: "ワークスペース概要"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "はじめまして、Jack と申します。こちらは私のソフトウェアエンジニアリング・ポートフォリオです。現在、ジュニア・フルスタック開発者としてキャリアを開始する機会を探しています。本サイトの目的は、私のスキルと実務能力を証拠に基づいて示し、ネットワーク構築の機会につなげることです。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "暖かな光の下に立つ Jack Featherstone のポートレート。",
        },
        preset: "hero",
        caption: "2025 年のパーソナライズ刷新に向けて撮影したセルフポートレート。"
      },
      cta: {
        title: "証跡がすぐに必要ですか？",
        actions: [
          {
            label: "履歴書をダウンロード",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "経験を見る", variant: "secondary", href: "/ja/experience" },
          { label: "短時間の面談を予約", variant: "ghost", href: "/ja/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "オリエンテーション",
        title: "サイトの目的",
        description:
          "フルスタック開発に関する私の能力を、採用担当者の方々が 3 クリック以内で把握できるよう、独自の証跡として提示します。",
        overview:
          "当初は履歴書を掲載するための専用サイトとして開始しましたが、現在は個人プロジェクトを集約して紹介する中核の場へと発展しています。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "スキル",
        title: "技術スタックとスキル",
        description:
          "",
        overview:
          "",
        items: getTechStackItems("ja")
      },
      proof: {
        eyebrow: "エビデンス",
        title: "過去の実績",
        description: "近年の主なハイライトを抜粋して掲載しています。",
        overview:
          "各カードは、上記のスキルの裏付けとなるプロジェクトや役割のストーリーに焦点を当てています。",
        proofChips: buildProofChips("ja")
      },
      roadmap: {
        eyebrow: "ロードマップ",
        title: "現在の取り組みと計画",
        description:
          "現在は、日々の生活に実際の価値をもたらす小規模プロジェクトの構築に注力しています。G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
        overview:
          "最適化や自動化は非常に有益ですが、新しい技術やスキルを学ぶ楽しさも大切にしています。",
        nextSteps: [
          ...getRoadmapSteps("ja"),
          "交流活動：業界イベントを探索し、人脈づくりを推進。NYC のインディーゲーム系イベント参加も検討。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - ソフトウェアエンジニアリング・ポートフォリオ",
      body: "私の目的、スキル、実績、関心領域を分かりやすくご紹介します。",
      email: "jfstone2000@proton.me",
      notesLabel: "エンジニアリングノート",
      notesHref: "/ja/notes",
      resumeLabel: "履歴書 (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025年。Jack Featherstone。Codex、Next.js、pnpm で構築し、霊圧を添えました。"
    }
  },
  notes: {
    index: {
      title: "エンジニアリングノート",
      subtitle:
        "ポートフォリオ施策を支えるデリバリー判断、計測手法、オペレーションの約束事を詳しく解説します。",
      empty: "ノートは近日公開予定です。"
    },
    detail: {
      backLabel: "ノート一覧に戻る",
      tocLabel: "このページの内容"
    }
  },
  experience: {
    metadataTitle: "Jack F. 経験",
    title: "経験スナップショット",
    subtitle: "スキルセットを作り上げたプロジェクトと役割を簡潔にまとめています。",
    section1title: "Projects",
    section1subtitle: "Important projects and roles that have shaped my current skills.",
    section2title: "Tech stack",
    section2subtitle: "Relevant experience with each technology.",
    entries: getExperienceEntries("ja"),
    techStack: getTechStackDetails("ja")
  },
  meetings: {
    metadataTitle: "Jack F. へのお問い合わせ",
    title: "お問い合わせ",
    subtitle:
      "ご都合のよい方法であれば、どのようなご質問にも喜んでお答えします。",
    section1title: "面談可能時間",
    section1subtitle:
      "下記の時間帯であれば、短時間のミーティングを比較的柔軟に調整できます。",
    intro:
      "緑色の部分は、私の主な空き時間を示しています（ニューヨーク時間、EST/EDT）。この時間帯以外をご希望の場合は、メールでお知らせください。可能な限り調整いたします。",
    availability: {
      alt: "週ごとの空き時間を示したカレンダーのスナップショット。緑色のブロックが空いている時間帯を示しています。",
      description: "通常の空き時間を示した週次スナップショット。",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "現在のニューヨーク時刻を確認する"
    },
    slots: [
      {
        title: "ポートフォリオの概要ご説明",
        description:
          "サイト全体や技術スタックの概要を手短にご紹介し、ご希望があれば職務経歴書、テレメトリ、プロジェクトマネジメントなど、詳しくお聞きになりたい点を深掘りします。"
      },
      {
        title: "プロジェクトの深掘り",
        description:
          "Rollodex、Quester2000、各種 MOD など、特定のプロジェクトを一つ選び、トレードオフやスケジュール、得られた知見について集中的に議論します。"
      },
      {
        title: "オープン Q&A",
        description:
          "技術的な課題についてセカンドオピニオンが欲しい場合や、ざっくばらんにお話ししたいだけの場合でも歓迎です。正式なアジェンダがなくても問題ありません。このような場合は、メールなどの非同期コミュニケーションの方が適しているかもしれません。"
      }
    ],
    contactLabel: "日程確認用メール: jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "複数のメッセージングプラットフォームに対応可能です。ご都合のよいツールをご提案ください。通常、24時間以内に非同期でご返信いたします。"
  }
};

const zh: AppDictionary = {
  metadata: {
    title: "Jack F. 作品集",
    description: "展示工程成果与实验的个人项目中枢。"
  },
  home: {
    breadcrumbs: {
      home: "首页",
      workspace: "工作区总览"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "您好，我叫 Jack。这里是我的软件工程作品集。我正寻求以初级全端开发者的身份开启职业生涯的机会。本网站旨在以可验证的证据呈现我的技能与能力，并拓展专业人脉。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "暖色灯光下站立的 Jack Featherstone 肖像。",
        },
        preset: "hero",
        caption: "为 2025 年个性化焕新拍摄的自画像。"
      },
      cta: {
        title: "需要立即取得证据吗？",
        actions: [
          {
            label: "下载履历",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "查看经历", variant: "secondary", href: "/zh/experience" },
          { label: "预约简短介绍会谈", variant: "ghost", href: "/zh/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "导览",
        title: "网站宗旨",
        description:
          "以独特且可验证的证据呈现我在全端开发方面的能力，使招聘方能在三次点击内快速掌握重点。",
        overview:
          "本网站起初作为履历托管之用，现已发展为集中呈现我个人项目的核心平台。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "技能",
        title: "技术栈与技能",
        description:
          "",
        overview:
          "",
        items: getTechStackItems("zh")
      },
      proof: {
        eyebrow: "证据",
        title: "过往成就",
        description: "选取近年具有代表性的亮点。",
        overview:
          "每张卡片均聚焦于能够展现上述技能背景的项目或角色。",
        proofChips: buildProofChips("zh")
      },
      roadmap: {
        eyebrow: "路线图",
        title: "目前的项目与规划",
        description:
          "目前专注于构建能为我日常带来实际价值的小型项目。G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
        overview:
          "尽管优化与自动化成效显著，我同样享受学习新技术与新技能的过程。",
        nextSteps: [
          ...getRoadmapSteps("zh"),
          "社交网络：寻找行业交流活动并拓展人脉，考虑参加纽约市的独立游戏展会。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - 软件工程作品集",
      body: "清晰呈现我的目标、技能、成果与兴趣。",
      email: "jfstone2000@proton.me",
      notesLabel: "工程笔记",
      notesHref: "/zh/notes",
      resumeLabel: "履历 (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025 年。Jack Featherstone。以 Codex、Next.js、pnpm 构建，并注入灵压。"
    }
  },
  notes: {
    index: {
      title: "工程笔记",
      subtitle:
        "延伸说明本作品集背后的交付决策、监测手法，以及合作共识。",
      empty: "笔记即将发布。"
    },
    detail: {
      backLabel: "返回笔记",
      tocLabel: "页面导览"
    }
  },
  experience: {
    metadataTitle: "Jack F. 经验",
    title: "经验速览",
    subtitle: "快速了解塑造我技能组合的项目与职责。",
    section1title: "Projects",
    section1subtitle: "Important projects and roles that have shaped my current skills.",
    section2title: "Tech stack",
    section2subtitle: "Relevant experience with each technology.",
    entries: getExperienceEntries("zh"),
    techStack: getTechStackDetails("zh")
  },
  meetings: {
    metadataTitle: "Jack F. 联系",
    title: "联系",
    subtitle:
      "欢迎通过适合您的任何方式联系我，我很乐意回答您的任何问题。",
    section1title: "可会面时间",
    section1subtitle:
      "我通常可以在下列时间段安排一次简短的会面。",
    intro:
      "绿色区域表示我常见的可用时间（纽约时间，EST/EDT）。如果您需要其他时间段，请发邮件告诉我，我会尽量配合安排。",
    availability: {
      alt: "显示每周可用时间的日历快照，绿色方块标出可约时间。",
      description: "常见可用时间的每周快照。",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "查看当前纽约时间"
    },
    slots: [
      {
        title: "作品集导览",
        description:
          "一起快速浏览网站、技术栈，以及您希望我重点展开介绍的部分（简历、数据/遥测、项目管理等）。"
      },
      {
        title: "项目深度交流",
        description:
          "围绕某一个项目深入讨论，例如 Rollodex、Quester2000，或某个 Mod，一起聊聊权衡取舍、时间安排以及从中获得的经验和反思。"
      },
      {
        title: "开放式问答",
        description:
          "在技术问题上需要第二个意见，或者只是想随便聊聊？即使没有正式议程，我也很乐意帮忙。对于这种场景，异步沟通可能会更合适！"
      }
    ],
    contactLabel: "确认请发邮件至：jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "我也使用多个消息平台，欢迎提出对您最方便的工具。一般情况下，您可以在 24 小时内收到异步回复。"
  }
};

const dictionaries: Record<Locale, AppDictionary> = {
  en,
  ja,
  zh
};

export function getDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale];
}
