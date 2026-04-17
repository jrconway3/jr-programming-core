import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "../../prisma/adapter";
import { buildDateRange } from "../../models/projects";
import type { ProjectDetail } from "../../models/projects";

interface Props {
  project: ProjectDetail;
}

export default function ProjectPage({ project }: Props) {
  const isExperienceEntry = project.categories.some((categoryEntry) => categoryEntry.category.shortcode === 'experience');
  const dateRange = buildDateRange(project.start_date, project.end_date);
  const primaryBackHref = isExperienceEntry ? '/experience' : '/projects';
  const primaryBackLabel = isExperienceEntry ? 'Back to Experience' : 'Back to Portfolio';

  return (
    <>
      <Head>
        <title>{`${project.name} | JRProgramming`}</title>
        <meta name="description" content={project.short} />
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full max-w-4xl mx-auto">
          <div className="terminal-card mb-8 px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">
              {isExperienceEntry ? 'Experience Entry' : 'Case Study'}
            </p>
            <div className="mt-4 flex flex-wrap justify-between items-start gap-2 mb-2">
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text animate-gradient">
                {project.name}
              </h1>
              {dateRange && (
                <span className="rounded-full border border-primary-accent/25 px-3 py-1 text-sm text-primary-text/65 whitespace-nowrap">{dateRange}</span>
              )}
            </div>
            {project.role && (
              <p className="text-lg text-primary-accentLight font-medium">{project.role}</p>
            )}
            {project.position && (
              <p className="mt-1 text-sm text-primary-text/70">{project.position}</p>
            )}
          </div>

          <div className="terminal-card p-6 mb-6">
            <h2 className="mb-3 text-lg font-semibold text-accent">What It Does</h2>
            <p className="text-text leading-relaxed">{project.short}</p>
          </div>

          <div className="terminal-card p-6 mb-6">
            <h2 className="mb-4 text-lg font-semibold text-accent">Project Snapshot</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Built For</p>
                <p className="mt-2 text-sm leading-7 text-primary-text/80">{project.position || 'Client project'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Focus</p>
                <p className="mt-2 text-sm leading-7 text-primary-text/80">{project.role || 'Custom software development'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Timeline</p>
                <p className="mt-2 text-sm leading-7 text-primary-text/80">{dateRange || 'Timeline not specified'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Categories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.categories.length > 0 ? project.categories.map((categoryEntry) => (
                    <Link
                      key={categoryEntry.category_id}
                      href={`/${categoryEntry.category.shortcode}`}
                      className="rounded-full border border-accent/20 px-3 py-1 text-xs text-primary-text/70 transition hover:border-accent hover:text-accent"
                    >
                      {categoryEntry.category.title}
                    </Link>
                  )) : (
                    <span className="text-sm text-primary-text/60">Uncategorized</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {project.extended && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">What I Built</h2>
              <div
                className="prose prose-invert max-w-none text-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.extended }}
              />
            </div>
          )}

          {project.links.length > 0 && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">Proof & Links</h2>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 rounded-lg glass border border-accent/30 text-accent hover:bg-accent/10 hover:border-accent transition text-sm font-medium"
                  >
                    {link.website}
                  </a>
                ))}
              </div>
            </div>
          )}

          {project.skills.length > 0 && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((s) => (
                  <span
                    key={s.skill_id}
                    className="px-3 py-1 rounded-full text-sm glass border border-accent/20 text-primary-accentLight"
                    title={s.skill.desc}
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.gallery.length > 0 && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.map((item) => (
                  <figure key={item.id} className="rounded-lg overflow-hidden border border-accent/20">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {item.title && (
                      <figcaption className="px-3 py-2 text-xs text-muted bg-black/30">
                        {item.title}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-center">
            <Link
              href={primaryBackHref}
              className="inline-block px-6 py-2 rounded-lg glass border border-accent/30 text-muted hover:text-accent hover:border-accent transition text-sm"
            >
              ← {primaryBackLabel}
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-2 rounded-lg glass border border-accent/30 text-muted hover:text-accent hover:border-accent transition text-sm"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = parseInt(context.params?.id as string, 10);
  if (isNaN(id)) return { notFound: true };

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      links: { orderBy: { priority: "asc" } },
      gallery: { orderBy: { priority: "asc" } },
      skills: {
        include: { skill: true },
        orderBy: { priority: "asc" },
      },
      categories: {
        include: { category: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!project) return { notFound: true };

  // Serialize dates to strings
  const serialized = JSON.parse(JSON.stringify(project));

  return { props: { project: serialized } };
};
