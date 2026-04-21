import { useState, useEffect } from "react";

export interface Project {
  id: number;
  name: string;
  short: string;
  role?: string;
  position?: string;
  extended?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  skills?: ProjectSkillEntry[];
  categories?: ProjectCategoryEntry[];
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
  links: ProjectLink[];
  gallery: ProjectGalleryItem[];
  skills: ProjectSkillEntry[];
  categories: ProjectCategoryEntry[];
}

export function useProject(id: number | null) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) return;
    setLoading(true);
    setError(null);
    fetch(`/api/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch project");
        return res.json();
      })
      .then((data) => setProject(data))
      .catch((err: any) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
}

export function useProjects(options: { shortcode?: string; sort?: 'date' } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (options.shortcode) params.set('shortcode', options.shortcode);
        if (options.sort !== undefined) params.set('sort', options.sort);
        const query = params.size ? `?${params.toString()}` : '';
        const res = await fetch(`/api/projects${query}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [options.shortcode, options.sort]);

  return { projects, loading, error };
}

type PrismaProjectWithRelations = {
  skills: Array<{ priority: number; skill: { id: number; name: string; desc: string; rating: number } }>;
  categories: Array<{ priority: number; category: { id: number; title: string; shortcode: string } }>;
  [key: string]: unknown;
};

function flattenProjectRelations(project: PrismaProjectWithRelations): Record<string, unknown> {
  return {
    ...project,
    skills: project.skills.map(({ priority, skill }) => ({ id: skill.id, priority, name: skill.name, desc: skill.desc, rating: skill.rating })),
    categories: project.categories.map(({ priority, category }) => ({ id: category.id, priority, title: category.title, shortcode: category.shortcode })),
  };
}

export function serializeProjects(projects: PrismaProjectWithRelations[]): Project[] {
  return JSON.parse(JSON.stringify(projects.map(flattenProjectRelations)));
}

export function serializeProject<T extends Project>(project: PrismaProjectWithRelations): T {
  return JSON.parse(JSON.stringify(flattenProjectRelations(project)));
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function buildDateRange(startDate?: string | null, endDate?: string | null): string | null {
  if (startDate == null && endDate == null) return null;
  if (startDate != null && endDate != null) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  if (startDate != null) {
    return `${formatDate(startDate)} – Present`;
  }
  return formatDate(endDate);
}

export function toSecureAssetUrl(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }

  return trimmed;
}