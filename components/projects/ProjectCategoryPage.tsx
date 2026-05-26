import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { Project } from "app/models/projects";
import type { Category } from "app/models/categories";
import ProjectCard from "./ProjectCard";
import { withProjectCardView } from "app/helpers/project-card";

interface Props {
  titleOverride?: string;
  descriptionOverride?: string;
  cardVariant?: "project" | "experience";
  emptyStateLabel?: string;
  sectionLabel?: string;
  searchPlaceholder?: string;
  filterCategories?: Category[];
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
  filterCategories = [],
  initialCategory,
  initialProjects,
}: Props) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const pageTitle = titleOverride ?? initialCategory.title;
  const pageDescription = descriptionOverride ?? "Browse the work collected in this section.";
  const resolvedSectionLabel = sectionLabel ?? (cardVariant === "experience" ? "Experience" : "Portfolio");

  const filtered = initialProjects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.short.toLowerCase().includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase()) ||
      p.position?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === null ||
      p.categories.some((c) => c.id === activeFilter);

    return matchesSearch && matchesFilter;
  });

  const sorted = [
    ...filtered.filter((p) => (p.gallery?.length ?? 0) > 0),
    ...filtered.filter((p) => (p.gallery?.length ?? 0) === 0),
  ];

  return (
    <>
      <Head>
        <title>{`${pageTitle} | JRProgramming`}</title>
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full mx-auto">
          <div className="terminal-card mb-8 px-6 pb-8 pt-14 md:px-8">
            <p className="mb-3 text-xs font-mono">
              <span className="text-emerald-300/80">jrconway@portfolio</span>
              <span className="text-violet-600/60">:~/projects</span>
              <span className="text-primary-text/35"> $</span>
            </p>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">{resolvedSectionLabel}</p>
            <h1 className="mt-4 text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-5 text-sm leading-7 text-primary-text/80 md:text-base">
              {pageDescription}
            </p>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-3">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg border border-accent/30 bg-transparent text-text placeholder-muted focus:outline-none focus:border-accent w-72"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-muted hover:text-accent transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-lg text-xs tracking-wide border transition ${
                activeFilter === null
                  ? "bg-primary-accent/25 border-violet-400/50 text-primary-accentLight"
                  : "bg-transparent border-primary-accent/40 text-primary-accentLight hover:bg-primary-accent/10 hover:border-primary-accent/60"
              }`}
            >
              All
            </button>
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs tracking-wide border transition ${
                  activeFilter === cat.id
                    ? "bg-primary-accent/25 border-violet-400/50 text-primary-accentLight"
                    : "bg-transparent border-primary-accent/40 text-primary-accentLight hover:bg-primary-accent/10 hover:border-primary-accent/60"
                }`}
              >
                {cat.title}
              </button>
            ))}
            <span className="ml-auto text-sm text-primary-text/50">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {sorted.length === 0 && (
              <div className="terminal-card px-6 py-8 text-primary-text/70 w-full">{emptyStateLabel}</div>
            )}
            {sorted.map((project) => (
              <div key={project.id} className="w-full sm:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.5rem)]">
                <ProjectCard project={withProjectCardView(project, cardVariant)} />
              </div>
            ))}
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
