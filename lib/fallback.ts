import raw from '@/data/fallback.json';
import type { PortfolioData } from './types';

/**
 * Content bundled with the frontend so the public site still renders
 * (and still indexes) when the API is unreachable or not yet seeded.
 * It mirrors backend/scripts/seed-data.json. Once the backend is running,
 * everything here is replaced by live data from the dashboard.
 */
export const fallbackPortfolio: PortfolioData = {
  profile: {
    ...(raw.profile as PortfolioData['profile']),
    avatar: { url: '/imgs/fazil.png' },
  },
  skills: raw.skills as PortfolioData['skills'],
  experience: raw.experience as PortfolioData['experience'],
  projects: raw.projects as PortfolioData['projects'],
  education: raw.education as PortfolioData['education'],
  certifications: raw.certifications as PortfolioData['certifications'],
  resume: {
    url: '/imgs/FAZIL_SHAIKH_RESUME.pdf',
    fileName: 'FAZIL_SHAIKH_RESUME.pdf',
  },
  isFallback: true,
};
