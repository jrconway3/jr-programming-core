import { useEffect, useState } from "react";
import type { Project, ProjectDetail } from "app/models/projects";

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
      .then((payload) => setProject(payload.data))
      .catch((err: any) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
}

export function useProjects(options: { shortcode?: string; sort?: "date" } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (options.shortcode) params.set("shortcode", options.shortcode);
        if (options.sort !== undefined) params.set("sort", options.sort);
        const query = params.size ? `?${params.toString()}` : "";
        const res = await fetch(`/api/projects${query}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const payload = await res.json();
        setProjects(payload.data);
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
