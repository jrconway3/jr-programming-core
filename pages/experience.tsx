import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { buildDateRange } from 'app/helpers/common';
import type { Category } from 'app/models/categories';
import type { Job } from 'app/models/jobs';
import { getProjectsByShortcode, getCategoryByShortcode, getJobs } from 'app/repositories/projects';
import { buildExperiencePageData } from 'app/services/jobs';

type Props = {
  category: Category;
  projects: Parameters<typeof buildExperiencePageData>[0]['projects'];
  jobs: Job[];
};

export default function ExperiencePage({ category, projects, jobs }: Props) {
  const {
    primaryJobs,
    earlierJobs,
    featuredPrimary,
    primaryRole,
    priorRoles,
    featuredDateRange,
    featuredOrgLabel,
    featuredOverview,
    keySystems,
    impactItems,
    href,
  } = buildExperiencePageData({ projects, jobs });

  const renderJobCards = (entries: Job[]) => (
    <div className="grid gap-8 md:grid-cols-2">
      {entries.map((entry) => {
        const roleNames = entry.roles.map((role) => role.title);
        const primaryEntryRole = entry.roles.find((role) => role.is_current)?.title ?? roleNames[0] ?? 'Role';
        const summary = entry.roles.find((role) => role.is_current)?.short_summary
          ?? entry.roles[0]?.short_summary
          ?? entry.summary
          ?? 'Additional details are available on this role page.';
        const companyLabel = entry.company?.name ?? 'Company';
        const roleDateRange = buildDateRange(entry.start_date, entry.end_date);
        const roleHref = entry.shortcode ? `/experience/${entry.shortcode}` : '/experience';

        return (
          <Link
            key={entry.id}
            href={roleHref}
            className="terminal-card block cursor-pointer p-6 transition-all duration-150 ease-out hover:scale-[1.01] hover:!border-emerald-300/50 hover:!shadow-[0_0_10px_rgba(74,222,128,0.1)]"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary-accentLight/75">{companyLabel}</p>
                <h3 className="mt-2 text-xl font-semibold text-primary-text transition-colors duration-150 hover:text-emerald-100">
                  {primaryEntryRole}
                </h3>
              </div>

              {roleDateRange && (
                <span className="whitespace-nowrap rounded-full border border-primary-accent/25 px-3 py-1 text-xs text-primary-text/65">{roleDateRange}</span>
              )}
            </div>

            <p className="text-sm leading-7 text-primary-text/75">{summary}</p>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <Head>
        <title>{`Experience | JRProgramming`}</title>
      </Head>

      <main className="min-h-screen px-4 py-12">
        <section className="mx-auto w-full max-w-5xl space-y-10">
          <div className="terminal-card px-6 pb-7 pt-12 md:px-8 md:pt-13">
            <h1 className="text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">{category.title}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-primary-text/78 md:text-base">
              A progression-focused view of ownership, growth, and the systems delivered over time.
            </p>
          </div>

          <div className="terminal-card px-6 pb-7 pt-12 md:px-8 md:pt-13">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Primary Work</p>
            </div>

            <div className="mt-6">
              {primaryJobs.length > 0 ? renderJobCards(primaryJobs) : null}
            </div>

            {featuredPrimary ? (
              <article className="mt-10">
                <div className="pb-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> company: ${featuredOrgLabel}`}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> role: ${primaryRole}`}</p>
                  {featuredDateRange && (
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> years: ${featuredDateRange}`}</p>
                  )}

                  <h2 className="mt-6 text-2xl font-bold text-primary-text md:text-3xl">
                    {primaryRole}
                  </h2>
                  {priorRoles.length > 0 && (
                    <p className="mt-2 text-sm text-primary-text/70">Previously: {priorRoles.join(' · ')}</p>
                  )}
                  <div className="mt-5 h-px w-full bg-gradient-to-r from-primary-accent/35 via-primary-accent/20 to-transparent" aria-hidden="true" />
                </div>

                <div className="grid gap-10 pt-6 md:grid-cols-12">
                  <div className="space-y-12 md:col-span-12">
                    <section>
                      <h3 className="text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">Overview</h3>
                      <p className="mt-3 text-sm leading-7 text-primary-text/80">{featuredOverview}</p>
                    </section>

                    <section>
                      <h3 className="text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">Key Systems</h3>
                      <ul className="mt-5 space-y-9 text-sm leading-7 text-primary-text/80">
                        {keySystems.map((system) => (
                          <li key={system.title} className="space-y-1">
                            <Link
                              href={system.href ?? href}
                              className="group inline-flex cursor-pointer items-center gap-2 text-[1.03rem] font-bold text-primary-text underline decoration-primary-accent/25 underline-offset-4 transition-all hover:text-emerald-200 hover:decoration-emerald-300"
                            >
                              <span>{system.title}</span>
                              <span aria-hidden="true" className="text-emerald-300/80 transition-transform duration-150 group-hover:translate-x-1">{'->'}</span>
                            </Link>
                            <p className="text-primary-text/60">{system.description}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="border-t border-primary-accent/10 pt-4">
                      <h3 className="text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">Impact</h3>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-primary-text/80 marker:text-primary-accentLight/70">
                        {impactItems.map((impact) => (
                          <li key={impact}>{impact}</li>
                        ))}
                      </ul>
                    </section>

                    <div className="mt-8">
                      <Link
                        href={href}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-accentLight/80 underline decoration-primary-accent/30 underline-offset-4 transition-all hover:text-emerald-200 hover:decoration-emerald-300 hover:opacity-100"
                      >
                        <span>View Full Role Breakdown</span>
                        <span aria-hidden="true" className="text-emerald-300/80 transition-transform duration-150 group-hover:translate-x-1">{'->'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Earlier Experience</p>
          </div>

          {earlierJobs.length > 0 ? renderJobCards(earlierJobs) : null}

          <div className="text-center">
            <Link href="/" className="btn-cta-outline inline-block px-6 py-2 text-sm">
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [category, projects, jobs] = await Promise.all([
    getCategoryByShortcode('experience'),
    getProjectsByShortcode('experience'),
    getJobs(),
  ]);

  if (!category) {
    return { notFound: true };
  }

  return {
    props: {
      category,
      projects,
      jobs,
    },
  };
};