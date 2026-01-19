import resumeSource from "../../../../../content/resume.json";
import { defaultLocale, type Locale } from "../../utils/i18n";

const PUBLIC_REGION = "Upstate New York";
const AVAILABLE_HYBRID_CITY = "New York City";
const HYBRID_LABEL = "Hybrid";
const DEFAULT_COUNTRY = "US";
const REQUIRED_SAME_AS = [
  "https://github.com/jrfeathe",
  "https://linkedin.com/in/jrfeathe"
];

type LocalizedString = string | Partial<Record<Locale, string>>;

type ResumeProfileLink = {
  label?: LocalizedString;
  url?: LocalizedString;
};

type ResumeBasics = {
  name?: LocalizedString;
  headline?: LocalizedString;
  profiles?: ResumeProfileLink[];
};

type ResumeLanguage = {
  language?: LocalizedString;
  proficiency?: LocalizedString;
};

type ResumeSkills = {
  languages_spoken?: ResumeLanguage[];
};

type ResumeExperience = {
  role?: LocalizedString;
  company?: LocalizedString;
  location?: LocalizedString;
  start?: LocalizedString;
  end?: LocalizedString;
  summary?: LocalizedString;
  highlights?: LocalizedString[];
};

type ResumeEducation = {
  institution?: LocalizedString;
  credential?: LocalizedString;
  status?: LocalizedString;
  graduation?: LocalizedString;
  gpa?: number;
  notes?: LocalizedString[];
};

type ResumeValueField = {
  value?: LocalizedString;
  label?: LocalizedString;
};

type ResumeAvailability = {
  start_date?: ResumeValueField;
  timezone?: {
    label?: LocalizedString;
    collaboration_window?: LocalizedString;
  };
};

type ResumeEligibility = {
  us_status?: ResumeValueField;
};

type ResumeSummary = {
  scope?: LocalizedString;
  positioning?: LocalizedString;
};

type ResumeJson = {
  basics?: ResumeBasics;
  skills?: ResumeSkills;
  education?: ResumeEducation[];
  experience?: ResumeExperience[];
  availability?: ResumeAvailability;
  eligibility?: ResumeEligibility;
  summary?: ResumeSummary;
  version?: string;
};

const resumeData = resumeSource as ResumeJson;

export type ResumeRoleSummary = {
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  location?: string;
};

export type ResumeProfile = {
  name: string;
  headline: string;
  summary: string;
  description: string;
  resumeVersion: string;
  sameAs: string[];
  languages: string[];
  location: {
    region: string;
    countryCode: string;
    availableLocations: Array<{ name: string; availability: string }>;
  };
  roles: ResumeRoleSummary[];
};

function resolveLocalized(value: LocalizedString | undefined, locale: Locale): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value[locale] ?? value[defaultLocale] ?? "";
}

function resolveLocalizedList(values: LocalizedString[] | undefined, locale: Locale): string[] {
  return (values ?? [])
    .map((entry) => resolveLocalized(entry, locale))
    .filter((entry): entry is string => Boolean(entry));
}

function mapSameAs(profile: ResumeJson, locale: Locale): string[] {
  const resumeProfiles = profile.basics?.profiles ?? [];
  const urls = resumeProfiles
    .map((entry) => resolveLocalized(entry.url, locale))
    .filter((url): url is string => Boolean(url));

  const merged = new Set<string>([...urls, ...REQUIRED_SAME_AS]);
  return Array.from(merged);
}

function mapLanguages(profile: ResumeJson, locale: Locale): string[] {
  const spoken = profile.skills?.languages_spoken ?? [];
  if (!spoken.length) {
    return ["English"];
  }

  return spoken
    .map((entry) => {
      const language = resolveLocalized(entry.language, locale);
      if (!language) {
        return null;
      }
      const proficiency = resolveLocalized(entry.proficiency, locale);
      return proficiency ? `${language} (${proficiency})` : language;
    })
    .filter((entry): entry is string => Boolean(entry));
}

function mapRoles(resume: ResumeJson, locale: Locale): ResumeRoleSummary[] {
  return (resume.experience ?? []).map((experience) => ({
    role: resolveLocalized(experience.role, locale),
    company: resolveLocalized(experience.company, locale),
    startDate: resolveLocalized(experience.start, locale),
    endDate: resolveLocalized(experience.end, locale),
    highlights: resolveLocalizedList(experience.highlights, locale),
    location: resolveLocalized(experience.location, locale)
  }));
}

function describeSummary(profile: ResumeJson, locale: Locale) {
  const segments = [
    resolveLocalized(profile.summary?.scope, locale),
    resolveLocalized(profile.summary?.positioning, locale)
  ]
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));
  return segments.join(" ");
}

function buildProfile(locale: Locale): ResumeProfile {
  const summary = describeSummary(resumeData, locale);
  const fallbackSummary =
    resolveLocalized(resumeData.experience?.[0]?.summary, locale) ||
    resolveLocalized(resumeData.basics?.headline, locale);
  const safeDescription = summary || fallbackSummary || "";
  const resumeVersion = resumeData.version ?? "v1";

  return {
    name: resolveLocalized(resumeData.basics?.name, locale),
    headline: resolveLocalized(resumeData.basics?.headline, locale),
    summary,
    description: safeDescription,
    resumeVersion,
    sameAs: mapSameAs(resumeData, locale),
    languages: mapLanguages(resumeData, locale),
    location: {
      region: PUBLIC_REGION,
      countryCode: DEFAULT_COUNTRY,
      availableLocations: [
        {
          name: AVAILABLE_HYBRID_CITY,
          availability: `${HYBRID_LABEL} availability`
        }
      ]
    },
    roles: mapRoles(resumeData, locale)
  };
}

const cachedProfiles = new Map<Locale, ResumeProfile>();

export function getResumeProfile(locale: Locale = defaultLocale): ResumeProfile {
  const cachedProfile = cachedProfiles.get(locale);
  if (cachedProfile) {
    return cachedProfile;
  }

  const profile = buildProfile(locale);
  cachedProfiles.set(locale, profile);
  return profile;
}
