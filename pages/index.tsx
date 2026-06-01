import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { HomePageProps } from "app/models/home";
import { useSettings } from "components/SettingsContext";
import ProjectCard from "components/projects/ProjectCard";
import { withProjectCardView } from "app/helpers/project-card";
import { getFeaturedProjects, getAllProjectStats, getExperienceStartYear } from "app/repositories/projects";
import { transformHomePageMetrics } from "app/transformers/home";
import { siteSettingDefaults } from "app/services/settings";

export default function Home({
  featuredProjects,
  yearsExperience,
  totalProjectsDelivered,
  automationFocusedProjects,
  displayedCompanies,
}: HomePageProps) {
  const { homeSettings } = useSettings();

  return (
    <>
      <Head>
        <title>David Conway Jr. — Backend Developer &amp; API Integration Specialist</title>
        <meta name="description" content="Backend developer specializing in Laravel, PHP, REST APIs, and workflow automation. 15+ years of production experience. Available for hire." />
        <meta property="og:title" content="David Conway Jr. — Backend Developer & API Integration Specialist" />
        <meta property="og:description" content="Backend developer specializing in Laravel, PHP, REST APIs, and workflow automation. 15+ years of production experience. Available for hire." />
        <meta property="og:url" content="https://jrconway.net" />
      </Head>
      <main className="min-h-screen px-4 py-8 md:px-6">
        <section className="mx-auto w-full pb-8">
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

          <div className="terminal-card px-6 pb-8 pt-14 md:px-10 md:pb-10 md:pt-16">
            <div className="hero-grid flex flex-col gap-8 md:grid md:grid-cols-[1fr_340px] md:items-stretch">
              {/* Left column: text + CTAs */}
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.38em] text-primary-accentLight/60">
                  {homeSettings.home_banner_eyebrow}
                </p>
                <p className="mb-2 w-full pl-1 text-left text-xs uppercase tracking-[0.22em] text-emerald-300/55 md:pl-3">
                  {"> user: jrconway"}
                </p>
                <h1 className="mb-4 text-5xl font-extrabold gradient-text animate-gradient md:text-7xl">
                  {homeSettings.home_banner_title}
                </h1>
                <div className="mb-6 h-[2px] w-64 bg-gradient-to-r from-transparent via-primary-accent to-transparent shadow-[0_0_10px_rgba(168,85,247,0.35)] md:w-72" aria-hidden="true" />
                <p className="mb-8 text-lg font-semibold leading-[1.55] text-primary-text md:text-xl">
                  {homeSettings.home_banner_subtitle}
                </p>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
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

              {/* Right column: portrait — CSS positions this absolute to the card */}
              <div className="photo-container bg-slate-900/60">
                <img src="/images/my-portrait.png" alt="David Conway Jr." />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full py-8">
          <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                  <h3 className="flex items-center gap-2 text-base font-semibold text-primary-text">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-300/85" aria-hidden="true" />
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.95] text-primary-text/62">{service.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full py-12">
          <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Trust Signals</p>
            <h2 className="mt-3 text-3xl font-bold text-primary-accentLight md:text-4xl">Built Through Real Client Work</h2>
            <p className="mt-4 text-sm leading-7 text-primary-text/75 md:text-base">
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
              <article className="project-block-emphasis rounded-xl border border-primary-accent/20 bg-slate-950/45 px-7 py-6 md:px-8">
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

              </article>
            </div>
          </div>
        </section>

        <section id="projects" className="mx-auto w-full py-12">
          <div className="terminal-card mb-8 px-6 pb-8 pt-14 md:px-8">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Portfolio</p>
            <h2 className="mt-3 text-3xl font-bold text-primary-accentLight md:text-4xl">Featured Case Studies</h2>
            <p className="mt-4 text-sm leading-7 text-primary-text/75">
              A few representative systems and implementations that show the kind of backend, automation, and business software work I handle.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {featuredProjects.length === 0 && (
              <div className="terminal-card px-6 py-8 text-primary-text/70 w-full">No featured case studies are available yet.</div>
            )}
            {featuredProjects.map((project) => (
              <div key={project.id} className="w-full sm:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.5rem)]">
                <ProjectCard project={withProjectCardView(project, "project")} />
              </div>
            ))}
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
  const defaultYear = parseInt(siteSettingDefaults['home/stats/experience_start_year'], 10);
  const [featuredProjects, allProjectsRaw, experienceStartYear] = await Promise.all([
    getFeaturedProjects(3),
    getAllProjectStats(),
    getExperienceStartYear(defaultYear),
  ]);
  const metrics = transformHomePageMetrics(allProjectsRaw, experienceStartYear);

  return {
    props: {
      featuredProjects,
      ...metrics,
    },
  };
};
