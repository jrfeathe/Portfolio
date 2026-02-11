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
import type { ServiceKey } from "./servicesAvailability";

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

type ContractLink = {
  label: string;
  variant: CtaVariant;
  href: string;
  serviceId?: ServiceKey;
};

type ContractsSection = {
  id: string;
  title: string;
  bullets: string[];
};

type ContractFixesPackage = {
  id: ServiceKey;
  title: string;
  tagline: string;
  bullets: string[];
  priceLine?: string;
  cta: ContractLink;
};

type ContractFixesGroup = {
  title: string;
  bullets: string[];
};

type ContractFixesScopeBlock = {
  serviceId: ServiceKey;
  title: string;
  includedTitle: string;
  included: string[];
  notIncludedTitle: string;
  notIncluded: string[];
  changePolicyTitle: string;
  changePolicy: string;
};

type ContractFixesTier = {
  title: string;
  bullets: string[];
};

type ContractFixesFaq = {
  question: string;
  answer: string;
};

type ServiceTermsSections = {
  applyTitle: string;
  applyBullets: string[];
  applyNote: string;
  scopeTitle: string;
  scopeBullets: string[];
  scopeCallout: string;
  changeOrdersTitle: string;
  changeOrdersBullets: string[];
  changeOrdersOutOfScopeIntro: string;
  changeOrdersOutOfScopeOptions: string[];
  changeOrdersPromise: string;
  schedulingTitle: string;
  schedulingBullets: string[];
  accessTitle: string;
  accessBullets: string[];
  accessNote: string;
  paymentTitle: string;
  paymentBullets: string[];
  timelinesTitle: string;
  timelinesBullets: string[];
  timelinesNote: string;
  supportTitle: string;
  supportBullets: string[];
  responsibilitiesTitle: string;
  responsibilitiesBullets: string[];
  limitationsTitle: string;
  limitationsBullets: string[];
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaButtonLabel: string;
  finalCtaButtonHref: string;
};

type ServiceTermsContent = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  subtitle: string;
  helperLine: string;
  questionCtaLabel: string;
  questionCtaHref: string;
  backLinkLabel: string;
  travelNotice: string;
  lastUpdatedLabel: string;
  sections: ServiceTermsSections;
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
    servicesPricingLabel: string;
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
      leadershipRollodexPrefix: string;
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
      metadataTitle: string;
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
  contracts: {
    metadataTitle: string;
    title: string;
    subtitle: string;
    sections: ContractsSection[];
    cta: {
      label: string;
      href: string;
      variant: CtaVariant;
    };
  };
  contractsFixes: {
    metadataTitle: string;
    title: string;
    subtitle: string;
    helperLine: string;
    termsLinkLabel: string;
    waitlistTagLabel: string;
    waitlistCtaSuffix: string;
    primaryCtas: ContractLink[];
    packagesTitle: string;
    packagesEmptyMessage: string;
    packages: ContractFixesPackage[];
    howItWorksTitle: string;
    howItWorksSteps: string[];
    commonFixesTitle: string;
    commonFixesGroups: ContractFixesGroup[];
    deliverablesTitle: string;
    deliverables: string[];
    scopeTitle: string;
    scopeSubtitle: string;
    scopeBlocks: ContractFixesScopeBlock[];
    maintenanceTitle: string;
    maintenanceTiers: ContractFixesTier[];
    maintenanceNote: string;
    faqTitle: string;
    faqItems: ContractFixesFaq[];
  };
  servicesTerms: ServiceTermsContent;
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

