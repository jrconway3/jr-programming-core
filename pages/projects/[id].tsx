import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "../../prisma/adapter";
import type { ProjectDetail } from "../../models/projects";

interface Props {
  project: ProjectDetail;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function ProjectPage({ project }: Props) {
  const dateRange =
    project.start_date || project.end_date !== undefined
      ? `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`
      : null;

  return (
    <>
      <Head>
        <title>{`${project.name} | JRProgramming`}</title>
        <meta name="description" content={project.short} />
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text animate-gradient">
                {project.name}
              </h1>
              {dateRange && (
                <span className="text-sm text-muted pt-3 whitespace-nowrap">{dateRange}</span>
              )}
            </div>
            {project.role && (
              <p className="text-lg text-primary-accentLight font-medium">{project.role}</p>
            )}
            {project.position && (
              <p className="text-sm text-muted">{project.position}</p>
            )}
          </div>

          {/* Short description */}
          <div className="terminal-card p-6 mb-6">
            <p className="text-text leading-relaxed">{project.short}</p>
          </div>

          {/* Extended description */}
          {project.extended && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">About</h2>
              <div
                className="prose prose-invert max-w-none text-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.extended }}
              />
            </div>
          )}

          {/* Links */}
          {project.links.length > 0 && (
            <div className="terminal-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-accent mb-3">Links</h2>
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

          {/* Skills */}
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

          {/* Gallery */}
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

          {/* Categories */}
          {project.categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted">Categories:</span>
              {project.categories.map((c) => (
                <Link
                  key={c.category_id}
                  href={`/${c.category.shortcode}`}
                  className="px-3 py-1 rounded-full text-xs glass border border-accent/20 text-muted hover:text-accent hover:border-accent transition"
                >
                  {c.category.title}
                </Link>
              ))}
            </div>
          )}

          {/* Back */}
          <div className="mt-4 text-center">
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
