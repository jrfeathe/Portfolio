import stellarisModsProjectData from "../../data/projects/stellaris-mods.json";
import minecraftModsProjectData from "../../data/projects/minecraft-mods.json";
import quester2000ProjectData from "../../data/projects/quester2000.json";
import rollodexProjectData from "../../data/projects/rollodex.json";
import ser321ProjectData from "../../data/projects/ser321-ta.json";
import portfolioProjectData from "../../data/projects/portfolio.json";
import cppGameEngineProjectData from "../../data/projects/cpp-game-engine.json";
import techStackDetailsData from "../../data/tech-stack-details.json";
import type { Weekday } from "../lib/availability";
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
  chatbot: {
    launcherLabel: string;
    panelTitle: string;
    panelSubtitle: string;
    inputPlaceholder: string;
    exampleQuestions: string[];
    inlineTitle: string;
    inlineBody: string;
    inlineCta: string;
    emptyState: string;
    loggingNotice: string;
    errorMessage: string;
    fallbackCtaLabel: string;
    captchaTitle: string;
    captchaPrompt: string;
    sendLabel: string;
  };
  home: {
    breadcrumbs: {
      home: string;
      workspace: string;
    };
    audioPlayer: {
      title: string;
      description: string;
      src: string;
      playLabel: string;
      pauseLabel: string;
      downloadLabel: string;
      closeLabel: string;
      reopenLabel: string;
      trackId: string;
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
        proofChips: Array<{ title: string; details: string; href: string }>;
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
      legend: string;
      primaryLabel: string;
      referenceLabel: string;
      referenceButtonLabel: string;
      referenceDialogTitle: string;
      referenceDialogDescription: string;
      referenceCloseLabel: string;
      timezoneDropdownLabel: string;
      dropdownDescription: string;
      windowLabelPrefix: string;
      availableLabel: string;
      unavailableLabel: string;
      noAvailabilityLabel: string;
      timeColumnLabel: string;
      dayLabels: Record<Weekday, { short: string; long: string }>;
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
  const experience = requireExperience(project, project.id);

  return {
    title: localizeString(project.names?.proofTitle, locale, fallbackTitle),
    details: localizeString(project.home?.proofDetails, locale),
    href: `/${locale}/experience#${experience.id}`
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
  requireExperience(rollodexProject, "rollodex"),
  requireExperience(quester2000Project, "quester2000"),
  requireExperience(ser321Project, "ser321-ta"),
  requireExperience(cppGameEngineProject, "cpp-game-engine"),
  requireExperience(stellarisModsProject, "stellaris-mods"),
  requireExperience(portfolioProject, "portfolio-site")
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
  buildRollodexProofChip(locale),
  buildQuesterProofChip(locale),
  buildSer321ProofChip(locale),
  buildStellarisProofChip(locale),
  //buildCppGameEngineProofChip(locale),
  //buildPortfolioProofChip(locale)
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
  chatbot: {
    launcherLabel: "Open recruiter AI chat",
    panelTitle: "AI recruiter assistant",
    panelSubtitle: "Ask about Jack's skills, projects, or impact.",
    inputPlaceholder: "Ask about React, cost savings, leadership, or a project...",
    exampleQuestions: [
      "Can Jack use React?",
      "Can Jack save my company money?",
      "Does Jack have leadership experience?"
    ],
    inlineTitle: "Ask the AI",
    inlineBody: "Get quick, grounded answers with links to this portfolio.",
    inlineCta: "Ask now",
    emptyState: "Try a quick question or pick a starter prompt.",
    loggingNotice: "This chat is monitored for quality assurance and clears after 30 days.",
    errorMessage: "Something went wrong. Try again or open the resume.",
    fallbackCtaLabel: "Open resume",
    captchaTitle: "Quick human check",
    captchaPrompt: "Enter the code below to continue (captcha required after two prompts).",
    sendLabel: "Send"
  },
  home: {
    breadcrumbs: {
      home: "Home",
      workspace: "Workspace overview"
    },
    audioPlayer: {
      title: "Portfolio background loop",
      description: "",
      src: "/media/audio/portfolio-loop.mp3",
      playLabel: "Play track",
      pauseLabel: "Pause track",
      downloadLabel: "Download track",
      closeLabel: "Hide player",
      reopenLabel: "Open audio player",
      trackId: "portfolio-loop"
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
        description: "Highlights from the past few years.",
        overview:
          "",
        proofChips: buildProofChips("en")
      },
      roadmap: {
        eyebrow: "Roadmap",
        title: "Current projects & plans",
        description:
          "My current focus is on building some small scale projects that make a difference in my life.",
        overview:
          "G.O.A.T.: Grind, Optimize, Automate, Thrive.",
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
    section1subtitle: "I am commonly able to schedule a short meeting during the hours listed below. Please let me know if you need another time, and I will try to accommodate you!",
    intro:
      "",
    availability: {
      alt: "Interactive availability map showing weekly time blocks with recurring openings.",
      description: "Weekly snapshot of common availability.",
      legend: "Green blocks highlight recurring availability.",
      primaryLabel: "Converted timezone",
      referenceLabel: "Reference (New York)",
      referenceButtonLabel: "View New York reference",
      referenceDialogTitle: "Reference availability",
      referenceDialogDescription: "Compare against the original New York time blocks.",
      referenceCloseLabel: "Close reference",
      timezoneDropdownLabel: "View in another timezone",
      dropdownDescription: "",
      windowLabelPrefix: "Visible hours:",
      availableLabel: "commonly available",
      unavailableLabel: "typically unavailable",
      noAvailabilityLabel: "No recurring availability.",
      timeColumnLabel: "Time",
      dayLabels: {
        sun: { short: "Sun", long: "Sunday" },
        mon: { short: "Mon", long: "Monday" },
        tue: { short: "Tue", long: "Tuesday" },
        wed: { short: "Wed", long: "Wednesday" },
        thu: { short: "Thu", long: "Thursday" },
        fri: { short: "Fri", long: "Friday" },
        sat: { short: "Sat", long: "Saturday" }
      },
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
  chatbot: {
    launcherLabel: "AIチャットを開く",
    panelTitle: "AIリクルーターアシスタント",
    panelSubtitle: "Jackのスキルや実績を質問できます。",
    inputPlaceholder: "Reactやコスト削減、リーダーシップなどを質問してください。",
    exampleQuestions: [
      "JackはReactを使えますか？",
      "Jackはコスト削減を手伝えますか？",
      "Jackにリーダーシップ経験はありますか？"
    ],
    inlineTitle: "AIに質問する",
    inlineBody: "ポートフォリオへのリンク付きで、素早く回答します。",
    inlineCta: "質問する",
    emptyState: "短い質問を入力するか、例を選んでください。",
    loggingNotice: "品質管理のためログを保存し、30日で削除します。",
    errorMessage: "問題が発生しました。再試行するか履歴書をご覧ください。",
    fallbackCtaLabel: "履歴書を開く",
    captchaTitle: "簡易認証",
    captchaPrompt: "コードを入力してください（3回目以降は必須です）。",
    sendLabel: "送信"
  },
  home: {
    breadcrumbs: {
      home: "ホーム",
      workspace: "ワークスペース概要"
    },
    audioPlayer: {
      title: "ポートフォリオのバックグラウンドループ",
      description: "",
      src: "/media/audio/portfolio-loop.mp3",
      playLabel: "再生",
      pauseLabel: "一時停止",
      downloadLabel: "トラックをダウンロード",
      closeLabel: "プレーヤーを隠す",
      reopenLabel: "オーディオを開く",
      trackId: "portfolio-loop"
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
          "",
        proofChips: buildProofChips("ja")
      },
      roadmap: {
        eyebrow: "ロードマップ",
        title: "現在の取り組みと計画",
        description:
          "現在は、日々の生活に実際の価値をもたらす小規模プロジェクトの構築に注力しています。",
        overview:
          "G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
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
      "下記の時間帯であれば、短時間のミーティングを比較的柔軟に調整できます。I am commonly able to schedule a short meeting during the hours listed below. Please let me know if you need another time, and I will try to accommodate you!",
    intro:
      "",
    availability: {
      alt: "週間の空き時間を示すインタラクティブなマップ。緑色のブロックが頻繁に空いている時間帯です。",
      description: "通常の空き時間を示した週次スナップショット。",
      legend: "緑のブロックが柔軟に対応できる時間帯です。",
      primaryLabel: "変換後のタイムゾーン",
      referenceLabel: "参照（ニューヨーク）",
      referenceButtonLabel: "ニューヨーク基準を見る",
      referenceDialogTitle: "参照スケジュール",
      referenceDialogDescription: "ニューヨーク時間の元データと比較できます。",
      referenceCloseLabel: "閉じる",
      timezoneDropdownLabel: "別のタイムゾーンで表示",
      dropdownDescription: "",
      windowLabelPrefix: "表示中の時間帯:",
      availableLabel: "空いている時間",
      unavailableLabel: "通常は空いていません",
      noAvailabilityLabel: "定期的な空きはありません。",
      timeColumnLabel: "時間",
      dayLabels: {
        sun: { short: "日", long: "日曜日" },
        mon: { short: "月", long: "月曜日" },
        tue: { short: "火", long: "火曜日" },
        wed: { short: "水", long: "水曜日" },
        thu: { short: "木", long: "木曜日" },
        fri: { short: "金", long: "金曜日" },
        sat: { short: "土", long: "土曜日" }
      },
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
  chatbot: {
    launcherLabel: "打开AI聊天",
    panelTitle: "AI招聘助手",
    panelSubtitle: "询问 Jack 的技能、项目或影响。",
    inputPlaceholder: "可以询问 React、成本优化、领导力或项目…",
    exampleQuestions: [
      "Jack会用React吗？",
      "Jack能帮我省钱吗？",
      "Jack有领导经验吗？"
    ],
    inlineTitle: "向AI提问",
    inlineBody: "提供带链接的快速、可信回答。",
    inlineCta: "现在提问",
    emptyState: "先输入一个问题或选择示例。",
    loggingNotice: "此聊天用于质量监控，日志会在30天后清除。",
    errorMessage: "出错了，请重试或查看简历。",
    fallbackCtaLabel: "查看简历",
    captchaTitle: "人机验证",
    captchaPrompt: "输入下面的代码继续（第3次及以后需要）。",
    sendLabel: "发送"
  },
  home: {
    breadcrumbs: {
      home: "首页",
      workspace: "工作区总览"
    },
    audioPlayer: {
      title: "作品集背景循环",
      description: "",
      src: "/media/audio/portfolio-loop.mp3",
      playLabel: "播放",
      pauseLabel: "暂停",
      downloadLabel: "下载音轨",
      closeLabel: "隐藏播放器",
      reopenLabel: "打开音频",
      trackId: "portfolio-loop"
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
          "",
        proofChips: buildProofChips("zh")
      },
      roadmap: {
        eyebrow: "路线图",
        title: "目前的项目与规划",
        description:
          "目前专注于构建能为我日常带来实际价值的小型项目。",
        overview:
          "G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
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
      "我通常可以在下列时间段安排一次简短的会面。I am commonly able to schedule a short meeting during the hours listed below. Please let me know if you need another time, and I will try to accommodate you!",
    intro:
      "",
    availability: {
      alt: "交互式图表展示每周的空档时间，绿色方块标出常见空档。",
      description: "常见可用时间的每周快照。",
      legend: "绿色区块表示我经常在线的时间段。",
      primaryLabel: "转换后的时区",
      referenceLabel: "参考（纽约）",
      referenceButtonLabel: "查看纽约参考时间",
      referenceDialogTitle: "纽约参考时间",
      referenceDialogDescription: "可与原始纽约时间块进行对比。",
      referenceCloseLabel: "关闭",
      timezoneDropdownLabel: "以其他时区查看",
      dropdownDescription: "",
      windowLabelPrefix: "显示区间：",
      availableLabel: "通常可用",
      unavailableLabel: "通常不可用",
      noAvailabilityLabel: "暂无固定空档。",
      timeColumnLabel: "时间",
      dayLabels: {
        sun: { short: "日", long: "星期日" },
        mon: { short: "一", long: "星期一" },
        tue: { short: "二", long: "星期二" },
        wed: { short: "三", long: "星期三" },
        thu: { short: "四", long: "星期四" },
        fri: { short: "五", long: "星期五" },
        sat: { short: "六", long: "星期六" }
      },
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
