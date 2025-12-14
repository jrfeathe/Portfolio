import resumeSource from "../../../../../content/resume.json";

const PUBLIC_REGION = "Upstate New York";
const AVAILABLE_HYBRID_CITY = "New York City";
const HYBRID_LABEL = "Hybrid";
const DEFAULT_COUNTRY = "US";
const REQUIRED_SAME_AS = [
  "https://github.com/jrfeathe",
  "https://linkedin.com/in/jrfeathe",
  "https://placeholder.onion"
];

type ResumeJson = (typeof resumeSource) & {
  summary?: {
    scope?: string;
    positioning?: string;
  };
  version?: string;
};

const resumeData: ResumeJson = resumeSource;

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

function mapSameAs(profile: ResumeJson): string[] {
  const resumeProfiles = profile.basics?.profiles ?? [];
  const urls = resumeProfiles
    .map((entry) => entry.url)
    .filter((url): url is string => Boolean(url));

  const merged = new Set<string>([...urls, ...REQUIRED_SAME_AS]);
  return Array.from(merged);
}

function mapLanguages(profile: ResumeJson): string[] {
  const spoken = profile.skills?.languages_spoken ?? [];
  if (!spoken.length) {
    return ["English"];
  }

  return spoken.map((entry) =>
    entry.proficiency ? `${entry.language} (${entry.proficiency})` : entry.language
  );
}

function mapRoles(resume: ResumeJson): ResumeRoleSummary[] {
  return (resume.experience ?? []).map((experience) => ({
    role: experience.role,
    company: experience.company,
    startDate: experience.start,
    endDate: experience.end,
    highlights: experience.highlights ?? [],
    location: experience.location
  }));
}

function describeSummary(profile: ResumeJson) {
  const segments = [profile.summary?.scope, profile.summary?.positioning]
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));
  return segments.join(" ");
}

function buildProfile(): ResumeProfile {
  const summary = describeSummary(resumeData);
  const fallbackSummary = resumeData.experience?.[0]?.summary ?? resumeData.basics.headline;
  const safeDescription = summary || fallbackSummary || "";
  const resumeVersion = resumeData.version ?? "v1";

  return {
    name: resumeData.basics.name,
    headline: resumeData.basics.headline,
    summary,
    description: safeDescription,
    resumeVersion,
    sameAs: mapSameAs(resumeData),
    languages: mapLanguages(resumeData),
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
    roles: mapRoles(resumeData)
  };
}

let cachedProfile: ResumeProfile | null = null;

export function getResumeProfile(): ResumeProfile {
  if (cachedProfile) {
    return cachedProfile;
  }

  cachedProfile = buildProfile();
  return cachedProfile;
}
