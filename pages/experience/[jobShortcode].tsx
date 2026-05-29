import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { withProjectCardView } from 'app/helpers/project-card';
import type { Job } from 'app/models/jobs';
import { getJobByShortcode } from 'app/repositories/projects';
import ProjectCard from 'components/projects/ProjectCard';

type Props = {
  job: Job;
};

export default function ExperienceJobPage({ job }: Props) {
  const companyName = job.company?.name || 'Experience';
  const companyShortcode = job.company?.shortcode ?? null;
  const allProjectsLabel = 'Other';

  return (
    <>
      <Head>
        <title>{`${companyName} | JRProgramming`}</title>
      </Head>

      <main className="min-h-screen px-4 py-12">
        <section className="mx-auto w-full space-y-8">
          <nav className="text-sm text-primary-text/65">
            <Link href="/" className="hover:text-primary-accentLight">Home</Link>
            <span className="px-2 text-primary-text/40">/</span>
            <Link href="/experience" className="hover:text-primary-accentLight">Experience</Link>
            <span className="px-2 text-primary-text/40">/</span>
            <span className="text-primary-text/85">{companyName}</span>
          </nav>

          <div className="terminal-card px-6 pb-8 pt-12 md:px-8">
            {companyShortcode && (
              <div className="-mt-12 -mx-6 md:-mx-8 mb-6 relative aspect-video overflow-hidden rounded-t-[9px] bg-slate-900">
                <img
                  src={`/images/experience/${companyShortcode}.png`}
                  alt={companyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const container = e.currentTarget.parentElement as HTMLElement;
                    container.style.display = 'none';
                    const card = container.parentElement as HTMLElement;
                    if (card) card.style.paddingTop = '3.5rem';
                  }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(rgba(168,85,247,0.06) 0px, rgba(168,85,247,0.06) 1px, transparent 1px, transparent 3px)' }} />
              </div>
            )}

            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> company: ${companyName}`}</p>
            {job.date_range && (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> years: ${job.date_range}`}</p>
            )}

            <h1 className="mt-5 text-3xl font-bold text-primary-text md:text-4xl">{job.primary_role}</h1>
            {job.prior_roles.length > 0 && (
              <p className="mt-2 text-sm text-primary-text/70">Previously: {job.prior_roles.join(' · ')}</p>
            )}

            {job.summary && (
              <p className="mt-5 text-sm leading-7 text-primary-text/80">{job.summary}</p>
            )}
          </div>

          {job.keySystems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Key Systems</h2>
              <div className="grid gap-8 md:grid-cols-2 3xl:grid-cols-3">
                {job.keySystems.map((project) => <ProjectCard key={project.id} project={withProjectCardView(project, "project")} />)}
              </div>
            </div>
          )}

          {job.impacts.length > 0 && (
            <div className="terminal-card px-6 pb-7 pt-8 md:px-8">
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">Impact</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-primary-text/80 marker:text-primary-accentLight/70">
                {job.impacts.map((impact) => <li key={impact.id}>{impact.description}</li>)}
              </ul>
            </div>
          )}

          {job.moreProjects.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">
                {job.keySystems.length > 0 ? allProjectsLabel : "Projects"}
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  ...job.moreProjects.filter((p) => p.gallery.length > 0),
                  ...job.moreProjects.filter((p) => p.gallery.length === 0),
                ].map((project) => (
                  <div key={project.id} className="w-full sm:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.5rem)]">
                    <ProjectCard project={withProjectCardView(project, "project")} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/experience" className="btn-cta-outline inline-block px-6 py-2 text-sm">
              ← Back to Experience
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const jobShortcode = String(context.params?.jobShortcode || '').trim();

  if (!jobShortcode) {
    return { notFound: true };
  }

  const job = await getJobByShortcode(jobShortcode);

  if (!job) {
    return { notFound: true };
  }

  return {
    props: {
      job,
    },
  };
};
