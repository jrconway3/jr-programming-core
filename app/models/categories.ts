import { useState, useEffect } from "react";

export interface Category {
  id: number;
  title: string;
  shortcode: string;
}

export function useCategory(shortcode: string | undefined) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(!!shortcode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortcode) { setLoading(false); return; }
    setLoading(true);
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${shortcode}`);
        if (!res.ok) throw new Error("Category not found");
        const data = await res.json();
        setCategory(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [shortcode]);

  return { category, loading, error };
}
