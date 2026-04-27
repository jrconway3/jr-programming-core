import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { HomePageProps, HomeProjectStatsEntry } from "app/models/home";
import { useSettings } from "../components/SettingsContext";
import ProjectCard from "components/projects/ProjectCard";
import { getFeaturedProjects, getAllProjectStats } from "app/repositories/projects";
import { transformHomePageMetrics } from "app/transformers/home";

export default function Home({
  featuredProjects,
  yearsExperience,
  totalProjectsDelivered,
  automationFocusedProjects,
  portfolioProjects,
  displayedCompanies,
}: HomePageProps) {
  const { homeSettings } = useSettings();

  return (
    <>
      <Head>
        <title>JRProgramming</title>
      </Head>
      <main className="min-h-screen px-4 py-10 md:px-6 md:py-16">
        <section className="mx-auto w-full max-w-5xl pb-8 pt-3 md:pt-4">
          {homeSettings.show_status_cta && (
            <div className={`mb-8 flex items-center gap-3 rounded-lg px-4 py-3 md:mb-9 ${homeSettings.home_status_state === "busy" ? "border border-amber-400/35 bg-amber-500/10" : "border border-emerald-400/35 bg-emerald-500/10"}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={homeSettings.status_led_class} aria-hidden="true" />
                <p className={`hidden text-xs font-semibold uppercase tracking-[0.24em] sm:block ${homeSettings.home_status_state === "busy" ? "text-amber-200" : "text-emerald-200"}`}>
                  {homeSettings.display_status_label}
                </p>
                <span className="hidden text-primary-text/50 sm:inline">|</span>
                <p className="text-sm leading-snug text-primary-text/90 sm:text-[15px]">{homeSettings.display_status_message}</p>
              </div>

              <Link
                href={homeSettings.home_status_cta_href}
                className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] transition ${homeSettings.home_status_state === "busy" ? "border border-amber-300/50 bg-amber-500/20 text-amber-100 hover:border-amber-200 hover:bg-amber-500/30" : "border border-emerald-300/50 bg-emerald-500/20 text-emerald-100 hover:border-emerald-200 hover:bg-emerald-500/30"}`}
              >
                {homeSettings.display_status_cta_label}
              </Link>
            </div>
          )}

          <div className="terminal-card px-6 pb-8 pt-14 text-center md:px-10 md:pb-10 md:pt-16">
            <p className="mb-4 text-xs uppercase tracking-[0.38em] text-primary-accentLight/60">
              {homeSettings.home_banner_eyebrow}
            </p>
            <p className="mb-2 w-full pl-1 text-left text-xs uppercase tracking-[0.22em] text-emerald-300/55 md:pl-3">
              {"> user: jrconway"}
            </p>
            <h1 className="mb-4 text-5xl font-extrabold gradient-text animate-gradient md:text-7xl">
              {homeSettings.home_banner_title}
            </h1>
            <div className="mx-auto mb-6 h-[2px] w-64 bg-gradient-to-r from-transparent via-primary-accent to-transparent shadow-[0_0_10px_rgba(168,85,247,0.35)] md:w-72" aria-hidden="true" />
            <p className="mx-auto mb-6 max-w-4xl text-[1.5rem] font-semibold leading-[1.42] text-primary-text md:text-[2.15rem] md:leading-[1.48]">
              {homeSettings.home_banner_subtitle}
            </p>
            <div className="mx-auto mb-8 max-w-3xl space-y-2 text-sm leading-7 text-primary-text/72 md:text-lg">
              <p>{homeSettings.home_banner_supporting_line1}</p>
              <p>{homeSettings.home_banner_supporting_line2}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={homeSettings.home_banner_cta_primary_href}
                className="btn-cta-primary inline-block min-w-44 px-8 py-3 text-center font-semibold"
              >
                {homeSettings.home_banner_cta_primary_label}
              </a>
              <Link
                href={homeSettings.home_banner_cta_secondary_href}
                className="btn-cta-outline inline-block min-w-44 px-8 py-3 text-center font-semibold"
              >
                {homeSettings.home_banner_cta_secondary_label}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl py-12">
          <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Services</p>
            <h2 className="mt-3 text-3xl font-bold text-primary-accentLight md:text-4xl">What I Do</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-primary-text/75 md:text-base">
              I help teams reduce manual operations and ship reliable systems by focusing on practical backend architecture, integration work, and workflow automation.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "API Development & Integration",
                  body: "Design and connect API-driven systems so business tools share clean, reliable data.",
                },
                {
                  title: "Backend Systems",
                  body: "Build maintainable backend features for dashboards, CRM tools, and custom business software.",
                },
                {
                  title: "Automation & Workflow Tools",
                  body: "Replace repetitive manual tasks with dependable scripts, integrations, and automated processes.",
                },
                {
                  title: "Database Design & Optimization",
                  body: "Structure and optimize data models for faster queries, cleaner reporting, and easier scaling.",
                },
              ].map((service) => (
                <article key={service.title} className="project-block-emphasis rounded-xl border border-primary-accent/20 bg-slate-950/45 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-text">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-300/85" aria-hidden="true" />
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.95] text-primary-text/62">{service.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl py-12">
          <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Trust Signals</p>
            <h2 className="mt-3 text-3xl font-bold text-primary-accentLight md:text-4xl">Built Through Real Client Work</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-primary-text/75 md:text-base">
              The portfolio is backed by long-term production work across CRM systems, dealer platforms, marketing tools, and integrations.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="project-block-emphasis rounded-xl border border-primary-accent/28 bg-slate-950/45 p-5 shadow-[0_0_8px_rgba(168,85,247,0.08)]">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight/85">Experience</p>
                <p className="mt-3 text-6xl font-black text-slate-50 drop-shadow-[0_0_14px_rgba(255,255,255,0.24)] md:text-[4.1rem]">{`${yearsExperience}+`}</p>
                <p className="mt-2 text-sm text-primary-text/45">Years building production systems</p>
              </article>

              <article className="project-block-emphasis rounded-xl border border-primary-accent/28 bg-slate-950/45 p-5 shadow-[0_0_8px_rgba(168,85,247,0.08)]">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight/85">Delivered Work</p>
                <p className="mt-3 text-6xl font-black text-slate-50 drop-shadow-[0_0_14px_rgba(255,255,255,0.24)] md:text-[4.1rem]">{totalProjectsDelivered}</p>
                <p className="mt-2 text-sm text-primary-text/45">Total projects and major implementations</p>
              </article>

              <article className="project-block-emphasis rounded-xl border border-primary-accent/28 bg-slate-950/45 p-5 shadow-[0_0_8px_rgba(168,85,247,0.08)]">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight/85">Automation/API Focus</p>
                <p className="mt-3 text-6xl font-black text-slate-50 drop-shadow-[0_0_14px_rgba(255,255,255,0.24)] md:text-[4.1rem]">{automationFocusedProjects}</p>
                <p className="mt-2 text-sm text-primary-text/45">Projects centered on automation, APIs, and CRM workflows</p>
              </article>
            </div>

            <div className="mt-8">
              <article className="project-block-emphasis mx-auto max-w-[58rem] rounded-xl border border-primary-accent/20 bg-slate-950/45 px-7 py-6 md:px-8">
                <h3 className="text-lg font-semibold text-primary-accentLight">Companies and Teams</h3>
                <p className="mt-3 text-sm leading-7 text-primary-text/75">
                  Examples of organizations and teams I have delivered work for:
                </p>

                <div className="mt-5 flex flex-wrap gap-x-2 gap-y-4">
                  {displayedCompanies.map((company) => (
                    <span
                      key={company}
                      className="rounded-full border border-primary-accent/20 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-primary-text/70"
                    >
                      {company}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm text-primary-text/65">{portfolioProjects} portfolio entries currently published.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="projects" className="mx-auto w-full max-w-5xl py-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Portfolio</p>
              <h2 className="mt-3 text-2xl font-bold text-primary-accentLight">Featured Case Studies</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-text/75">
                A few representative systems and implementations that show the kind of backend, automation, and business software work I handle.
              </p>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
            {featuredProjects.length === 0 && (
              <div className="terminal-card px-6 py-8 text-primary-text/70">No featured case studies are available yet.</div>
            )}
            {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="btn-cta-primary inline-block px-8 py-3 font-semibold"
            >
              Browse Portfolio
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const [featuredProjects, allProjectsRaw] = await Promise.all([
    getFeaturedProjects(4),
    getAllProjectStats(),
  ]);

  const allProjects: HomeProjectStatsEntry[] = allProjectsRaw;
  const metrics = transformHomePageMetrics(allProjects);

  return {
    props: {
      featuredProjects,
      ...metrics,
    },
  };
};
