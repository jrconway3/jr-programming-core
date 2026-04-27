import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { buildDateRange } from 'app/helpers/common';
import type { Job } from 'app/models/jobs';
import { getJobByShortcode } from 'app/repositories/projects';
import ProjectCard from 'components/projects/ProjectCard';

type Props = {
  job: Job;
};

export default function ExperienceJobPage({ job }: Props) {
  const roleNames = job.roles.map((role) => role.title);
  const primaryRole = job.roles.find((role) => role.is_current)?.title ?? roleNames[0] ?? 'Role';
  const priorRoles = roleNames.filter((role) => role !== primaryRole);
  const dateRange = buildDateRange(job.start_date, job.end_date);
  const allProjects = [...job.keySystems, ...job.moreProjects];

  return (
    <>
      <Head>
        <title>{`${job.company?.name || 'Experience'} | JRProgramming`}</title>
      </Head>

      <main className="min-h-screen px-4 py-12">
        <section className="mx-auto w-full max-w-5xl space-y-8">
          <nav className="text-sm text-primary-text/65">
            <Link href="/" className="hover:text-primary-accentLight">Home</Link>
            <span className="px-2 text-primary-text/40">/</span>
            <Link href="/experience" className="hover:text-primary-accentLight">Experience</Link>
            <span className="px-2 text-primary-text/40">/</span>
            <span className="text-primary-text/85">{job.company?.name || 'Role Breakdown'}</span>
          </nav>

          <div className="terminal-card px-6 pb-8 pt-12 md:px-8">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> company: ${job.company?.name || 'Experience'}`}</p>
            {dateRange && (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-emerald-300/70">{`> years: ${dateRange}`}</p>
            )}

            <h1 className="mt-5 text-3xl font-bold text-primary-text md:text-4xl">{primaryRole}</h1>
            {priorRoles.length > 0 && (
              <p className="mt-2 text-sm text-primary-text/70">Previously: {priorRoles.join(' · ')}</p>
            )}

            {job.summary && (
              <p className="mt-5 text-sm leading-7 text-primary-text/80">{job.summary}</p>
            )}
          </div>

          {job.impacts.length > 0 && (
            <div className="terminal-card px-6 pb-7 pt-8 md:px-8">
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">Impact</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-primary-text/80 marker:text-primary-accentLight/70">
                {job.impacts.map((impact) => <li key={impact.id}>{impact.description}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Projects</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {allProjects.map((project) => <ProjectCard key={project.id} project={project} variant="experience" />)}
            </div>
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