const CONTRACTS_QUICK_FIX_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Quick%20Fix%20Request";
const CONTRACTS_DEPLOYMENT_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Deployment%20%26%20Reliability%20Help";
const CONTRACTS_MAINTENANCE_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Monthly%20Maintenance%20Request";
const CONTRACTS_QUESTION_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Contracts%20Question";
const SERVICE_TERMS_QUESTION_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Service%20Terms%20Question";
const SERVICE_REQUEST_MAILTO =
  "mailto:jfstone2000@proton.me?subject=Service%20Request";

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
    title: "Jack Featherstone | Portfolio",
    description: "Fullstack engineer building fast distributed services. AI-assisted project management, clear documentation, and shipped projects. Available for remote work; US work authorized."
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
    panelTitle: "Portfolio Assistant",
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
    menuCloseButtonLabel: "✕",
    servicesPricingLabel: "Services & pricing"
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
        "Independent, AI-augmented planning with clear documentation and task breakdown.",
      techStackTitle: "Primary languages & tools",
      leadershipLabel: "Leadership & mentorship",
      leadership: "Rollodex co-lead Fullstack Engineer, and Teaching Assistant for Upper-level Distributed Software Systems course.",
      leadershipRollodexPrefix: "",
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
            variant: "secondary",
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
          "🐐 G.O.A.T.: Grind, Optimize, Automate, Thrive.",
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
      metadataTitle: "Jack Featherstone | Notes",
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
    metadataTitle: "Jack Featherstone | Experience",
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
  contracts: {
    metadataTitle: "Jack Featherstone | Service Terms",
    title: "Service Terms (Fixes, Deployment, and Maintenance)",
    subtitle:
      "These terms exist to keep work predictable: clear scope, clear deliverables, and no surprise creep.",
    sections: [
      {
        id: "engagement-types",
        title: "Engagement types",
        bullets: [
          "One-off Quick Fix",
          "Deployment & Reliability setup",
          "Monthly Maintenance"
        ]
      },
      {
        id: "scope-deliverables",
        title: "Scope & deliverables",
        bullets: [
          "Scope is defined in writing (email + accepted quote).",
          "Deliverables are the items listed in the quote (screenshots/notes/runbook if applicable)."
        ]
      },
      {
        id: "change-orders",
        title: "Change orders",
        bullets: [
          "Anything not listed in scope is out-of-scope.",
          "Out-of-scope items require a new fixed quote (or hourly approval) before work begins.",
          "No surprise expansions."
        ]
      },
      {
        id: "access-credentials",
        title: "Access & credentials",
        bullets: [
          "Client provides required access (hosting/DNS/CMS/repo as needed).",
          "Minimum access principle; temporary credentials preferred.",
          "Client is responsible for maintaining backups unless backup setup is included in scope."
        ]
      },
      {
        id: "payment",
        title: "Payment",
        bullets: [
          "Typical: 50% upfront / 50% on delivery for small fixed-scope jobs.",
          "Maintenance billed monthly in advance (or per the agreed schedule).",
          "Work begins after payment and access are in place."
        ]
      },
      {
        id: "timelines",
        title: "Timelines",
        bullets: [
          "Timelines are estimates based on receiving access + needed info.",
          "Quick Fix target: 2 business days after access/payment (unless otherwise stated)."
        ]
      },
      {
        id: "support-window",
        title: "Support window",
        bullets: [
          "One-off jobs include a short support window (e.g., 7 days) for issues directly related to delivered changes.",
          "Ongoing support is via Maintenance plan."
        ]
      },
      {
        id: "client-responsibilities",
        title: "Client responsibilities",
        bullets: [
          "Provide accurate requirements and timely feedback.",
          "Verify deliverables in a timely manner.",
          "Own content/legal compliance for their site."
        ]
      },
      {
        id: "limitations",
        title: "Limitations",
        bullets: [
          "No guarantee of specific SEO ranking outcomes.",
          "Performance improvements depend on platform constraints and available access.",
          "Third-party outages/services are outside control."
        ]
      }
    ],
    cta: {
      label: "Questions? Email jfstone2000@proton.me",
      href: CONTRACTS_QUESTION_MAILTO,
      variant: "primary"
    }
  },
  contractsFixes: {
    metadataTitle: "Jack Featherstone | Services",
    title:
      "Services",
    subtitle:
      "I help small businesses, creators, and small teams keep their sites fast, secure, and working.",
    helperLine:
      "Email me your URL or project link to get started. We can discuss the details in a follow up.",
    termsLinkLabel: "Terms & Conditions",
    waitlistTagLabel: "Waitlist length:",
    waitlistCtaSuffix: "Waitlist until May 2026",
    primaryCtas: [
      {
        label: "Request a Quick Fix",
        variant: "primary",
        href: CONTRACTS_QUICK_FIX_MAILTO,
        serviceId: "quickFix"
      },
      {
        label: "Request Deployment Help",
        variant: "secondary",
        href: CONTRACTS_DEPLOYMENT_MAILTO,
        serviceId: "deployment"
      },
      {
        label: "Request Maintenance",
        variant: "ghost",
        href: CONTRACTS_MAINTENANCE_MAILTO,
        serviceId: "maintenance"
      }
    ],
    packagesTitle: "Service packages",
    packagesEmptyMessage: "None currently available",
    packages: [
      {
        id: "quickFix",
        title: "Quick Fix",
        tagline: "Small, high-impact fixes done fast.",
        bullets: [
          "2 business days turnaround once scheduled (after access + payment)",
          "Up to 3–5 fixes (mobile layout, broken UI, small bugs)",
          "Before/after screenshots + short change summary",
          "One revision pass included",
          "Limited weekly slots (first-come, first-served)"
        ],
        priceLine: "Typical pricing: $99–$199",
        cta: {
          label: "Request a Quick Fix",
          variant: "primary",
          href: CONTRACTS_QUICK_FIX_MAILTO,
          serviceId: "quickFix"
        }
      },
      {
        id: "deployment",
        title: "Deployment & Reliability",
        tagline: "Make your site stable, secure, and easy to operate.",
        bullets: [
          "Domains/DNS, SSL, redirects, headers",
          "Reverse proxy (NGINX) and basic hardening",
          "CDN + caching strategy (when applicable)",
          "Health checks / uptime monitoring + a mini runbook"
        ],
        priceLine: "Typical pricing: $249–$499 (varies by stack)",
        cta: {
          label: "Request Deployment Help",
          variant: "secondary",
          href: CONTRACTS_DEPLOYMENT_MAILTO,
          serviceId: "deployment"
        }
      },
      {
        id: "maintenance",
        title: "Monthly Maintenance",
        tagline: "A dependable “call me when it breaks” plan.",
        bullets: [
          "Small changes and fixes each month",
          "Uptime checks + basic monitoring",
          "Monthly health note (what changed, what to watch)",
          "Priority scheduling compared to one-off work"
        ],
        priceLine: "Typical pricing: $49–$99/month",
        cta: {
          label: "Request Maintenance",
          variant: "ghost",
          href: CONTRACTS_MAINTENANCE_MAILTO,
          serviceId: "maintenance"
        }
      }
    ],
    howItWorksTitle: "How it works",
    howItWorksSteps: [
      "Email me your URL or project link to get started",
      "We clarify requirements, access, and success criteria",
      "I reply with a fixed-scope plan and price (usually within 24 hours)",
      "You approve + payment is handled (small jobs typically 50% upfront)",
      "I deliver the work with proof (before/after + notes)",
      "Optional: roll into monthly maintenance for ongoing stability"
    ],
    commonFixesTitle: "Common things I fix",
    commonFixesGroups: [
      {
        title: "General Fixes",
        bullets: [
          "Mobile layout glitches (overflow, spacing, broken sections)",
          "UI polish and responsive issues",
          "Bug fixes in frontend logic",
          "Broken forms, links, and redirects"
        ]
      },
      {
        title: "Performance & UX",
        bullets: [
          "Oversized images and heavy scripts",
          "Practical Lighthouse improvements where feasible",
          "Caching/compression quick wins (when hosting access allows)"
        ]
      },
      {
        title: "Deployment & Reliability",
        bullets: [
          "DNS/SSL setup and cleanup",
          "NGINX reverse proxy configuration",
          "CDN configuration and cache strategy",
          "Monitoring, basic runbooks, and safer deployments"
        ]
      }
    ],
    deliverablesTitle: "What you’ll get",
    deliverables: [
      "Before/after screenshots (and metrics when relevant)",
      "A short “what changed” summary",
      "Any setup notes needed to operate the site safely",
      "For deployments: a mini runbook (deploy/rollback, SSL notes, key settings)"
    ],
    scopeTitle: "Scope and change policy",
    scopeSubtitle: "",
    scopeBlocks: [
      {
        serviceId: "quickFix",
        title: "Quick Fix scope",
        includedTitle: "Included",
        included: [
          "Up to 5 fixes from the approved list",
          "Up to 2 pages/components touched",
          "1 revision pass",
          "Delivery in 2 business days after access + payment"
        ],
        notIncludedTitle: "Not included",
        notIncluded: [
          "Full redesigns, new pages, or new features (This is beyond a Quick Fix. Let's discuss.)",
          "Copywriting/content creation (unless explicitly quoted)",
          "Ongoing support beyond 7 days (unless on maintenance)"
        ],
        changePolicyTitle: "Change policy",
        changePolicy:
          "Anything outside the scope becomes a separate fixed quote (or hourly work in 30-minute blocks, only with your approval)."
      },
      {
        serviceId: "deployment",
        title: "Deployment & Reliability scope",
        includedTitle: "Included",
        included: [
          "Agreed deployment tasks listed in the quote (DNS/SSL/CDN/NGINX/monitoring as applicable)",
          "Deployment-blocking fixes required to make the app start and serve traffic in the target environment (up to 2 hours), with anything beyond quoted separately",
          "Timeline starts after access + kickoff; I'll confirm the start slot in writing.",
          "Setup notes + a mini runbook",
          "One verification pass after delivery"
        ],
        notIncludedTitle: "Not included",
        notIncluded: [
          "Large feature work or app rewrites",
          "Non-deployment-related bug hunts or refactors",
          "Ongoing on-call support (unless on maintenance)"
        ],
        changePolicyTitle: "Change policy",
        changePolicy:
          "Out-of-scope items are quoted separately before work starts."
      }
    ],
    maintenanceTitle: "Maintenance options",
    maintenanceTiers: [
      {
        title: "Starter",
        bullets: [
          "Small fixes/edits monthly (defined in contract or quote)",
          "Uptime checks + basic monitoring",
          "Response: typically 1–2 business days"
        ]
      },
      {
        title: "Plus",
        bullets: [
          "More monthly work capacity",
          "Faster response when possible",
          "Priority scheduling"
        ]
      }
    ],
    maintenanceNote:
      "If something breaks urgently, I can usually jump in quickly. Quoted before work begins.",
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Do you need access to my source code?",
        answer:
          "Not always. Many fixes and reliability improvements can be done via hosting/DNS/CMS settings. Deeper performance refactors may require repo access."
      },
      {
        question: "What platforms do you work with?",
        answer:
          "Common stacks are fine (custom React/Next.js, static sites, and many hosted platforms). If I’m not a fit, I’ll tell you quickly."
      },
      {
        question: "How do payments work?",
        answer:
          "For small jobs, it’s typically 50% upfront and 50% on delivery (or paid upfront for very small fixed tasks)."
      },
      {
        question: "How fast is turnaround?",
        answer:
          "Quick Fix is designed for 2 business days once access/payment is in place. Larger work depends on scope."
      },
      {
        question: "How do you handle credentials?",
        answer:
          "I request the minimum access needed. Temporary credentials are preferred when possible. I don’t need more access than the job requires."
      },
      {
        question: "What if we discover more issues?",
        answer:
          "I’ll list them clearly and quote them separately. Nothing expands silently."
      }
    ]
  },
  servicesTerms: {
    metadataTitle: "Jack Featherstone | Service Terms",
    metadataDescription:
      "Simple terms to keep projects predictable: clear scope, clear deliverables, and no surprise creep.",
    title: "Service Terms",
    subtitle:
      "Simple terms to keep projects predictable: clear scope, clear deliverables, and no surprise creep.",
    helperLine: "Questions? Email jfstone2000@proton.me",
    questionCtaLabel: "Email a question",
    questionCtaHref: SERVICE_TERMS_QUESTION_MAILTO,
    backLinkLabel: "← Back to Services",
    travelNotice:
      "Travel notice: March 18 – April 9, 2026. Responses may be delayed during this window.",
    lastUpdatedLabel: "Last updated: February 9, 2026",
    sections: {
      applyTitle: "What these terms apply to",
      applyBullets: [
        "One-off Quick Fix work",
        "Deployment & Reliability setup work",
        "Monthly Maintenance (when available / when agreed)"
      ],
      applyNote:
        "If a quote or agreement includes different terms, the quote wins for that specific job.",
      scopeTitle: "Scope and deliverables",
      scopeBullets: [
        "Scope is defined in writing (email + accepted quote).",
        "The deliverables are exactly what’s listed in the quote (e.g., fixes completed, screenshots/notes, runbook if applicable).",
        "Anything not explicitly listed is not included."
      ],
      scopeCallout: "If you want additional work, I’m happy to quote it—nothing expands silently.",
      changeOrdersTitle: "Change orders",
      changeOrdersBullets: [
        "Anything not listed in scope is out-of-scope.",
        "Out-of-scope work requires approval before it begins."
      ],
      changeOrdersOutOfScopeIntro: "Out-of-scope is handled as either:",
      changeOrdersOutOfScopeOptions: [
        "a separate fixed quote, or",
        "hourly work billed in 30-minute blocks (only with approval)"
      ],
      changeOrdersPromise: "No surprise expansions.",
      schedulingTitle: "Scheduling and communication",
      schedulingBullets: [
        "I typically reply within 1–2 business days (Eastern Time).",
        "Work begins when a start slot is confirmed and required access + payment are in place (“kickoff”).",
        "Turnaround estimates are measured in business days after kickoff, not from the first email.",
        "Weekend and evening responses may be limited."
      ],
      accessTitle: "Access and credentials",
      accessBullets: [
        "Client provides required access (hosting/DNS/CMS/repo as needed).",
        "Minimum access principle: I only request what’s necessary.",
        "Temporary credentials are preferred when possible.",
        "Client is responsible for maintaining backups unless backup setup is included in scope."
      ],
      accessNote:
        "If access cannot be provided, timelines may be delayed.",
      paymentTitle: "Payment",
      paymentBullets: [
        "For small fixed-scope jobs, typical payment is 50% upfront and 50% on delivery (unless otherwise stated).",
        "For very small tasks, payment may be requested upfront.",
        "Maintenance (when agreed) is billed monthly in advance (or per the agreed schedule).",
        "Work begins after payment and access are in place."
      ],
      timelinesTitle: "Timelines and estimates",
      timelinesBullets: [
        "Timelines are estimates based on receiving access + needed information.",
        "Quick Fix work typically targets 2 business days after kickoff, unless otherwise stated.",
        "Deployment work varies by stack and environment; the quote will state an estimate."
      ],
      timelinesNote:
        "If unexpected deployment blockers appear, they’re handled under the scope/change-order rules.",
      supportTitle: "Support window",
      supportBullets: [
        "One-off work includes a short support window (typically 7 days) for issues directly caused by delivered changes.",
        "Ongoing support is available through Maintenance (when agreed).",
        "Requests outside the support window are treated as a new quote."
      ],
      responsibilitiesTitle: "Client responsibilities",
      responsibilitiesBullets: [
        "Provide accurate requirements and timely feedback.",
        "Verify deliverables in a timely manner once delivered.",
        "Own content, legal compliance, and licensing for site materials."
      ],
      limitationsTitle: "Limitations",
      limitationsBullets: [
        "No guarantee of specific SEO rankings or business outcomes.",
        "Performance improvements depend on platform constraints and available access.",
        "Third-party outages, services, or integrations are outside my control."
      ],
      finalCtaTitle: "Ready to start?",
      finalCtaBody:
        "Email your website URL, what you want done, and any deadlines. I’ll reply with a fixed-scope plan and price.",
      finalCtaButtonLabel: "Email about services",
      finalCtaButtonHref: SERVICE_REQUEST_MAILTO
    }
  },
  meetings: {
    metadataTitle: "Jack Featherstone | Contact",
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
    title: "Jack Featherstone | ポートフォリオ",
    description: "高速な分散サービスを構築するフルスタックエンジニア。AI支援のプロジェクトマネジメント、明確なドキュメント、リリース実績。リモート勤務可／米国で就労可。"
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
    panelTitle: "ポートフォリオ・アシスタント",
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
    menuCloseButtonLabel: "✕",
    servicesPricingLabel: "サービスと料金"
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
        "独立して推進できる、AI活用の計画立案・明確なドキュメント作成・タスク分解。",
      techStackTitle: "主な言語とツール",
      leadershipLabel: "リーダーシップとメンタリング",
      leadership: "Rollodexの共同リード・フルスタックエンジニアであり、上級分散ソフトウェアシステムの講義でティーチング・アシスタント（TA）も務めています。",
      leadershipRollodexPrefix: "",
      leadershipRollodexLinkText: "Rollodex",
      leadershipRollodexSuffix: "の共同リード・フルスタックエンジニアであり、上級分散ソフトウェアシステムの講義で",
      leadershipTeachingAssistantLinkText: "ティーチング・アシスタント（TA）",
      leadershipTeachingAssistantSuffix: "も務めています。",
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
        caption: "「始めた畝は、必ず仕上げる。根と責任は深く、作物は揺るがない。」"
      },
      cta: {
        title: "すぐに実績が必要ですか？",
        actions: [
          {
            label: "履歴書をダウンロード",
            variant: "secondary",
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
          "🐐 G.O.A.T.： Grind 努力し、 Optimize 最適化し、 Automate 自動化し、 Thrive 成長します。",
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
      metadataTitle: "Jack Featherstone | エンジニアリングノート",
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
    metadataTitle: "Jack Featherstone | 経験",
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
  contracts: {
    metadataTitle: "Jack Featherstone | サービス利用条件",
    title: "サービス利用条件（迅速修正・デプロイと安定運用・月次メンテナンス）",
    subtitle:
      "これらの条件は作業を予測しやすくするためのものです。スコープと成果物を明確にし、想定外の拡大を防ぎます。",
    sections: [
      {
        id: "engagement-types",
        title: "対応範囲",
        bullets: [
          "単発の迅速修正に対応します。",
          "デプロイと安定運用のセットアップに対応します。",
          "月次メンテナンスに対応します。"
        ]
      },
      {
        id: "scope-deliverables",
        title: "スコープと成果物",
        bullets: [
          "スコープは書面（メール＋承認済み見積もり）で定義します。",
          "成果物は見積もりに記載された項目です（必要に応じてスクリーンショット/メモ/運用手順書を含みます）。"
        ]
      },
      {
        id: "change-orders",
        title: "変更対応",
        bullets: [
          "スコープに記載のない内容は対象外です。",
          "対象外の作業は着手前に新しい固定見積もり（または時間課金の承認）が必要です。",
          "想定外の追加はありません。"
        ]
      },
      {
        id: "access-credentials",
        title: "アクセスと認証情報",
        bullets: [
          "必要なアクセス（ホスティング/DNS/CMS/リポジトリなど）はクライアント側でご提供ください。",
          "最小権限の原則で、可能であれば一時的な認証情報をご用意ください。",
          "バックアップの維持はクライアントの責任です（バックアップ設定がスコープに含まれる場合を除く）。"
        ]
      },
      {
        id: "payment",
        title: "支払い",
        bullets: [
          "小規模な固定スコープの案件は、通常、着手50%・納品50%です。",
          "月次メンテナンスは月額前払い（または合意したスケジュール）で請求します。",
          "支払いとアクセスが揃ってから作業を開始します。"
        ]
      },
      {
        id: "timelines",
        title: "スケジュール",
        bullets: [
          "スケジュールはアクセスと必要情報の受領を前提とした見積もりです。",
          "迅速修正は、アクセスと支払いの完了後2営業日を目安とします（別途記載がある場合を除く）。"
        ]
      },
      {
        id: "support-window",
        title: "サポート期間",
        bullets: [
          "単発作業には、納品内容に直接関連する問題に対する短いサポート期間（例：7日）が含まれます。",
          "継続的なサポートはメンテナンスプランで提供します。"
        ]
      },
      {
        id: "client-responsibilities",
        title: "クライアントの責任",
        bullets: [
          "正確な要件と迅速なフィードバックをご提供ください。",
          "納品後は速やかにご確認ください。",
          "サイトのコンテンツと法令順守はクライアントの責任です。"
        ]
      },
      {
        id: "limitations",
        title: "制限事項",
        bullets: [
          "特定のSEO順位は保証しません。",
          "パフォーマンス改善はプラットフォームの制約とアクセス状況に左右されます。",
          "第三者の障害やサービスは管理外です。"
        ]
      }
    ],
    cta: {
      label: "ご質問は jfstone2000@proton.me までご連絡ください。",
      href: CONTRACTS_QUESTION_MAILTO,
      variant: "primary"
    }
  },
  contractsFixes: {
    metadataTitle: "Jack Featherstone | 提供サービス",
    title: "提供サービス",
    subtitle:
      "小さなビジネス、クリエイター、少人数チームのサイトを速く、安全に、そして安定稼働させるお手伝いをします。",
    helperLine:
      "開始するにはURLまたはプロジェクトリンクをメールでお送りください。詳細は追ってご相談できます。",
    termsLinkLabel: "利用規約",
    waitlistTagLabel: "ウェイトリスト人数:",
    waitlistCtaSuffix: "2026年5月までウェイトリスト",
    primaryCtas: [
      {
        label: "迅速修正を依頼する",
        variant: "primary",
        href: CONTRACTS_QUICK_FIX_MAILTO,
        serviceId: "quickFix"
      },
      {
        label: "デプロイと安定運用を依頼する",
        variant: "secondary",
        href: CONTRACTS_DEPLOYMENT_MAILTO,
        serviceId: "deployment"
      },
      {
        label: "月次メンテナンスを依頼する",
        variant: "ghost",
        href: CONTRACTS_MAINTENANCE_MAILTO,
        serviceId: "maintenance"
      }
    ],
    packagesTitle: "サービスパッケージ",
    packagesEmptyMessage: "現在は利用可能なパッケージがありません。",
    packages: [
      {
        id: "quickFix",
        title: "迅速修正",
        tagline: "小さくても効果の高い修正を迅速に行います。",
        bullets: [
          "スケジュール確定後、2営業日で対応します（アクセスと支払い完了後）。",
          "3〜5件までの修正に対応します（モバイルレイアウト、崩れたUI、小さなバグなど）。",
          "修正前後のスクリーンショットと短い変更サマリーを提供します。",
          "1回の修正対応を含みます。",
          "週あたりの枠は限られており、先着順です。"
        ],
        priceLine: "目安料金は$99–$199です。",
        cta: {
          label: "迅速修正を依頼する",
          variant: "primary",
          href: CONTRACTS_QUICK_FIX_MAILTO,
          serviceId: "quickFix"
        }
      },
      {
        id: "deployment",
        title: "デプロイと安定運用",
        tagline: "サイトを安定・安全にし、運用しやすくします。",
        bullets: [
          "ドメイン/DNS、SSL、リダイレクト、ヘッダーを設定します。",
          "リバースプロキシ（NGINX）と基本的なハードニングを行います。",
          "必要に応じてCDNとキャッシュ戦略を設定します。",
          "ヘルスチェック/稼働監視とミニ運用手順書を用意します。"
        ],
        priceLine: "目安料金は$249–$499です（スタックにより変動します）。",
        cta: {
          label: "デプロイと安定運用を依頼する",
          variant: "secondary",
          href: CONTRACTS_DEPLOYMENT_MAILTO,
          serviceId: "deployment"
        }
      },
      {
        id: "maintenance",
        title: "月次メンテナンス",
        tagline: "「壊れたら連絡する」ための安心プランです。",
        bullets: [
          "毎月の小さな変更と修正に対応します。",
          "稼働チェックと基本的な監視を行います。",
          "月次のヘルスノート（変更点と注意点）をお送りします。",
          "単発作業より優先的にスケジュールします。"
        ],
        priceLine: "目安料金は$49–$99/月です。",
        cta: {
          label: "月次メンテナンスを依頼する",
          variant: "ghost",
          href: CONTRACTS_MAINTENANCE_MAILTO,
          serviceId: "maintenance"
        }
      }
    ],
    howItWorksTitle: "ご利用の流れ",
    howItWorksSteps: [
      "開始するにはURLまたはプロジェクトリンクをメールで送ってください。",
      "要件、アクセス、成功基準を確認します。",
      "固定スコープの計画と価格をお送りします（通常24時間以内）。",
      "内容をご承認いただき、支払いを行います（小規模案件は通常着手50%）。",
      "修正前後の証跡とメモを添えて納品します。",
      "必要に応じて、月次メンテナンスに移行できます。"
    ],
    commonFixesTitle: "よくある修正内容",
    commonFixesGroups: [
      {
        title: "一般的な修正",
        bullets: [
          "モバイルレイアウトの不具合（はみ出し、余白、崩れたセクション）を修正します。",
          "UIの調整とレスポンシブの問題を改善します。",
          "フロントエンドロジックのバグを修正します。",
          "壊れたフォーム、リンク、リダイレクトを修正します。"
        ]
      },
      {
        title: "パフォーマンスとUX",
        bullets: [
          "サイズが大きすぎる画像や重いスクリプトを最適化します。",
          "可能な範囲で実用的なLighthouse改善を行います。",
          "ホスティングのアクセスがある場合、キャッシュ/圧縮の即効改善を行います。"
        ]
      },
      {
        title: "デプロイと安定運用",
        bullets: [
          "DNS/SSLの設定と整理を行います。",
          "NGINXのリバースプロキシ設定を行います。",
          "CDNの設定とキャッシュ戦略を整えます。",
          "監視、基本的な運用手順書、より安全なデプロイを整備します。"
        ]
      }
    ],
    deliverablesTitle: "納品物",
    deliverables: [
      "修正前後のスクリーンショット（該当する場合は指標も）を提供します。",
      "「何が変わったか」の短いサマリーをお渡しします。",
      "安全に運用するための設定ノートを提供します。",
      "デプロイの場合は、ミニ運用手順書（デプロイ/ロールバック、SSLメモ、主要設定）を含みます。"
    ],
    scopeTitle: "スコープと変更方針",
    scopeSubtitle: "",
    scopeBlocks: [
      {
        serviceId: "quickFix",
        title: "迅速修正のスコープ",
        includedTitle: "含まれる内容",
        included: [
          "承認済みリストから最大5件の修正に対応します。",
          "対象は最大2ページ/コンポーネントまでです。",
          "1回の修正対応を含みます。",
          "アクセスと支払い完了後、2営業日で納品します。"
        ],
        notIncludedTitle: "含まれない内容",
        notIncluded: [
          "フルリデザイン、新規ページ、または新機能は含まれません（迅速修正の範囲外のため、別途ご相談ください）。",
          "コピーライティング/コンテンツ作成は含まれません（見積もりに明記された場合を除く）。",
          "7日を超える継続サポートは含まれません（メンテナンスプランがある場合を除く）。"
        ],
        changePolicyTitle: "変更方針",
        changePolicy:
          "スコープ外は別途固定見積もり、または30分単位の時間課金（承認時のみ）として対応します。"
      },
      {
        serviceId: "deployment",
        title: "デプロイと安定運用のスコープ",
        includedTitle: "含まれる内容",
        included: [
          "見積もりに記載された合意済みのデプロイ作業（該当する場合はDNS/SSL/CDN/NGINX/監視）を実施します。",
          "対象環境でアプリが起動し配信できるようにするためのデプロイブロッカー修正は最大2時間まで含み、超える分は別途見積もりします。",
          "スケジュールはアクセスとキックオフ後に開始し、開始枠は書面で確認します。",
          "セットアップノートとミニ運用手順書を提供します。",
          "納品後に1回の確認を行います。"
        ],
        notIncludedTitle: "含まれない内容",
        notIncluded: [
          "大規模な機能開発やアプリの作り直しは含まれません。",
          "デプロイと無関係なバグ調査やリファクタリングは含まれません。",
          "オンコールの継続サポートは含まれません（メンテナンスプランがある場合を除く）。"
        ],
        changePolicyTitle: "変更方針",
        changePolicy:
          "スコープ外の項目は着手前に別途見積もりします。"
      }
    ],
    maintenanceTitle: "メンテナンスの選択肢",
    maintenanceTiers: [
      {
        title: "スターター",
        bullets: [
          "月次の小さな修正/編集（契約または見積もりで定義）を行います。",
          "稼働チェックと基本的な監視を行います。",
          "返信は通常1〜2営業日です。"
        ]
      },
      {
        title: "プラス",
        bullets: [
          "月次の対応量が増えます。",
          "可能な範囲で返信を早めます。",
          "優先的にスケジュールします。"
        ]
      }
    ],
    maintenanceNote:
      "緊急の問題が発生した場合は、通常すぐに対応できます。作業前に見積もりします。",
    faqTitle: "よくある質問",
    faqItems: [
      {
        question: "ソースコードへのアクセスは必要ですか？",
        answer:
          "必ずしも必要ではありません。多くの修正や信頼性改善はホスティング/DNS/CMSの設定で対応できます。より深いパフォーマンス改善にはリポジトリアクセスが必要な場合があります。"
      },
      {
        question: "どのプラットフォームに対応していますか？",
        answer:
          "一般的なスタックであれば対応可能です（カスタムReact/Next.js、静的サイト、多くのホスティングサービス）。適合しない場合はすぐにお伝えします。"
      },
      {
        question: "支払いはどのように行いますか？",
        answer:
          "小規模な案件は、通常、着手50%・納品50%です（非常に小さな固定作業は前払いの場合があります）。"
      },
      {
        question: "対応スピードはどのくらいですか？",
        answer:
          "迅速修正は、アクセスと支払いが揃ってから2営業日を目安にしています。規模が大きい作業はスコープにより異なります。"
      },
      {
        question: "認証情報はどのように扱いますか？",
        answer:
          "必要最小限のアクセスのみを依頼します。可能であれば一時的な認証情報を希望します。仕事に不要な権限は求めません。"
      },
      {
        question: "追加の問題が見つかった場合は？",
        answer:
          "内容を明確に整理し、別途見積もりします。想定外の拡大はありません。"
      }
    ]
  },
  servicesTerms: {
    metadataTitle: "Jack Featherstone | サービス利用条件",
    metadataDescription:
      "プロジェクトを予測しやすくするためのシンプルな条件です。スコープと成果物を明確にし、想定外の拡大を防ぎます。",
    title: "サービス利用条件",
    subtitle:
      "プロジェクトを予測しやすくするためのシンプルな条件です。スコープと成果物を明確にし、想定外の拡大を防ぎます。",
    helperLine: "ご質問は jfstone2000@proton.me までご連絡ください。",
    questionCtaLabel: "質問をメールする",
    questionCtaHref: SERVICE_TERMS_QUESTION_MAILTO,
    backLinkLabel: "← 提供サービスに戻る",
    travelNotice:
      "出張予定：2026年3月18日〜4月9日。この期間は返信が遅れる場合があります。",
    lastUpdatedLabel: "最終更新日: 2026年2月9日",
    sections: {
      applyTitle: "適用範囲",
      applyBullets: [
        "単発の迅速修正対応に適用されます。",
        "デプロイと安定運用のセットアップ作業に適用されます。",
        "月次メンテナンス（提供中・合意時）に適用されます。"
      ],
      applyNote:
        "見積もりや合意書に別条件が含まれる場合は、その案件については見積もりが優先されます。",
      scopeTitle: "スコープと成果物",
      scopeBullets: [
        "スコープは書面（メール＋承認済み見積もり）で定義します。",
        "成果物は見積もりに記載された内容そのものです（例：修正完了、スクリーンショット/メモ、必要に応じて運用手順書）。",
        "明記されていない内容は含まれません。"
      ],
      scopeCallout:
        "追加の作業をご希望の場合はお見積もりします。内容が自動的に増えることはありません。",
      changeOrdersTitle: "変更対応",
      changeOrdersBullets: [
        "スコープに記載のない内容は対象外です。",
        "対象外の作業は開始前の承認が必要です。"
      ],
      changeOrdersOutOfScopeIntro: "対象外の対応は次のいずれかです：",
      changeOrdersOutOfScopeOptions: [
        "別の固定見積もりで対応します。",
        "30分単位の時間課金で対応します（事前承認がある場合のみ）。"
      ],
      changeOrdersPromise: "想定外の追加はありません。",
      schedulingTitle: "スケジュールと連絡",
      schedulingBullets: [
        "通常、1〜2営業日以内に返信します（米国東部時間）。",
        "開始枠が確定し、必要なアクセスと支払いが揃った時点で作業を開始します（「キックオフ」）。",
        "所要日数の見積もりは、キックオフ後の営業日で計算します。初回メールからではありません。",
        "週末と夜間の返信は遅れる場合があります。"
      ],
      accessTitle: "アクセスと認証情報",
      accessBullets: [
        "必要なアクセス（ホスティング/DNS/CMS/リポジトリなど）はクライアント側でご提供ください。",
        "最小権限の原則で、必要な範囲のみをお願いしています。",
        "可能であれば一時的な認証情報をご用意ください。",
        "バックアップの維持はクライアントの責任です（バックアップ設定がスコープに含まれる場合を除く）。"
      ],
      accessNote:
        "アクセスを提供できない場合、スケジュールが遅れることがあります。",
      paymentTitle: "支払い",
      paymentBullets: [
        "小規模な固定スコープの案件は、通常、着手50%・納品50%です（別途記載がある場合を除く）。",
        "非常に小さな作業は全額前払いをお願いする場合があります。",
        "月次メンテナンス（合意時）は月額前払い（または合意したスケジュール）で請求します。",
        "支払いとアクセスが揃ってから作業を開始します。"
      ],
      timelinesTitle: "スケジュールと見積もり",
      timelinesBullets: [
        "スケジュールはアクセスと必要情報の受領を前提とした見積もりです。",
        "迅速修正は、キックオフ後2営業日を目安とします（別途記載がある場合を除く）。",
        "デプロイと安定運用の作業はスタックや環境により変動し、見積もりに記載します。"
      ],
      timelinesNote:
        "想定外のデプロイ障害が発生した場合は、スコープ/変更対応のルールに従います。",
      supportTitle: "サポート期間",
      supportBullets: [
        "単発作業には、納品内容に起因する問題に対する短いサポート期間（通常7日）が含まれます。",
        "継続的なサポートはメンテナンスプラン（合意時）で提供します。",
        "サポート期間外の依頼は新規見積もり扱いとなります。"
      ],
      responsibilitiesTitle: "クライアントの責任",
      responsibilitiesBullets: [
        "正確な要件と迅速なフィードバックをご提供ください。",
        "納品後は速やかにご確認ください。",
        "コンテンツ、法令順守、素材のライセンスはクライアントの責任です。"
      ],
      limitationsTitle: "制限事項",
      limitationsBullets: [
        "特定のSEO順位や事業成果を保証するものではありません。",
        "パフォーマンス改善はプラットフォームの制約とアクセス状況に左右されます。",
        "第三者の障害、サービス、連携は私の管理外です。"
      ],
      finalCtaTitle: "始めましょうか？",
      finalCtaBody:
        "ウェブサイトのURL、やりたいこと、期限があればお知らせください。固定スコープの計画と価格をご返信します。",
      finalCtaButtonLabel: "提供サービスについてメールする",
      finalCtaButtonHref: SERVICE_REQUEST_MAILTO
    }
  },
  meetings: {
    metadataTitle: "Jack Featherstone | 連絡先",
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
    title: "Jack Featherstone | 作品集",
    description: "全栈工程师，构建高速的分布式服务。AI 辅助项目管理、清晰文档与已交付项目。可远程工作；具备美国工作资格。"
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
    panelTitle: "作品集助手",
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
    menuCloseButtonLabel: "✕",
    servicesPricingLabel: "服务与定价"
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
        "可独立推进的 AI 辅助规划、清晰的文档整理与任务拆解。",
      techStackTitle: "主要语言与工具",
      leadershipLabel: "领导力与指导",
      leadership: "担任 Rollodex 联合技术负责人（全栈工程师），并兼任高阶分布式软件系统课程助教。",
      leadershipRollodexPrefix: "担任 ",
      leadershipRollodexLinkText: "Rollodex",
      leadershipRollodexSuffix: " 联合技术负责人（全栈工程师），并兼任高阶分布式软件系统课程",
      leadershipTeachingAssistantLinkText: "助教",
      leadershipTeachingAssistantSuffix: "。",
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
        caption: "“起垄必成行，根深责重，收成自稳。”"
      },
      cta: {
        title: "需要快速证明吗？",
        actions: [
          {
            label: "下载简历",
            variant: "secondary",
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
          "🐐 G.O.A.T.： Grind 打磨、 Optimize 优化、 Automate 自动化、 Thrive 成长。",
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
      metadataTitle: "Jack Featherstone | 工程笔记",
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
    metadataTitle: "Jack Featherstone | 经历",
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
  contracts: {
    metadataTitle: "Jack Featherstone | 服务使用条件",
    title: "服务使用条件（快速修复、部署与稳定运维、月度维护）",
    subtitle:
      "这些条款用于让工作可预测：范围清晰、交付清晰、避免范围悄然扩大。",
    sections: [
      {
        id: "engagement-types",
        title: "合作类型",
        bullets: [
          "一次性快速修复",
          "部署与稳定运维设置",
          "月度维护"
        ]
      },
      {
        id: "scope-deliverables",
        title: "范围与交付物",
        bullets: [
          "范围以书面（邮件 + 已接受报价）为准。",
          "交付物仅限于报价中列出的项目（如截图/说明/运行手册等）。"
        ]
      },
      {
        id: "change-orders",
        title: "变更需求",
        bullets: [
          "未列入范围的事项为范围外。",
          "范围外事项需在开始前重新固定报价（或按小时计费审批）。",
          "不会出现意外扩展。"
        ]
      },
      {
        id: "access-credentials",
        title: "访问与凭据",
        bullets: [
          "客户提供所需访问权限（托管/DNS/CMS/代码仓库等）。",
          "最小权限原则；优先使用临时凭据。",
          "除非范围包含备份设置，备份维护由客户负责。"
        ]
      },
      {
        id: "payment",
        title: "付款",
        bullets: [
          "小型固定范围工作通常 50% 预付 / 50% 交付。",
          "月度维护按月预付（或按约定周期）。",
          "在付款与访问到位后开始工作。"
        ]
      },
      {
        id: "timelines",
        title: "时间安排",
        bullets: [
          "时间为估算，基于收到访问权限与所需信息。",
          "快速修复目标：访问/付款到位后 2 个工作日（除非另有说明）。"
        ]
      },
      {
        id: "support-window",
        title: "支持期限",
        bullets: [
          "一次性工作包含短期支持（例如 7 天），仅覆盖交付变更直接导致的问题。",
          "持续支持通过维护方案提供。"
        ]
      },
      {
        id: "client-responsibilities",
        title: "客户责任",
        bullets: [
          "提供准确需求与及时反馈。",
          "及时验收交付成果。",
          "网站内容与合规由客户负责。"
        ]
      },
      {
        id: "limitations",
        title: "限制",
        bullets: [
          "不保证特定 SEO 排名结果。",
          "性能改进取决于平台限制与可用访问权限。",
          "第三方故障/服务不在控制范围内。"
        ]
      }
    ],
    cta: {
      label: "有问题？请发邮件至 jfstone2000@proton.me",
      href: CONTRACTS_QUESTION_MAILTO,
      variant: "primary"
    }
  },
  contractsFixes: {
    metadataTitle: "Jack Featherstone | 提供服务",
    title: "提供服务",
    subtitle:
      "我帮助小型企业、创作者和小团队让网站更快、更安全、更稳定。",
    helperLine:
      "请发送你的网址或项目链接即可开始，我们可以在后续沟通细节。",
    termsLinkLabel: "使用条款",
    waitlistTagLabel: "候补名单人数:",
    waitlistCtaSuffix: "候补名单至2026年5月",
    primaryCtas: [
      {
        label: "申请快速修复",
        variant: "primary",
        href: CONTRACTS_QUICK_FIX_MAILTO,
        serviceId: "quickFix"
      },
      {
        label: "申请部署与稳定运维",
        variant: "secondary",
        href: CONTRACTS_DEPLOYMENT_MAILTO,
        serviceId: "deployment"
      },
      {
        label: "申请月度维护",
        variant: "ghost",
        href: CONTRACTS_MAINTENANCE_MAILTO,
        serviceId: "maintenance"
      }
    ],
    packagesTitle: "服务套餐",
    packagesEmptyMessage: "目前暂无可用套餐",
    packages: [
      {
        id: "quickFix",
        title: "快速修复",
        tagline: "小而高效的快速修复。",
        bullets: [
          "排期确认后 2 个工作日内完成（访问与付款到位后）。",
          "最多 3–5 个修复（移动端布局、破损 UI、小 bug）。",
          "修复前后截图 + 简短变更说明",
          "包含 1 次修订",
          "每周名额有限（先到先得）"
        ],
        priceLine: "常见价格：$99–$199",
        cta: {
          label: "申请快速修复",
          variant: "primary",
          href: CONTRACTS_QUICK_FIX_MAILTO,
          serviceId: "quickFix"
        }
      },
      {
        id: "deployment",
        title: "部署与稳定运维",
        tagline: "让你的网站稳定、安全且易于运维。",
        bullets: [
          "域名/DNS、SSL、重定向、响应头",
          "反向代理（NGINX）与基础加固",
          "CDN + 缓存策略（如适用）",
          "健康检查/可用性监控 + 迷你运行手册"
        ],
        priceLine: "常见价格：$249–$499（视技术栈而定）",
        cta: {
          label: "申请部署与稳定运维",
          variant: "secondary",
          href: CONTRACTS_DEPLOYMENT_MAILTO,
          serviceId: "deployment"
        }
      },
      {
        id: "maintenance",
        title: "月度维护",
        tagline: "可靠的“出问题时可联系”的维护方案。",
        bullets: [
          "每月的小修改与修复",
          "可用性检查 + 基础监控",
          "月度健康说明（变更内容与关注点）",
          "相较一次性工作优先排期"
        ],
        priceLine: "常见价格：$49–$99/月",
        cta: {
          label: "申请月度维护",
          variant: "ghost",
          href: CONTRACTS_MAINTENANCE_MAILTO,
          serviceId: "maintenance"
        }
      }
    ],
    howItWorksTitle: "如何合作",
    howItWorksSteps: [
      "发送你的网址或项目链接以开始",
      "确认需求、访问权限与成功标准",
      "我会回复固定范围方案和价格（通常 24 小时内）",
      "你确认后完成付款（小型工作通常 50% 预付）",
      "交付成果并提供证据（前后对比 + 说明）",
      "可选：转为月度维护以持续稳定"
    ],
    commonFixesTitle: "常见修复内容",
    commonFixesGroups: [
      {
        title: "通用修复",
        bullets: [
          "移动端布局问题（溢出、间距、破损区块）",
          "UI 微调与响应式问题",
          "前端逻辑中的 bug",
          "损坏的表单、链接与重定向"
        ]
      },
      {
        title: "性能与体验",
        bullets: [
          "过大的图片与沉重脚本",
          "在可行范围内进行实用的 Lighthouse 改进",
          "缓存/压缩的快速优化（需托管访问权限）"
        ]
      },
      {
        title: "部署与稳定运维",
        bullets: [
          "DNS/SSL 设置与清理",
          "NGINX 反向代理配置",
          "CDN 配置与缓存策略",
          "监控、基础运行手册与更安全的部署"
        ]
      }
    ],
    deliverablesTitle: "交付物",
    deliverables: [
      "修复前后截图（必要时包含指标）",
      "简短的“变更说明”",
      "安全运维所需的配置说明",
      "部署类：迷你运行手册（部署/回滚、SSL 说明、关键设置）"
    ],
    scopeTitle: "范围与变更政策",
    scopeSubtitle: "",
    scopeBlocks: [
      {
        serviceId: "quickFix",
        title: "快速修复范围",
        includedTitle: "包含",
        included: [
          "最多 5 项来自已批准清单的修复",
          "最多涉及 2 个页面/组件",
          "包含 1 次修订",
          "访问 + 付款到位后 2 个工作日交付"
        ],
        notIncludedTitle: "不包含",
        notIncluded: [
          "完整改版、新页面或新功能（超出快速修复范围，需另行沟通）",
          "文案/内容创作（除非明确写入报价）",
          "超过 7 天的持续支持（除非有维护方案）"
        ],
        changePolicyTitle: "变更政策",
        changePolicy:
          "超出范围的内容将单独固定报价（或按 30 分钟计费，需你批准）。"
      },
      {
        serviceId: "deployment",
        title: "部署与稳定运维范围",
        includedTitle: "包含",
        included: [
          "报价中列明的部署任务（如适用：DNS/SSL/CDN/NGINX/监控）",
          "为在目标环境启动并提供服务所需的阻断问题修复（最多 2 小时），超出部分单独报价",
          "时间线从访问 + 启动（kickoff）后开始；开始时间将书面确认",
          "设置说明 + 迷你运行手册",
          "交付后 1 次验证"
        ],
        notIncludedTitle: "不包含",
        notIncluded: [
          "大型功能开发或应用重写",
          "与部署无关的排错或重构",
          "持续值守支持（除非有维护方案）"
        ],
        changePolicyTitle: "变更政策",
        changePolicy:
          "范围外事项在开始前单独报价。"
      }
    ],
    maintenanceTitle: "维护方案",
    maintenanceTiers: [
      {
        title: "入门",
        bullets: [
          "每月的小修复/编辑（在合同或报价中定义）",
          "可用性检查 + 基础监控",
          "响应时间：通常 1–2 个工作日"
        ]
      },
      {
        title: "进阶",
        bullets: [
          "更高的月度工作量",
          "在可能的情况下更快响应",
          "优先排期"
        ]
      }
    ],
    maintenanceNote:
      "如出现紧急问题，我通常可以快速介入。开始前会先报价。",
    faqTitle: "常见问题",
    faqItems: [
      {
        question: "需要访问我的源代码吗？",
        answer:
          "不一定。许多修复与可靠性优化可以通过托管/DNS/CMS 设置完成。更深度的性能重构可能需要仓库访问。"
      },
      {
        question: "你支持哪些平台？",
        answer:
          "常见技术栈都可以（自定义 React/Next.js、静态站点以及多种托管平台）。不合适会尽快告知。"
      },
      {
        question: "如何付款？",
        answer:
          "小型工作通常 50% 预付、50% 交付（极小的固定任务可能需要全额预付）。"
      },
      {
        question: "速度有多快？",
        answer:
          "快速修复设计为在访问/付款到位后 2 个工作日内完成。更大的工作取决于范围。"
      },
      {
        question: "凭据如何处理？",
        answer:
          "我只请求完成工作所需的最小权限。尽量使用临时凭据，不会要求超出任务需要的权限。"
      },
      {
        question: "如果发现更多问题？",
        answer:
          "我会明确列出并单独报价，不会悄然扩展。"
      }
    ]
  },
  servicesTerms: {
    metadataTitle: "Jack Featherstone | 服务使用条件",
    metadataDescription:
      "用于让项目可预测的简明条款：范围清晰、交付清晰、避免意外扩展。",
    title: "服务使用条件",
    subtitle:
      "用于让项目可预测的简明条款：范围清晰、交付清晰、避免意外扩展。",
    helperLine: "有问题？请发邮件至 jfstone2000@proton.me",
    questionCtaLabel: "邮件咨询",
    questionCtaHref: SERVICE_TERMS_QUESTION_MAILTO,
    backLinkLabel: "← 返回提供服务",
    travelNotice:
      "出行提醒：2026年3月18日–4月9日。此期间回复可能延迟。",
    lastUpdatedLabel: "最后更新：2026年2月9日",
    sections: {
      applyTitle: "这些条款适用于",
      applyBullets: [
        "一次性快速修复工作",
        "部署与稳定运维设置工作",
        "月度维护（如可用/经同意）"
      ],
      applyNote:
        "如报价或协议包含不同条款，则该项目以报价为准。",
      scopeTitle: "范围与交付物",
      scopeBullets: [
        "范围以书面（邮件 + 已接受报价）为准。",
        "交付物仅限于报价中列出的内容（例如：已完成的修复、截图/说明、必要时的运行手册）。",
        "未明确列出的内容不包含在内。"
      ],
      scopeCallout: "如需追加工作，我很乐意另行报价—不会悄然扩展。",
      changeOrdersTitle: "变更需求",
      changeOrdersBullets: [
        "未列入范围的事项为范围外。",
        "范围外工作须在开始前获得批准。"
      ],
      changeOrdersOutOfScopeIntro: "范围外工作将按以下方式处理：",
      changeOrdersOutOfScopeOptions: [
        "单独固定报价，或",
        "按 30 分钟计费的小时制（仅在批准后）"
      ],
      changeOrdersPromise: "不会出现意外扩展。",
      schedulingTitle: "排期与沟通",
      schedulingBullets: [
        "我通常在 1–2 个工作日内回复（美国东部时间）。",
        "确认开始档期且访问与付款到位后即开始工作（“kickoff”）。",
        "工期估算以 kickoff 后的工作日计算，而非首封邮件的时间。",
        "周末与晚间回复可能较慢。"
      ],
      accessTitle: "访问与凭据",
      accessBullets: [
        "客户提供所需访问权限（托管/DNS/CMS/代码仓库等）。",
        "最小权限原则：只请求必要权限。",
        "如可行，优先使用临时凭据。",
        "除非范围包含备份设置，备份维护由客户负责。"
      ],
      accessNote:
        "若无法提供访问权限，时间可能延后。",
      paymentTitle: "付款",
      paymentBullets: [
        "小型固定范围工作通常 50% 预付、50% 交付（除非另有说明）。",
        "非常小的任务可能需要全额预付。",
        "月度维护（经同意）按月预付（或按约定周期）。",
        "付款与访问到位后开始工作。"
      ],
      timelinesTitle: "时间与估算",
      timelinesBullets: [
        "时间为估算，基于收到访问权限与所需信息。",
        "快速修复通常在 kickoff 后 2 个工作日内完成，除非另有说明。",
        "部署与稳定运维工作因技术栈与环境而异，报价中会给出估算。"
      ],
      timelinesNote:
        "如出现意外部署阻碍，将按范围/变更规则处理。",
      supportTitle: "支持期限",
      supportBullets: [
        "一次性工作包含短期支持（通常 7 天），仅覆盖由交付变更直接导致的问题。",
        "持续支持可通过维护方案（经同意）提供。",
        "支持期外的请求将视为新的报价。"
      ],
      responsibilitiesTitle: "客户责任",
      responsibilitiesBullets: [
        "提供准确需求与及时反馈。",
        "交付后及时验收。",
        "网站内容、合规与素材授权由客户负责。"
      ],
      limitationsTitle: "限制",
      limitationsBullets: [
        "不保证特定 SEO 排名或业务结果。",
        "性能改进取决于平台限制与可用访问权限。",
        "第三方故障、服务或集成不在我控制范围内。"
      ],
      finalCtaTitle: "准备开始？",
      finalCtaBody:
        "请在邮件中说明网站 URL、需要完成的事项以及任何截止时间。我会回复固定范围方案和价格。",
      finalCtaButtonLabel: "邮件咨询服务",
      finalCtaButtonHref: SERVICE_REQUEST_MAILTO
    }
  },
  meetings: {
    metadataTitle: "Jack Featherstone | 联系方式",
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
