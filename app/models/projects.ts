export interface Project {
  id: number;
  name: string;
  shortcode: string | null;
  short: string;
  role: string | null;
  position: string | null;
  extended: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  skills: ProjectSkillEntry[];
  preview_skills: ProjectSkillEntry[];
  categories: ProjectCategoryEntry[];
  job: ProjectJobEntry | null;
  links: ProjectLink[];
  gallery: ProjectGalleryItem[];
  date_range: string | null;
  href: string;
  job_href: string;
}

export interface ProjectJobCompanyEntry {
  id: number;
  name: string;
  shortcode?: string | null;
  website?: string | null;
}

export interface ProjectJobRoleEntry {
  id: number;
  title: string;
  short_summary?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  priority: number;
  is_current: boolean;
}

export interface ProjectJobImpactEntry {
  id: number;
  description: string;
  priority: number;
}

export interface ProjectJobEntry {
  relation_id: number;
  relation_type: string;
  relation_priority: number;
  id: number;
  shortcode: string | null;
  summary: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  company: ProjectJobCompanyEntry | null;
  roles: ProjectJobRoleEntry[];
  impacts: ProjectJobImpactEntry[];
}

export interface ProjectLink {
  id: number;
  website: string;
  url: string;
  priority: number;
}

export interface ProjectGalleryItem {
  id: number;
  title: string;
  image: string;
  priority: number;
}

export interface ProjectSkillEntry {
  id: number;
  priority: number;
  name: string;
  desc: string;
  rating: number;
}

export interface ProjectCategoryEntry {
  id: number;
  priority: number;
  title: string;
  shortcode: string;
}

export interface ProjectDetail extends Project {
}

export type ProjectTransformerInput = {
  id: number;
  name: string;
  shortcode?: string | null;
  short: string;
  role: string | null;
  position: string | null;
  extended: string | null;
  start_date: Date | string | null;
  end_date: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  skills: Array<{
    priority: number;
    skill: {
      id: number;
      name: string;
      desc: string;
      rating: number;
    };
  }>;
  categories: Array<{
    priority: number;
    category: {
      id: number;
      title: string;
      shortcode: string;
    };
  }>;
  job?: Array<{
    id: number;
    relation_type: string;
    priority: number;
    job: {
      id: number;
      shortcode: string | null;
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
    };
  }>;
  links?: Array<{
    id: number;
    website: string;
    url: string;
    priority: number;
  }>;
  gallery?: Array<{
    id: number;
    title: string;
    image: string;
    priority: number;
  }>;
};
