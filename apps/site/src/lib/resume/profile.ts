import {
  getPublicResume,
  type PublicResume,
  PUBLIC_REGION,
  AVAILABLE_HYBRID_CITY,
  HYBRID_LABEL,
  DEFAULT_COUNTRY
} from "./public";

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

function mapRoles(resume: PublicResume): ResumeRoleSummary[] {
  return resume.experience.map((experience) => ({
    role: experience.role,
    company: experience.company,
    startDate: experience.start,
    endDate: experience.end,
    highlights: experience.highlights,
    location: experience.location
  }));
}

function buildProfile(): ResumeProfile {
  const resume = getPublicResume();

  return {
    name: resume.profile.name,
    headline: resume.profile.headline,
    summary: resume.profile.summary,
    description: resume.profile.description,
    resumeVersion: resume.version,
    sameAs: resume.profile.sameAs,
    languages: resume.profile.languages,
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
    roles: mapRoles(resume)
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
