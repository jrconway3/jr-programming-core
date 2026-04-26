import type { Project } from "./projects";

export type HomeProjectStatsEntry = {
  start_date?: string | null;
  position?: string | null;
  name: string;
  short: string;
  role?: string | null;
  categories?: Array<{ category: { shortcode: string } }> | null;
};

export type HomePageMetrics = {
  yearsExperience: number;
  totalProjectsDelivered: number;
  automationFocusedProjects: number;
  portfolioProjects: number;
  displayedCompanies: string[];
};

export type HomePageProps = {
  featuredProjects: Project[];
  yearsExperience: number;
  totalProjectsDelivered: number;
  automationFocusedProjects: number;
  portfolioProjects: number;
  displayedCompanies: string[];
};
