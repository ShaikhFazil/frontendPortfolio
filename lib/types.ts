export type Asset = { url?: string; publicId?: string; alt?: string };

export type Social = { label: string; url: string; icon?: string };

export type Profile = {
  _id?: string;
  name: string;
  title: string;
  tagline?: string;
  summary?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
  yearsOfExperience?: number;
  avatar?: Asset;
  ogImage?: Asset;
  socials?: Social[];
  updatedAt?: string;
};

export const SKILL_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'State Management & APIs',
  'AI, LLMs & Generative AI',
  'DevOps & Tools',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Skill = {
  _id?: string;
  name: string;
  category: SkillCategory;
  level?: number;
  iconUrl?: string;
  iconPublicId?: string;
  featured?: boolean;
  order?: number;
  published?: boolean;
};

export type Experience = {
  _id?: string;
  company: string;
  role: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
  companyLogo?: Asset;
  companyUrl?: string;
  order?: number;
  published?: boolean;
};

export type Project = {
  _id?: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  category?: string;
  technologies?: string[];
  features?: string[];
  thumbnail?: Asset;
  images?: Asset[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
  year?: string;
};

export type Education = {
  _id?: string;
  institution: string;
  qualification: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
  description?: string;
  order?: number;
  published?: boolean;
};

export type Certification = {
  _id?: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  kind?: 'certification' | 'achievement';
  order?: number;
  published?: boolean;
};

export type ResumeRef = {
  url: string;
  fileName: string;
  updatedAt?: string;
} | null;

export type ResumeRecord = {
  _id: string;
  label: string;
  fileName: string;
  url: string;
  publicId: string;
  bytes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
};

export type PortfolioData = {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  resume: ResumeRef;
  /** true when the API could not be reached and bundled fallback content is shown */
  isFallback?: boolean;
};

export type DashboardStats = {
  counts: {
    projects: number;
    featuredProjects: number;
    skills: number;
    experience: number;
    education: number;
    certifications: number;
    messages: number;
    unreadMessages: number;
    resumeVersions: number;
  };
  resume: { fileName: string; url: string; updatedAt: string; active: boolean } | null;
  profileUpdatedAt: string | null;
  recent: {
    projects: { _id: string; title: string; updatedAt: string }[];
    experience: { _id: string; company: string; role: string; updatedAt: string }[];
    messages: { _id: string; name: string; subject?: string; createdAt: string; read: boolean }[];
  };
};
