import Head from "next/head";
import Link from "next/link";
import { buildDateRange, toSecureAssetUrl } from "app/helpers/common";
import { ProjectDetail } from "app/models/projects";

interface Props {
  project: ProjectDetail;
}

export function ProjectDetailView({ project }: Props) {
  const isExperienceEntry = project.categories.some((c) => c.shortcode === 'experience');
  const dateRange = buildDateRange(project.start_date, project.end_date);
  const parentJob = project.job ?? null;
  const parentJobHref = parentJob?.shortcode ? `/experience/${parentJob.shortcode}` : null;
  const clientSlug = parentJob?.company?.shortcode
    ?? project.position?.toLowerCase().replace(/\s+/g, '-')
    ?? 'projects';

  const gallery = project.gallery ?? [];
  const primaryImage = gallery[0]?.image ? toSecureAssetUrl(gallery[0].image) : null;
  const hasMultiple = gallery.length > 1;

  return (
    <>
      <Head>
        <title>{`${project.name} | JRProgramming`}</title>
        <meta name="description" content={project.short} />
      </Head>
      <main className="min-h-screen px-4 py-12">
        <section className="w-full mx-auto">

          {/* Breadcrumb */}
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

          {/* Two-column header card */}
          <div className="terminal-card mb-6 px-6 pb-8 pt-14 md:px-8">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[3fr_2fr] lg:items-start">

              {/* Left: main narrative */}
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold gradient-text animate-gradient mb-3">
                  {project.name}
                </h1>
                {(project.role || project.position) && (
                  <p className="text-lg text-primary-accentLight font-medium mb-3">
                    {project.role}
                    {project.role && project.position ? " — " : ""}
                    {project.position}
                  </p>
                )}
                {dateRange && (
                  <p className="mb-4 text-sm text-primary-text/60">{dateRange}</p>
                )}
                <div className="mt-2">
                  {project.extended ? (
                    <div
                      className="prose prose-invert terminal-prose max-w-none text-text leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: project.extended }}
                    />
                  ) : (
                    <p className="text-text leading-relaxed">{project.short}</p>
                  )}
                </div>
              </div>

              {/* Right: snapshot sidebar */}
              <div className="rounded-lg border border-primary-accent/20 bg-slate-950/50 p-5 space-y-5 text-sm">
                {project.categories.some((c) => c.shortcode !== 'featured-projects') && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.categories.filter((c) => c.shortcode !== 'featured-projects').map((c) => (
                        <Link
                          key={c.id}
                          href={`/${c.shortcode}`}
                          className="rounded-full border border-accent/20 px-3 py-1 text-xs text-primary-text/70 transition hover:border-accent hover:text-accent"
                        >
                          {c.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {project.skills.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((s) => (
                        <Link
                          key={s.id}
                          href={`/projects?filter=${encodeURIComponent(s.name)}`}
                          className="px-3 py-1 rounded-full text-xs border border-accent/20 text-primary-accentLight hover:border-accent hover:text-accent transition"
                          title={s.desc ?? undefined}
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {project.links.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight mb-2">Links</p>
                    <div className="space-y-2">
                      {project.links.map((link) => (
                        <a
                          key={link.id}
                          href={toSecureAssetUrl(link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary-accentLight hover:text-emerald-300 underline underline-offset-2 transition"
                        >
                          ↗ {link.website}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary image — single image only */}
          {primaryImage && !hasMultiple && (
            <div className="terminal-card project-block-emphasis mb-6 overflow-hidden p-0">
              <div className="relative bg-slate-900/80">
                <img
                  src={primaryImage}
                  alt={`${project.name} screenshot`}
                  className="w-full h-auto"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(rgba(168,85,247,0.06) 0px, rgba(168,85,247,0.06) 1px, transparent 1px, transparent 3px)' }}
                  aria-hidden="true"
                />
                {gallery[0]?.title && (
                  <p className="absolute bottom-0 inset-x-0 px-4 py-2 text-xs text-primary-text/50 bg-black/40">
                    {gallery[0].title}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Gallery — masonry columns, multiple images */}
          {hasMultiple && (
            <div className="terminal-card project-block-emphasis p-6 mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-4">Gallery</p>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="break-inside-avoid mb-4">
                    <div className="relative overflow-hidden rounded-lg bg-slate-900">
                      <img
                        src={toSecureAssetUrl(item.image)}
                        alt={item.title || `${project.name} screenshot`}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(rgba(168,85,247,0.05) 0px, rgba(168,85,247,0.05) 1px, transparent 1px, transparent 3px)' }}
                        aria-hidden="true"
                      />
                    </div>
                    {item.title && (
                      <p className="mt-1 text-xs text-primary-text/45">{item.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to Portfolio */}
          <div className="mt-10 text-center">
            <Link href="/projects" className="text-primary-accentLight/80 hover:text-primary-accentLight transition">
              ← Back to Portfolio
            </Link>
          </div>

        </section>
      </main>
    </>
  );
}
