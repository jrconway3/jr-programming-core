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

export function useProjects(options: { featured?: boolean; sort?: 'date' } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (options.featured !== undefined) params.set('featured', String(options.featured));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.featured, options.sort]);

  return { projects, loading, error };
}