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
  skill_id: number;
  priority: number;
  skill: { id: number; name: string; desc: string; rating: number };
}

export interface ProjectCategoryEntry {
  category_id: number;
  priority: number;
  category: { id: number; title: string; shortcode: string };
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