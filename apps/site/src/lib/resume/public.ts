import resumeSource from "../../../../../content/resume.json";

export const PUBLIC_REGION = "Upstate New York";
export const AVAILABLE_HYBRID_CITY = "New York City";
export const HYBRID_LABEL = "Hybrid";
export const DEFAULT_COUNTRY = "US";
export const REQUIRED_SAME_AS = [
  "https://github.com/jrfeathe",
  "https://linkedin.com/in/jrfeathe",
  "https://placeholder.onion"
];

type ResumeJson = typeof resumeSource;

export type PublicResumeProfile = {
  name: string;
  headline: string;
  summary: string;
  description: string;
  sameAs: string[];
  languages: string[];
  location: {
    region: string;
    countryCode: string;
    availableLocations: Array<{ name: string; availability: string }>;
  };
};

export type PublicResumeExperience = {
  role: string;
  company: string;
  start: string;
  end?: string;
  summary?: string;
  location?: string;
  highlights: string[];
  proof?: string;
};

export type PublicResumeProject = {
  name: string;
  role?: string;
  period?: string;
  stack?: string[];
  summary: string;
  highlights?: string[];
  proof?: string;
};

export type PublicResumeEducation = {
  institution: string;
  credential: string;
  status: string;
  graduation?: string;
  gpa?: number;
  notes?: string[];
  proof?: string;
};

export type PublicResume = {
  version: string;
  lastModified?: string;
  profile: PublicResumeProfile;
  summary: {
    scope?: string;
    positioning?: string;
    strengths: string[];
  };
  skills: {
    languages: ResumeJson["skills"]["languages"];
    frameworks: ResumeJson["skills"]["frameworks"];
    tools: ResumeJson["skills"]["tools"];
    spokenLanguages: string[];
  };
  domains: ResumeJson["domains"];
  experience: PublicResumeExperience[];
  projects: PublicResumeProject[];
  education: PublicResumeEducation[];
  eligibility: ResumeJson["eligibility"];
  availability: ResumeJson["availability"];
  downloads: {
    pdf: string;
    json: string;
  };
  meta?: ResumeJson["meta"];
};

function mergeSameAs(profile: ResumeJson): string[] {
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
    entry.proficiency
      ? `${entry.language} (${entry.proficiency})`
      : entry.language
  );
}

function describeSummary(profile: ResumeJson) {
  const segments = [profile.summary?.scope, profile.summary?.positioning]
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));
  return segments.join(" ");
}

function mapExperience(profile: ResumeJson): PublicResumeExperience[] {
  return (profile.experience ?? []).map((experience) => ({
    role: experience.role,
    company: experience.company,
    start: experience.start,
    ...(experience.end && experience.end !== "present"
      ? { end: experience.end }
      : {}),
    ...(experience.summary ? { summary: experience.summary } : {}),
    ...(experience.location ? { location: experience.location } : {}),
    highlights: experience.highlights ?? [],
    ...(experience.proof ? { proof: experience.proof } : {})
  }));
}

function mapProjects(profile: ResumeJson): PublicResumeProject[] {
  return (profile.projects ?? []).map((project) => ({
    name: project.name,
    ...(project.role ? { role: project.role } : {}),
    ...(project.period ? { period: project.period } : {}),
    ...(project.stack?.length ? { stack: project.stack } : {}),
    summary: project.summary,
    ...(project.highlights?.length ? { highlights: project.highlights } : {}),
    ...(project.proof ? { proof: project.proof } : {})
  }));
}

function mapEducation(profile: ResumeJson): PublicResumeEducation[] {
  return (profile.education ?? []).map((entry) => ({
    institution: entry.institution,
    credential: entry.credential,
    status: entry.status,
    ...(entry.graduation ? { graduation: entry.graduation } : {}),
    ...(typeof entry.gpa === "number" ? { gpa: entry.gpa } : {}),
    ...(entry.notes?.length ? { notes: entry.notes } : {}),
    ...(entry.proof ? { proof: entry.proof } : {})
  }));
}

function buildPublicResume(): PublicResume {
  const summary = describeSummary(resumeSource);
  const safeDescription = summary || resumeSource.summary?.scope || "";

  return {
    version: resumeSource.version,
    lastModified: resumeSource.meta?.last_modified,
    profile: {
      name: resumeSource.basics.name,
      headline: resumeSource.basics.headline,
      summary,
      description: safeDescription,
      sameAs: mergeSameAs(resumeSource),
      languages: mapLanguages(resumeSource),
      location: {
        region: PUBLIC_REGION,
        countryCode: DEFAULT_COUNTRY,
        availableLocations: [
          {
            name: AVAILABLE_HYBRID_CITY,
            availability: `${HYBRID_LABEL} availability`
          }
        ]
      }
    },
    summary: {
      scope: resumeSource.summary?.scope,
      positioning: resumeSource.summary?.positioning,
      strengths: resumeSource.summary?.strengths ?? []
    },
    skills: {
      languages: resumeSource.skills?.languages ?? [],
      frameworks: resumeSource.skills?.frameworks ?? [],
      tools: resumeSource.skills?.tools ?? [],
      spokenLanguages: mapLanguages(resumeSource)
    },
    domains: resumeSource.domains ?? [],
    experience: mapExperience(resumeSource),
    projects: mapProjects(resumeSource),
    education: mapEducation(resumeSource),
    eligibility: resumeSource.eligibility,
    availability: resumeSource.availability,
    downloads: {
      pdf: "/resume.pdf",
      json: "/resume.json"
    },
    meta: resumeSource.meta
  };
}

let cachedPublicResume: PublicResume | null = null;

export function getPublicResume(): PublicResume {
  if (cachedPublicResume) {
    return cachedPublicResume;
  }

  cachedPublicResume = buildPublicResume();
  return cachedPublicResume;
}
