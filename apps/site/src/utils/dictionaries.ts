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
import type { ContrastPreference } from "./contrast";
import type { ThemePreference } from "./theme";

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

export type TechExperienceEntry = {
  id: string;
  title: string;
  context: string;
  summary: string;
  highlights: string[];
};

export type LocalizedTechExperienceEntry = {
  id: string;
  title: LocalizedStringMap | string;
  context: Partial<Record<Locale, string>>;
  summary: Partial<Record<Locale, string>>;
  highlights: Partial<Record<Locale, string[]>>;
};

export type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  timeframe: string;
  summary: string;
  highlights: string[];
};

export type LocalizedExperienceEntry = {
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
  themeToggle: {
    label: string;
    cycleLabel: string;
    pickerLabel: string;
    pickerOptions: {
      dreamland: string;
    };
    options: Record<ThemePreference, string>;
  };
  contrastToggle: {
    label: string;
    cycleLabel: string;
    options: Record<ContrastPreference, string>;
  };
  skimToggle: {
    buttonLabelOn: string;
    buttonLabelOff: string;
    statusOn: string;
    statusOff: string;
    ariaEnable: string;
    ariaDisable: string;
  };
  chatbot: {
    launcherLabel: string;
    panelTitle: string;
    panelSubtitle: string;
    inputPlaceholder: string;
    exampleQuestions: string[];
    emptyState: string;
    loggingNotice: string;
    errorMessage: string;
    fallbackCtaLabel: string;
    captchaTitle: string;
    captchaPrompt: string;
    captchaServiceUnavailable: string;
    captchaValidationFailed: string;
    rateLimitTitle: string;
    rateLimitMessage: string;
    rateLimitTryAfter: string;
    thinkingLabel: string;
    moderationTitle: string;
    moderationBody: string;
    closeLabel: string;
    referencesLabel: string;
    contextFactsLabel: string;
    resizeLabel: string;
    resizeAriaLabel: string;
    moderationImageAlt: string;
    sendLabel: string;
  };
  shell: {
    breadcrumbsLabel: string;
    anchorNavLabel: string;
    returnToTopLabel: string;
    expandAllLabel: string;
    collapseAllLabel: string;
    menuTitle: string;
    menuOpenLabel: string;
    menuCloseLabel: string;
    menuPanelLabel: string;
    menuCloseButtonLabel: string;
  };
  home: {
    breadcrumbs: {
      home: string;
      workspace: string;
    };
    skim: {
      columnTitle: string;
      projectManagementLabel: string;
      projectManagement: string;
      techStackTitle: string;
      leadershipLabel: string;
      leadership: string;
      leadershipRollodexLinkText: string;
      leadershipRollodexSuffix: string;
      leadershipTeachingAssistantLinkText: string;
      leadershipTeachingAssistantSuffix: string;
      workAuthLabel: string;
      workAuthorization: string;
      timezoneLabel: string;
      timezoneLinkText: string;
      timezone: string;
      availabilityLabel: string;
      availability: string;
      emailLabel: string;
      emailValue: string;
      emailHref: string;
    };
    audioPlayer: {
      title: string;
      description: string;
      src: string;
      fallbackSrc?: string;
      playLabel: string;
      pauseLabel: string;
      downloadLabel: string;
      closeLabel: string;
      reopenLabel: string;
      volumeLabel: string;
      volumeShowLabel: string;
      volumeHideLabel: string;
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
        carousel: {
          label: string;
          previousLabel: string;
          nextLabel: string;
        };
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
      body: string;
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
    section2empty: string;
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
      timezoneSearchPlaceholder: string;
      timezoneSearchLabel: string;
      timezonePickerPinnedLabel: string;
      timezonePickerAllLabel: string;
      timezonePickerSelectedLabel: string;
      timezonePickerNoMatchesLabel: string;
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
  src: "/media/hero/portrait1.png",
  width: 1536,
  height: 1024,
  blurDataURL:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAB8UlEQVR42gXBu27TUBgAYP/n4tjOzXYSmrSJGohacRM0QwUIVQwIFnaGDrwYA2/A1AkWBkRoFYYKQalKQEnVlCR2LrbjHDvnwvfBbuu1lckahqE0jaXJWogkFaAhAADQ8lY+b+gIaYB0UFQpIHduvaKECCkpgWTNVgkr6qLlSNBkf0EX6RxnihlcXSsRMj8IB2QcnyNQIft3w2mVis2aYT+/nX34uIFNI7r03x+99Xqj75n2NLzAy7GXhlhRX6z7is9Y0hvMzzV2+vLAvUCq0/3Iau7gx8nV8YcgM50HnloGCmnkrpmaBokFdgygZGabwEZdu+xe/u52useTfG1YLu9VLSoDaaGlUNi1qwHPP6onKY+37ZXjAIB4cG/ny5+0IP1Imm+euKk3zBFsyQSIjt1sQXJeRCtZ3Ir8QLBV1YydzZ2ht5oJ7IXoYH932xqNl96UhaFKUYmwIg2xTKzZwBCxUEaz/eJszCU1Dp9WDp9V350wt3U/nyz01bqGlsiL5V8/Cey9CaqPghTHCxn7g4g2GhVteFoPvxbk5NvYsjdvjmLqTRFuFiwzo7HIJ3zKuUoF/LoOR/OonZt++nzWv541K/TnVZRb+53eBpcC9jccy6QAUuPKIGDpRGVtyGYLPArnUcK1rZIuQS1YwjiOhfoPUYcTdpwKYwIAAAAASUVORK5CYII="
};

const STATIC_TECH_STACK_ITEMS: TechStackEntry[] = [
  { name: "React", href: "https://react.dev/", assetId: "react" },
  { name: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript", assetId: "javascript" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/", assetId: "typescript" },
  { name: "Codex", href: "https://openai.com/codex/", assetId: "codex" },
  { name: "Java", href: "https://dev.java/", assetId: "java" },
  { name: "C++", href: "https://en.cppreference.com/w/cpp", assetId: "cpp" },
  { name: "PostgreSQL", href: "https://www.postgresql.org/", assetId: "postgresql" },
  { name: "AWS", href: "https://aws.amazon.com/", assetId: "aws" },
  { name: "C", href: "https://en.cppreference.com/w/c", assetId: "c" },
  { name: "HTML", href: "https://html.spec.whatwg.org/multipage/", assetId: "html" },
  { name: "CSS", href: "https://www.w3.org/Style/CSS/Overview.en.html", assetId: "css" },
  { name: "Linux", href: "https://www.linuxfoundation.org/", assetId: "linux" },
  { name: "SQL", href: "https://www.iso.org/standard/63555.html", assetId: "sql" },
  { name: "JSON", href: "https://www.json.org/json-en.html", assetId: "json" },
  { name: "Bash", href: "https://www.gnu.org/software/bash/", assetId: "bash" },
  { name: "XML", href: "https://www.w3.org/XML/", assetId: "xml" },
  { name: "KVM", href: "https://www.linux-kvm.org/page/Main_Page", assetId: "kvm" },
  { name: "QEMU", href: "https://www.qemu.org/", assetId: "qemu" },
  { name: "Lua", href: "https://www.lua.org/", assetId: "lua" },
  { name: "Prisma", href: "https://www.prisma.io/", assetId: "prisma" },
  { name: "Oracle Cloud", href: "https://www.oracle.com/cloud/", assetId: "oracle-cloud" },
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
    description: "Software engineering portfolio and project tracker."
  },
  themeToggle: {
    label: "Select color theme",
    cycleLabel: "Cycle theme",
    pickerLabel: "Theme:",
    pickerOptions: {
      dreamland: "🌙 Dreamland"
    },
    options: {
      light: "Light",
      system: "System",
      dark: "Dark"
    }
  },
  contrastToggle: {
    label: "Select contrast preference",
    cycleLabel: "Cycle contrast",
    options: {
      standard: "Normal",
      system: "System",
      high: "High"
    }
  },
  skimToggle: {
    buttonLabelOn: "Skim mode",
    buttonLabelOff: "Skim mode",
    statusOn: "ON",
    statusOff: "OFF",
    ariaEnable: "Enable recruiter skim mode",
    ariaDisable: "Disable recruiter skim mode"
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
    emptyState: "Try a quick question or pick a starter prompt.",
    loggingNotice: "This chat is monitored for quality assurance.",
    errorMessage: "Something went wrong. Try again or open the resume.",
    fallbackCtaLabel: "Open resume",
    captchaTitle: "Quick human check",
    captchaPrompt: "Complete the captcha to continue.",
    captchaServiceUnavailable: "Captcha service is unavailable right now. Please try again later.",
    captchaValidationFailed: "Captcha validation failed. Please try again.",
    rateLimitTitle: "Rate limit reached",
    rateLimitMessage: "You've hit the chat limit for now.",
    rateLimitTryAfter: "Try again in about {minutes} minutes.",
    thinkingLabel: "Thinking…",
    moderationTitle: "Let's keep it professional.",
    moderationBody: "I can help with Jack's roles, skills, projects, and availability.",
    closeLabel: "Close chat",
    referencesLabel: "References",
    contextFactsLabel: "Context facts ({count})",
    resizeLabel: "Resize",
    resizeAriaLabel: "Resize chat",
    moderationImageAlt: "No Fun Allowed sign",
    sendLabel: "Send"
  },
  shell: {
    breadcrumbsLabel: "Breadcrumbs",
    anchorNavLabel: "On-page navigation",
    returnToTopLabel: "Return to top",
    expandAllLabel: "Expand all",
    collapseAllLabel: "Collapse all",
    menuTitle: "Menu",
    menuOpenLabel: "Open menu",
    menuCloseLabel: "Close menu",
    menuPanelLabel: "Navigation and display options",
    menuCloseButtonLabel: "✕"
  },
  home: {
    breadcrumbs: {
      home: "Home",
      workspace: "Workspace overview"
    },
    skim: {
      columnTitle: "AI-assisted Fullstack Engineer",
      projectManagementLabel: "Project Management",
      projectManagement:
        "Independent and AI-augmented, turning ambiguous goals into a Work Breakdown Structure with clear deliverables and documentation.",
      techStackTitle: "Primary languages & tools",
      leadershipLabel: "Leadership & mentorship",
      leadership: "Rollodex co-lead Fullstack Engineer, and Teaching Assistant for Upper-level Distributed Software Systems course.",
      leadershipRollodexLinkText: "Rollodex",
      leadershipRollodexSuffix: " co-lead Fullstack Engineer, and ",
      leadershipTeachingAssistantLinkText: "Teaching Assistant",
      leadershipTeachingAssistantSuffix: " for Upper-level Distributed Software Systems course.",
      workAuthLabel: "Work authorization",
      workAuthorization: "Authorized to work in US with valid SSN.",
      timezoneLabel: "Timezone & collaboration",
      timezoneLinkText: "See the meetings page for scheduling.",
      timezone: "Provided notice, I can meet most days between 3pm to 6pm NY time. See the meetings page for scheduling.",
      availabilityLabel: "Availability",
      availability: "Immediately available for remote part-time work. Two weeks notice required for full-time. Authorized to work in US with valid SSN.",
      emailLabel: "Email",
      emailValue: "jfstone2000@proton.me",
      emailHref: "mailto:jfstone2000@proton.me"
    },
    audioPlayer: {
      title: "Portfolio background loop",
      description: "",
      src: "/media/audio/jack_portfolio_suno.opus",
      fallbackSrc: "/media/audio/jack_portfolio_suno.mp3",
      playLabel: "Play track",
      pauseLabel: "Pause track",
      downloadLabel: "Download track",
      closeLabel: "Hide player",
      reopenLabel: "Open audio player",
      volumeLabel: "Volume",
      volumeShowLabel: "Show volume slider",
      volumeHideLabel: "Hide volume slider",
      trackId: "jack-portfolio-suno"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "Hi, I’m Jack—this is my software engineering portfolio. This site documents my skills and projects, and serves as a hub for professional connections. I’m seeking long-term fullstack roles involving AI that combine development and project management, and I’m also open to smaller contracts and collaborative work.",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "Digital artwork of Jack Featherstone exuding ki while tilling soil, farming \"tech stack\" crops.",
        },
        preset: "hero",
        caption: "I finish the rows I start; roots and duty run deep, so the crop stands."
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
          { label: "Start a conversation", variant: "ghost", href: "/en/meetings" }
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
        items: getTechStackItems("en"),
        carousel: {
          label: "Featured tech stack icons",
          previousLabel: "Show previous tech stack icons",
          nextLabel: "Show next tech stack icons"
        }
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
      body: "Digital extension of my resume, documenting skills, projects, and experience.",
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
        "A fantastic tale of how the portfolio was turned from concept to reality.",
      body:
        "This page is now a single narrative that explains how the portfolio was built, from planning and constraints through accessibility, performance, and release operations. The goal is a cohesive end-to-end write-up that focuses on decisions, tradeoffs, and what I would change next time.",
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
    subtitle: "",
    section1title: "Projects",
    section1subtitle: "Important projects and roles that have shaped my current skills.",
    section2title: "Tech stack",
    section2subtitle: "Relevant experience with each technology.",
    section2empty: "Tech stack details are coming soon.",
    entries: getExperienceEntries("en"),
    techStack: getTechStackDetails("en")
  },
  meetings: {
    metadataTitle: "Jack F. Contact",
    title: "Contact",
    subtitle: "Have questions? Let’s start a conversation.",
    section1title: "Availability",
    section1subtitle: "I am commonly able to schedule a short meeting during the hours listed below. (colored tiles)",
    intro:
      "",
    availability: {
      alt: "Interactive availability map showing weekly time blocks with recurring openings.",
      description: "Weekly snapshot of common availability.",
      legend: "",
      primaryLabel: "Converted timezone",
      referenceLabel: "Reference (New York)",
      referenceButtonLabel: "View New York reference",
      referenceDialogTitle: "Reference availability",
      referenceDialogDescription: "Compare against the original New York time blocks.",
      referenceCloseLabel: "Close reference",
      timezoneDropdownLabel: "View in another timezone",
      dropdownDescription: "",
      timezoneSearchPlaceholder: "Search timezones",
      timezoneSearchLabel: "Search timezones",
      timezonePickerPinnedLabel: "Pinned",
      timezonePickerAllLabel: "All timezones",
      timezonePickerSelectedLabel: "Selected",
      timezonePickerNoMatchesLabel: "No matches",
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
    description: "ソフトウェアエンジニアリングのポートフォリオおよびプロジェクトトラッカーです。"
  },
  themeToggle: {
    label: "カラーテーマを選択",
    cycleLabel: "テーマを切り替え",
    pickerLabel: "テーマ:",
    pickerOptions: {
      dreamland: "🌙 ドリームランド"
    },
    options: {
      light: "ライト",
      system: "システム",
      dark: "ダーク"
    }
  },
  contrastToggle: {
    label: "コントラスト設定を選択",
    cycleLabel: "コントラストを切り替え",
    options: {
      standard: "標準",
      system: "システム",
      high: "高"
    }
  },
  skimToggle: {
    buttonLabelOn: "スキムモード",
    buttonLabelOff: "スキムモード",
    statusOn: "オン",
    statusOff: "オフ",
    ariaEnable: "採用担当者向けスキムモードを有効化",
    ariaDisable: "採用担当者向けスキムモードを無効化"
  },
  chatbot: {
    launcherLabel: "採用担当AIチャットを開く",
    panelTitle: "AI 採用アシスタント",
    panelSubtitle: "Jack のスキル、プロジェクト、成果について質問してください。",
    inputPlaceholder: "React、コスト削減、リーダーシップ、またはプロジェクトについて質問してください…",
    exampleQuestions: [
      "Jack は React を使えますか？",
      "Jack は会社のコスト削減に貢献できますか？",
      "Jack にはリーダーシップ経験がありますか？"
    ],
    emptyState: "簡単な質問を試すか、スタータープロンプトを選択してください。",
    loggingNotice: "このチャットは品質保証のため監視されています。",
    errorMessage: "問題が発生しました。再試行するか、履歴書を開いてください。",
    fallbackCtaLabel: "履歴書を開く",
    captchaTitle: "簡易的な人間確認",
    captchaPrompt: "続行するにはキャプチャを完了してください。",
    captchaServiceUnavailable: "現在、キャプチャサービスを利用できません。しばらくしてからお試しください。",
    captchaValidationFailed: "キャプチャの検証に失敗しました。もう一度お試しください。",
    rateLimitTitle: "レート制限に達しました",
    rateLimitMessage: "現在、チャットの上限に達しています。",
    rateLimitTryAfter: "約 {minutes} 分後に再試行してください。",
    thinkingLabel: "考え中…",
    moderationTitle: "プロフェッショナルな内容にしましょう。",
    moderationBody: "Jack の役割、スキル、プロジェクト、稼働状況についてお手伝いできます。",
    closeLabel: "チャットを閉じる",
    referencesLabel: "参考情報",
    contextFactsLabel: "コンテキスト情報（{count}）",
    resizeLabel: "サイズ変更",
    resizeAriaLabel: "チャットのサイズを変更",
    moderationImageAlt: "「楽しみ禁止」の標識",
    sendLabel: "送信"
  },
  shell: {
    breadcrumbsLabel: "パンくずリスト",
    anchorNavLabel: "ページ内ナビゲーション",
    returnToTopLabel: "トップに戻る",
    expandAllLabel: "すべて展開",
    collapseAllLabel: "すべて折りたたむ",
    menuTitle: "メニュー",
    menuOpenLabel: "メニューを開く",
    menuCloseLabel: "メニューを閉じる",
    menuPanelLabel: "ナビゲーションと表示オプション",
    menuCloseButtonLabel: "✕"
  },
  home: {
    breadcrumbs: {
      home: "ホーム",
      workspace: "ワークスペース概要"
    },
    skim: {
      columnTitle: "AI支援フルスタックエンジニア",
      projectManagementLabel: "プロジェクト管理",
      projectManagement:
        "独立かつAI支援で、曖昧な目標を明確な成果物とドキュメントを備えたWBSに落とし込みます。",
      techStackTitle: "主な言語とツール",
      leadershipLabel: "リーダーシップとメンタリング",
      leadership: "Rollodex の共同リード・フルスタックエンジニアであり、上級分散ソフトウェアシステム講義のティーチングアシスタントも務めています。",
      leadershipRollodexLinkText: "Rollodex",
      leadershipRollodexSuffix: "の共同リード・フルスタックエンジニアであり、",
      leadershipTeachingAssistantLinkText: "ティーチングアシスタント",
      leadershipTeachingAssistantSuffix: "でもあります（上級分散ソフトウェアシステム講義）。",
      workAuthLabel: "就労資格",
      workAuthorization: "有効な SSN を持ち、米国での就労が許可されています。",
      timezoneLabel: "タイムゾーンと連携",
      timezoneLinkText: "日程調整はミーティングページをご覧ください。",
      timezone: "事前連絡があれば、ニューヨーク時間の15時〜18時でほぼ毎日対応可能です。日程調整はミーティングページをご覧ください。",
      availabilityLabel: "稼働状況",
      availability: "リモートのパートタイムは即時対応可能です。フルタイムは2週間前通知が必要です。米国での就労資格があります（有効なSSN）。",
      emailLabel: "メール",
      emailValue: "jfstone2000@proton.me",
      emailHref: "mailto:jfstone2000@proton.me"
    },
    audioPlayer: {
      title: "ポートフォリオ背景ループ",
      description: "",
      src: "/media/audio/jack_portfolio_suno.opus",
      fallbackSrc: "/media/audio/jack_portfolio_suno.mp3",
      playLabel: "再生",
      pauseLabel: "一時停止",
      downloadLabel: "トラックをダウンロード",
      closeLabel: "プレーヤーを非表示",
      reopenLabel: "オーディオプレーヤーを開く",
      volumeLabel: "音量",
      volumeShowLabel: "音量スライダーを表示",
      volumeHideLabel: "音量スライダーを非表示",
      trackId: "jack-portfolio-suno"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "はじめまして、Jackです。こちらは私のソフトウェアエンジニアリング・ポートフォリオです。本サイトではスキルやプロジェクトを紹介し、プロフェッショナルなつながりの拠点として機能します。開発とプロジェクト管理を組み合わせたAI関連の長期的なフルスタック職を探しており、小規模な契約や協業にも前向きです。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "土を耕し「テックスタック」の作物を育てながら気を放つ Jack Featherstone のデジタルアート。",
        },
        preset: "hero",
        caption: "始めた畝は必ず仕上げる。根と責任は深く、作物はしっかり立つ。"
      },
      cta: {
        title: "すぐに実績が必要ですか？",
        actions: [
          {
            label: "履歴書をダウンロード",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "経験を見る", variant: "secondary", href: "/ja/experience" },
          { label: "会話を始める", variant: "ghost", href: "/ja/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "オリエンテーション",
        title: "サイトの目的",
        description:
          "フルスタック開発における自分の能力を示す明確な証拠を作り、3クリック以内で採用担当者に伝えることを目的としています。",
        overview:
          "本サイトは当初、履歴書を掲載する専用サービスとして始まりましたが、現在は個人プロジェクトを集約する中核的な場所へと進化しました。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "スキル",
        title: "技術スタックとスキル",
        description:
          "",
        overview:
          "",
        items: getTechStackItems("ja"),
        carousel: {
          label: "注目の技術スタックアイコン",
          previousLabel: "前の技術スタックアイコンを表示",
          nextLabel: "次の技術スタックアイコンを表示"
        }
      },
      proof: {
        eyebrow: "実績",
        title: "これまでの実績",
        description: "ここ数年の主な成果です。",
        overview:
          "",
        proofChips: buildProofChips("ja")
      },
      roadmap: {
        eyebrow: "ロードマップ",
        title: "現在のプロジェクトと計画",
        description:
          "現在は、生活に実質的な価値をもたらす小規模プロジェクトに注力しています。",
        overview:
          "G.O.A.T.：努力し、最適化し、自動化し、成長します。",
        nextSteps: [
          ...getRoadmapSteps("ja"),
          "ソーシャルネットワーキング：業界関係者と出会うイベントを探しています。NYCのインディーゲーム系イベントも検討しています。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - ソフトウェアエンジニアリング・ポートフォリオ",
      body: "スキル、プロジェクト、経験を記録した履歴書のデジタル拡張です。",
      email: "jfstone2000@proton.me",
      notesLabel: "エンジニアリングノート",
      notesHref: "/ja/notes",
      resumeLabel: "履歴書（PDF）",
      resumeHref: "/resume.pdf",
      closing: "2025年。Jack Featherstone。Codex、Next.js、pnpm、そして私の霊圧で構築しました。"
    }
  },
  notes: {
    index: {
      title: "エンジニアリングノート",
      subtitle:
        "ポートフォリオが構想から現実へと形になるまでの素晴らしい物語です。",
      body:
        "このページは、ポートフォリオ構築の過程を一続きの物語としてまとめた長文メモです。計画と制約から、アクセシビリティ、性能、運用までを通して、判断とトレードオフ、次に改善したい点を記録します。",
      empty: "ノートは準備中です。"
    },
    detail: {
      backLabel: "ノートに戻る",
      tocLabel: "このページの内容"
    }
  },
  experience: {
    metadataTitle: "Jack F. 経験",
    title: "経験",
    subtitle: "",
    section1title: "プロジェクト",
    section1subtitle: "現在のスキル形成に重要だったプロジェクトと役割を紹介します。",
    section2title: "技術スタック",
    section2subtitle: "各技術に関する関連経験を紹介します。",
    section2empty: "技術スタックの詳細は近日公開予定です。",
    entries: getExperienceEntries("ja"),
    techStack: getTechStackDetails("ja")
  },
  meetings: {
    metadataTitle: "Jack F. の連絡先",
    title: "連絡",
    subtitle:
      "ご質問がありますか？会話を始めましょう。",
    section1title: "稼働状況",
    section1subtitle:
      "以下に示す時間帯で、通常は短時間のミーティングを設定できます。（色付きタイル）",
    intro:
      "",
    availability: {
      alt: "定期的な空き時間を含む、週ごとの時間帯を示すインタラクティブな対応可能マップ。",
      description: "一般的な稼働状況の週次スナップショット。",
      legend: "",
      primaryLabel: "変換後のタイムゾーン",
      referenceLabel: "参照（ニューヨーク）",
      referenceButtonLabel: "ニューヨーク基準を表示",
      referenceDialogTitle: "参照用稼働状況",
      referenceDialogDescription: "元のニューヨーク時間帯と比較します。",
      referenceCloseLabel: "参照を閉じる",
      timezoneDropdownLabel: "別のタイムゾーンで表示",
      dropdownDescription: "",
      timezoneSearchPlaceholder: "タイムゾーンを検索",
      timezoneSearchLabel: "タイムゾーンを検索",
      timezonePickerPinnedLabel: "ピン留め",
      timezonePickerAllLabel: "すべてのタイムゾーン",
      timezonePickerSelectedLabel: "選択済み",
      timezonePickerNoMatchesLabel: "一致なし",
      windowLabelPrefix: "表示時間：",
      availableLabel: "通常対応可能",
      unavailableLabel: "通常対応不可",
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
      timezoneLabel: "現在のニューヨーク時間を確認"
    },
    slots: [
      {
        title: "ポートフォリオ概要",
        description:
          "サイトや技術スタックの簡単な紹介と、履歴書・テレメトリ・プロジェクト管理などご希望の内容を深掘りします。"
      },
      {
        title: "プロジェクト深掘り",
        description:
          "Rollodex、Quester2000、または mod など、1つのプロジェクトに集中し、トレードオフ、スケジュール、学びを議論します。"
      },
      {
        title: "オープンQ&A",
        description:
          "技術的な相談や雑談でも構いません。議題なしでお手伝いします。この場合は非同期の方が適しているかもしれません。"
      }
    ],
    contactLabel: "確認用メール：jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "複数のメッセージングプラットフォームに対応しています。ご都合のよい方法をご提案ください。通常24時間以内に非同期で返信します。"
  }
};

const zh: AppDictionary = {
  metadata: {
    title: "Jack F. 作品集",
    description: "软件工程作品集与项目跟踪器。"
  },
  themeToggle: {
    label: "选择配色主题",
    cycleLabel: "循环切换主题",
    pickerLabel: "主题:",
    pickerOptions: {
      dreamland: "🌙 梦境"
    },
    options: {
      light: "浅色",
      system: "系统",
      dark: "深色"
    }
  },
  contrastToggle: {
    label: "选择对比度偏好",
    cycleLabel: "循环切换对比度",
    options: {
      standard: "标准",
      system: "系统",
      high: "高"
    }
  },
  skimToggle: {
    buttonLabelOn: "略读模式",
    buttonLabelOff: "略读模式",
    statusOn: "开",
    statusOff: "关",
    ariaEnable: "启用招聘方略读模式",
    ariaDisable: "禁用招聘方略读模式"
  },
  chatbot: {
    launcherLabel: "打开招聘 AI 聊天",
    panelTitle: "AI 招聘助手",
    panelSubtitle: "询问 Jack 的技能、项目或影响。",
    inputPlaceholder: "询问 React、成本节省、领导力或某个项目……",
    exampleQuestions: [
      "Jack 会使用 React 吗？",
      "Jack 能帮我的公司节省成本吗？",
      "Jack 有领导经验吗？"
    ],
    emptyState: "试试一个简单问题，或选择一个起始提示。",
    loggingNotice: "此聊天将被监控以确保质量。",
    errorMessage: "出现错误。请重试或打开简历。",
    fallbackCtaLabel: "打开简历",
    captchaTitle: "快速人机验证",
    captchaPrompt: "请完成验证码以继续。",
    captchaServiceUnavailable: "验证码服务暂时不可用，请稍后再试。",
    captchaValidationFailed: "验证码验证失败，请重试。",
    rateLimitTitle: "已达到速率限制",
    rateLimitMessage: "您目前已达到聊天上限。",
    rateLimitTryAfter: "请在约 {minutes} 分钟后再试。",
    thinkingLabel: "思考中……",
    moderationTitle: "让我们保持专业。",
    moderationBody: "我可以帮助介绍 Jack 的角色、技能、项目和可用时间。",
    closeLabel: "关闭聊天",
    referencesLabel: "参考资料",
    contextFactsLabel: "上下文事实（{count}）",
    resizeLabel: "调整大小",
    resizeAriaLabel: "调整聊天大小",
    moderationImageAlt: "“禁止娱乐”标志",
    sendLabel: "发送"
  },
  shell: {
    breadcrumbsLabel: "面包屑导航",
    anchorNavLabel: "页面内导航",
    returnToTopLabel: "返回顶部",
    expandAllLabel: "全部展开",
    collapseAllLabel: "全部折叠",
    menuTitle: "菜单",
    menuOpenLabel: "打开菜单",
    menuCloseLabel: "关闭菜单",
    menuPanelLabel: "导航和显示选项",
    menuCloseButtonLabel: "✕"
  },
  home: {
    breadcrumbs: {
      home: "首页",
      workspace: "工作区概览"
    },
    skim: {
      columnTitle: "AI 辅助全栈工程师",
      projectManagementLabel: "项目管理",
      projectManagement:
        "独立并结合 AI，将模糊目标转化为具有清晰交付物和文档的工作分解结构。",
      techStackTitle: "主要语言与工具",
      leadershipLabel: "领导力与指导",
      leadership: "担任 Rollodex 联合负责人（全栈工程师），并兼任高阶分布式软件系统课程助教。",
      leadershipRollodexLinkText: "Rollodex",
      leadershipRollodexSuffix: "联合负责人（全栈工程师），并兼任",
      leadershipTeachingAssistantLinkText: "助教",
      leadershipTeachingAssistantSuffix: "（高阶分布式软件系统课程）。",
      workAuthLabel: "工作许可",
      workAuthorization: "持有有效 SSN，获准在美国工作。",
      timezoneLabel: "时区与协作",
      timezoneLinkText: "具体日程请参阅会议页面。",
      timezone: "提前告知的情况下，我大多数日期可在纽约时间 15:00–18:00 会面。请参阅会议页面安排日程。",
      availabilityLabel: "可用性",
      availability: "可立即开始远程兼职。全职需提前两周通知。持有有效 SSN，获准在美国工作。",
      emailLabel: "电子邮箱",
      emailValue: "jfstone2000@proton.me",
      emailHref: "mailto:jfstone2000@proton.me"
    },
    audioPlayer: {
      title: "作品集背景循环音轨",
      description: "",
      src: "/media/audio/jack_portfolio_suno.opus",
      fallbackSrc: "/media/audio/jack_portfolio_suno.mp3",
      playLabel: "播放",
      pauseLabel: "暂停",
      downloadLabel: "下载音轨",
      closeLabel: "隐藏播放器",
      reopenLabel: "打开音频播放器",
      volumeLabel: "音量",
      volumeShowLabel: "显示音量滑块",
      volumeHideLabel: "隐藏音量滑块",
      trackId: "jack-portfolio-suno"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "你好，我是 Jack—这是我的软件工程作品集。本网站记录了我的技能和项目，并作为职业交流的中心。我正在寻找结合开发与项目管理的、涉及 AI 的长期全栈岗位，同时也欢迎较小规模的合同和合作。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "Jack Featherstone 在耕作土壤、种植“技术栈”作物时释放气的数字艺术作品。",
        },
        preset: "hero",
        caption: "我会完成开始的每一行；根基与责任深植，因此收成稳固。"
      },
      cta: {
        title: "需要快速证明吗？",
        actions: [
          {
            label: "下载简历",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "查看经历", variant: "secondary", href: "/zh/experience" },
          { label: "开始对话", variant: "ghost", href: "/zh/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "导向",
        title: "网站宗旨",
        description:
          "为全栈开发能力提供有力证据，在不超过三次点击内向招聘方展示我的实力。",
        overview:
          "该网站最初用于托管我的简历，随后发展为集中展示个人项目的中心。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "技能",
        title: "技术栈与技能",
        description:
          "",
        overview:
          "",
        items: getTechStackItems("zh"),
        carousel: {
          label: "精选技术栈图标",
          previousLabel: "显示上一个技术栈图标",
          nextLabel: "显示下一个技术栈图标"
        }
      },
      proof: {
        eyebrow: "证据",
        title: "过往成就",
        description: "近几年的亮点成果。",
        overview:
          "",
        proofChips: buildProofChips("zh")
      },
      roadmap: {
        eyebrow: "路线图",
        title: "当前项目与计划",
        description:
          "目前我专注于构建对生活产生实际影响的小型项目。",
        overview:
          "G.O.A.T.：打磨、优化、自动化、成长。",
        nextSteps: [
          ...getRoadmapSteps("zh"),
          "社交拓展：寻找与行业人士交流的活动，考虑纽约的独立游戏大会。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - 软件工程作品集",
      body: "简历的数字化延伸，记录技能、项目与经验。",
      email: "jfstone2000@proton.me",
      notesLabel: "工程笔记",
      notesHref: "/zh/notes",
      resumeLabel: "简历（PDF）",
      resumeHref: "/resume.pdf",
      closing: "2025。Jack Featherstone。使用 Codex、Next.js、pnpm，以及我的灵压构建。"
    }
  },
  notes: {
    index: {
      title: "工程笔记",
      subtitle:
        "一段精彩的故事，讲述作品集如何从概念变为现实。",
      body:
        "这个页面现在是一篇完整的长文，按时间线讲述作品集的构建过程：从规划与约束，到可访问性、性能和发布运维。重点是记录关键决策、权衡取舍，以及下一次会改进的地方。",
      empty: "笔记即将上线。"
    },
    detail: {
      backLabel: "返回笔记",
      tocLabel: "本页内容"
    }
  },
  experience: {
    metadataTitle: "Jack F. 经历",
    title: "经历",
    subtitle: "",
    section1title: "项目",
    section1subtitle: "塑造我当前技能的重要项目与角色。",
    section2title: "技术栈",
    section2subtitle: "各项技术的相关经验。",
    section2empty: "技术栈详情即将推出。",
    entries: getExperienceEntries("zh"),
    techStack: getTechStackDetails("zh")
  },
  meetings: {
    metadataTitle: "Jack F. 的联系方式",
    title: "联系",
    subtitle:
      "有问题吗？让我们开始交流。",
    section1title: "可用性",
    section1subtitle:
      "通常可在下方所示时间段内安排简短会议。（彩色区块）",
    intro:
      "",
    availability: {
      alt: "显示每周固定空档时间的交互式可用性地图。",
      description: "常见可用时间的每周概览。",
      legend: "",
      primaryLabel: "转换后的时区",
      referenceLabel: "参考（纽约）",
      referenceButtonLabel: "查看纽约参考",
      referenceDialogTitle: "参考可用性",
      referenceDialogDescription: "与原始纽约时间段进行比较。",
      referenceCloseLabel: "关闭参考",
      timezoneDropdownLabel: "以其他时区查看",
      dropdownDescription: "",
      timezoneSearchPlaceholder: "搜索时区",
      timezoneSearchLabel: "搜索时区",
      timezonePickerPinnedLabel: "已固定",
      timezonePickerAllLabel: "所有时区",
      timezonePickerSelectedLabel: "已选择",
      timezonePickerNoMatchesLabel: "无匹配结果",
      windowLabelPrefix: "可见时间：",
      availableLabel: "通常可用",
      unavailableLabel: "通常不可用",
      noAvailabilityLabel: "无固定可用时间。",
      timeColumnLabel: "时间",
      dayLabels: {
        sun: { short: "周日", long: "星期日" },
        mon: { short: "周一", long: "星期一" },
        tue: { short: "周二", long: "星期二" },
        wed: { short: "周三", long: "星期三" },
        thu: { short: "周四", long: "星期四" },
        fri: { short: "周五", long: "星期五" },
        sat: { short: "周六", long: "星期六" }
      },
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "查看当前纽约时间"
    },
    slots: [
      {
        title: "作品集讲解",
        description:
          "快速浏览网站、技术栈，以及你希望我展开的任何内容（简历、遥测、项目管理等）。"
      },
      {
        title: "项目深度解析",
        description:
          "聚焦单个项目（如 Rollodex、Quester2000 或某个模组），讨论取舍、时间线与经验教训。"
      },
      {
        title: "自由问答",
        description:
          "需要对技术问题的第二意见，或只是想聊聊？无需正式议程，我很乐意协助。此类情况可能更适合异步沟通。"
      }
    ],
    contactLabel: "确认邮箱：jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "可通过多种消息平台联系！请提出适合你的方式。通常可在 24 小时内收到异步回复。"
  }
};

const dictionaries: Record<Locale, AppDictionary> = {
  en,
  ja,
  zh
};

export const __testables = {
  ensureLocalizedString,
  localizeStringList,
  getRoadmapStep,
  normalizeTechExperience,
  localizeTechExperience,
  localizeExperienceEntry
};

export function getDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale];
}
