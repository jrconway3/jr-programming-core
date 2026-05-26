import Head from "next/head";
import Link from "next/link";
import { buildDateRange, toSecureAssetUrl } from "app/helpers/common";
import { ProjectDetail } from "app/models/projects";

interface AdjacentProject {
  href: string;
  name: string;
}

interface Props {
  project: ProjectDetail;
  prevProject?: AdjacentProject | null;
  nextProject?: AdjacentProject | null;
}

export function ProjectDetailView({ project, prevProject, nextProject }: Props) {
  const isExperienceEntry = project.categories.some((categoryEntry) => categoryEntry.shortcode === 'experience');
  const dateRange = buildDateRange(project.start_date, project.end_date);
  const parentJob = project.job ?? null;
  const parentJobHref = parentJob?.shortcode ? `/experience/${parentJob.shortcode}` : null;
  const clientSlug = parentJob?.company?.shortcode
    ?? project.position?.toLowerCase().replace(/\s+/g, '-')
    ?? 'projects';
  const screenshotImage = project.gallery[0]?.image ? toSecureAssetUrl(project.gallery[0].image) : null;
  const snapshotFallbackLabel = project.categories.find(
    (c) => !['projects', 'featured-projects', 'experience'].includes(c.shortcode)
  )?.title ?? project.categories[0]?.title ?? 'PROJECT';

  return (
    <>
      <Head>
        <title>{`${project.name} | JRProgramming`}</title>
        <meta name="description" content={project.short} />
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full mx-auto">
          <nav className="mb-4 text-sm text-primary-text/65">
            <Link href="/" className="hover:text-primary-accentLight">Home</Link>
            <span className="px-2 text-primary-text/40">/</span>
            <Link href={isExperienceEntry ? '/experience' : '/projects'} className="hover:text-primary-accentLight">
              {isExperienceEntry ? 'Experience' : 'Portfolio'}
            </Link>
            {parentJob && parentJobHref && (
              <>
                <span className="px-2 text-primary-text/40">/</span>
                <Link href={parentJobHref} className="hover:text-primary-accentLight">
                  {parentJob.company?.name || 'Role Breakdown'}
                </Link>
              </>
            )}
            <span className="px-2 text-primary-text/40">/</span>
            <span className="text-primary-text/85">{project.name}</span>
          </nav>

          <p className="mb-3 text-xs font-mono text-emerald-400/70">
            jrconway@portfolio:~/projects/{clientSlug} $
          </p>

          <div className="terminal-card mb-8 px-6 pb-0 pt-14 md:px-8">
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

            {/* 16:9 screenshot slot — bleeds to card sides/bottom */}
            <div className="mt-6 -mx-6 md:-mx-8 relative aspect-video overflow-hidden rounded-b-xl bg-slate-900/80 flex items-center justify-center">
              {screenshotImage ? (
                <img
                  src={screenshotImage}
                  alt={`${project.name} screenshot`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-headers text-primary-text/10 uppercase tracking-widest">
                  {snapshotFallbackLabel}
                </span>
              )}
              {/* Scanline overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(rgba(168,85,247,0.06) 0px, rgba(168,85,247,0.06) 1px, transparent 1px, transparent 3px)' }}
                aria-hidden="true"
              />
              <p className="absolute bottom-2 right-3 text-[10px] text-primary-text/35 uppercase tracking-widest">
                screenshot.png
              </p>
            </div>
          </div>

          <div className="terminal-card project-block-emphasis p-6 mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-2">What It Does</p>
            <p className="text-text leading-relaxed">{project.short}</p>
          </div>

          {/* Consolidated Project Snapshot */}
          <div className="terminal-card project-block-emphasis p-6 mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-4">Project Snapshot</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Built For</p>
                <p className="mt-1 text-primary-text/80">{project.position || 'Client project'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Focus</p>
                <p className="mt-1 text-primary-text/80">{project.role || 'Custom software development'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Timeline</p>
                <p className="mt-1 text-primary-text/80">{dateRange || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Categories</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {project.categories.length > 0 ? project.categories.map((categoryEntry) => (
                    <Link
                      key={categoryEntry.id}
                      href={`/${categoryEntry.shortcode}`}
                      className="rounded-full border border-accent/20 px-3 py-1 text-xs text-primary-text/70 transition hover:border-accent hover:text-accent"
                    >
                      {categoryEntry.title}
                    </Link>
                  )) : (
                    <span className="text-sm text-primary-text/60">Uncategorized</span>
                  )}
                </div>
              </div>
            </div>

            {project.skills.length > 0 && (
              <div className="mt-5 pt-4 border-t border-primary-accent/20">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 rounded-full text-sm glass border border-accent/20 text-primary-accentLight"
                      title={s.desc}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {project.extended && (
            <div className="terminal-card project-block-emphasis p-6 mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">What I Built</p>
              <div
                className="prose prose-invert terminal-prose max-w-none text-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.extended }}
              />
            </div>
          )}

          {project.links.length > 0 && (
            <div className="terminal-card project-block-emphasis p-6 mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Proof & Links</p>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={toSecureAssetUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta-outline inline-block px-5 py-2 text-sm font-medium"
                  >
                    {link.website}
                  </a>
                ))}
              </div>
            </div>
          )}

          {project.gallery.length > 0 && (
            <div className="terminal-card project-block-emphasis p-6 mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Gallery</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.map((item) => (
                  <figure key={item.id} className="rounded-lg overflow-hidden border border-accent/20">
                    <img
                      src={toSecureAssetUrl(item.image)}
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

          {/* Prev / Next / Back navigation */}
          <div className="mt-10 flex items-center justify-between text-sm">
            {prevProject ? (
              <Link href={prevProject.href} className="text-primary-accentLight/80 hover:text-primary-accentLight transition">
                ← Previous project
              </Link>
            ) : <span />}
            <Link href="/projects" className="text-primary-accentLight/80 hover:text-primary-accentLight transition">
              ← Back to Portfolio
            </Link>
            {nextProject ? (
              <Link href={nextProject.href} className="text-primary-accentLight/80 hover:text-primary-accentLight transition">
                Next project →
              </Link>
            ) : <span />}
          </div>

        </section>
      </main>
    </>
  );
}
