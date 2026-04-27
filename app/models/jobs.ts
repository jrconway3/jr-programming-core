import type { Project, ProjectTransformerInput } from './projects';

export type Job = {
  id: number;
  shortcode: string | null;
  is_primary_tier: boolean;
  summary: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  company: {
    id: number;
    name: string;
    shortcode: string | null;
    website: string | null;
  } | null;
  roles: Array<{
    id: number;
    title: string;
    short_summary: string | null;
    start_date: string | null;
    end_date: string | null;
    priority: number;
    is_current: boolean;
  }>;
  impacts: Array<{
    id: number;
    description: string;
    priority: number;
  }>;
  keySystems: Project[];
  moreProjects: Project[];
  role_names: string[];
  primary_role: string;
  prior_roles: string[];
  date_range: string | null;
  all_projects: Project[];
};

export type JobTransformerInput = {
  id: number;
  shortcode: string | null;
  is_primary_tier: boolean;
  summary: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  priority: number;
  company: {
    id: number;
    name: string;
    shortcode: string | null;
    website: string | null;
  } | null;
  roles: Array<{
    id: number;
    title: string;
    short_summary: string | null;
    start_date: Date | string | null;
    end_date: Date | string | null;
    priority: number;
    is_current: boolean;
  }>;
  impacts: Array<{
    id: number;
    description: string;
    priority: number;
  }>;
  keySystems: Project[];
  moreProjects: Project[];
};

export type ExperiencePageDataInput = {
  projects: Project[];
  jobs: Job[];
};

export type ExperiencePageData = {
  earlierJobs: Job[];
  featuredPrimary: Project | null;
  primaryRole: string;
  priorRoles: string[];
  featuredDateRange: string | null;
  featuredOrgLabel: string;
  featuredOverview: string;
  keySystems: Array<{
    id: number;
    title: string;
    description: string;
    href: string;
  }>;
  impactItems: string[];
  href: string;
};

export type JobRow = {
  id: number;
  shortcode: string | null;
  is_primary_tier: boolean;
  summary: string | null;
  start_date: Date | null;
  end_date: Date | null;
  priority: number;
  company: {
    id: number;
    name: string;
    shortcode: string | null;
    website: string | null;
  } | null;
  roles: Array<{
    id: number;
    title: string;
    short_summary: string | null;
    start_date: Date | null;
    end_date: Date | null;
    priority: number;
    is_current: boolean;
  }>;
  impacts: Array<{
    id: number;
    description: string;
    priority: number;
  }>;
  project_relations: Array<{
    id: number;
    relation_type: string;
    priority: number;
    project: ProjectTransformerInput;
  }>;
};

export type PrismaExperienceFacade = {
  job: {
    findMany(args: unknown): Promise<JobRow[]>;
    findUnique(args: unknown): Promise<JobRow | null>;
  };
  project: {
    findFirst(args: unknown): Promise<ProjectTransformerInput | null>;
    findMany(args: unknown): Promise<ProjectTransformerInput[]>;
  };
};