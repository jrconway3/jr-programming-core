import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useProjects } from "../models/projects";
import { useCategory } from "../models/categories";
import type { Category } from "../models/categories";
import ProjectCard from "./ProjectCard";

interface Props {
  shortcode: string;
  titleOverride?: string;
  initialCategory?: Category;
}

export default function ProjectCategoryPage({ shortcode, titleOverride, initialCategory }: Props) {
  const { category, loading: catLoading } = useCategory(initialCategory ? undefined : shortcode);
  const resolved = initialCategory ?? category;
  const { projects, loading, error } = useProjects({ shortcode, sort: "date" });
  const [search, setSearch] = useState("");

  const pageTitle = titleOverride ?? (!resolved && catLoading ? "..." : (resolved?.title ?? "Projects"));

  const filtered = projects.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.short.toLowerCase().includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>{`${pageTitle} | JRProgramming`}</title>
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 gradient-text animate-gradient">
            {pageTitle}
          </h1>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg glass border border-accent/30 bg-transparent text-text placeholder-muted focus:outline-none focus:border-accent w-full md:w-72"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-muted hover:text-accent transition"
              >
                Clear
              </button>
            )}
            {!loading && (
              <span className="text-sm text-muted ml-auto">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            )}
          </div>

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {loading && <div className="text-muted">Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="text-muted">No projects found.</div>
            )}
            {!loading &&
              !error &&
              filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
              
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-2 rounded-lg glass border border-accent/30 text-muted hover:text-accent hover:border-accent transition text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
