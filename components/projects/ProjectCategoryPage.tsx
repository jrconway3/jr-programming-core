import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { Project } from "app/models/projects";
import type { Category } from "app/models/categories";
import ProjectCard from "./ProjectCard";

interface Props {
  titleOverride?: string;
  descriptionOverride?: string;
  cardVariant?: "project" | "experience";
  emptyStateLabel?: string;
  sectionLabel?: string;
  searchPlaceholder?: string;
  initialCategory: Category;
  initialProjects: Project[];
}

export default function ProjectCategoryPage({
  titleOverride,
  descriptionOverride,
  cardVariant = "project",
  emptyStateLabel = "No entries found.",
  sectionLabel,
  searchPlaceholder = "Search by project, summary, or role",
  initialCategory,
  initialProjects,
}: Props) {
  const [search, setSearch] = useState("");

  const pageTitle = titleOverride ?? initialCategory.title;
  const pageDescription = descriptionOverride ?? "Browse the work collected in this section.";
  const resolvedSectionLabel = sectionLabel ?? (cardVariant === "experience" ? "Experience" : "Portfolio");

  const filtered = initialProjects.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.short.toLowerCase().includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase()) ||
      p.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>{`${pageTitle} | JRProgramming`}</title>
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full max-w-5xl mx-auto">
          <div className="terminal-card mb-8 px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">{resolvedSectionLabel}</p>
            <h1 className="mt-4 text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-primary-text/80 md:text-base">
              {pageDescription}
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder={searchPlaceholder}
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
            <span className="text-sm text-muted ml-auto">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filtered.length === 0 && (
              <div className="terminal-card px-6 py-8 text-primary-text/70">{emptyStateLabel}</div>
            )}
            {filtered.map((project) => <ProjectCard key={project.id} project={project} variant={cardVariant} />)}
          </div>
              
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="btn-cta-outline inline-block px-6 py-2 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
