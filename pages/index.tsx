import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { Project } from "../models/projects";
import { useSettings } from "../components/SettingsContext";
import ProjectCard from "components/ProjectCard";
import { getSettingValue, siteSettingDefaults } from "../lib/site-settings";
import { prisma } from "../prisma/adapter";

const legacyHeroSubtitles = new Set([
  "web software engineer & programmer",
  "systems engineer / web developer",
]);

const legacyStatusMessages = new Set([
  "looking for a developer to build or improve your system?",
]);

const legacyStatusLabels = new Set([
  "status: available for work",
]);

const preferredCompanyNames = [
  "TrailerCentral",
  "LeadVenture",
  "Yazamo",
  "SEO Strong",
  "KloutFire",
  "Ponticlaro",
  "Freight Access, Inc.",
];

function toYear(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getUTCFullYear();
}

function calculateYearsExperience(startYears: number[]): number {
  if (startYears.length === 0) {
    return 10;
  }

  const earliestYear = Math.min(...startYears);
  const currentYear = new Date().getUTCFullYear();
  return Math.max(1, currentYear - earliestYear + 1);
}

type HomePageProps = {
  featuredProjects: Project[];
  yearsExperience: number;
  totalProjectsDelivered: number;
  automationFocusedProjects: number;
  portfolioProjects: number;
  displayedCompanies: string[];
};

export default function Home({
  featuredProjects,
  yearsExperience,
  totalProjectsDelivered,
  automationFocusedProjects,
  portfolioProjects,
  displayedCompanies,
}: HomePageProps) {
  const { settings, isLoaded } = useSettings();
  const configuredHeadline = settings["home/banner/subtitle"]?.trim();
  const heroHeadline = isLoaded
    ? (!configuredHeadline || legacyHeroSubtitles.has(configuredHeadline.toLowerCase())
        ? siteSettingDefaults["home/banner/subtitle"]
        : configuredHeadline)
    : "...";
  const heroTitle = isLoaded ? getSettingValue(settings, "home/banner/title") : "...";
  const heroEyebrow = getSettingValue(settings, "home/banner/eyebrow");
  const supportingLineOne = getSettingValue(settings, "home/banner/supporting/line1");
  const supportingLineTwo = getSettingValue(settings, "home/banner/supporting/line2");
  const primaryCtaLabel = getSettingValue(settings, "home/banner/cta/primary/label");
  const primaryCtaHref = getSettingValue(settings, "home/banner/cta/primary/href");
  const secondaryCtaLabel = getSettingValue(settings, "home/banner/cta/secondary/label");
  const secondaryCtaHref = getSettingValue(settings, "home/banner/cta/secondary/href");
  const statusEnabledRaw = getSettingValue(settings, "home/status/enabled");
  const statusState = getSettingValue(settings, "home/status/state").toLowerCase();
  const configuredStatusLabel = getSettingValue(settings, "home/status/label");
  const configuredStatusMessage = getSettingValue(settings, "home/status/message");
  const statusCtaLabel = getSettingValue(settings, "home/status/cta/label");
  const statusCtaHref = getSettingValue(settings, "home/status/cta/href");
  const showStatusCta = statusEnabledRaw.trim().toLowerCase() !== "false";
  const displayStatusLabel = legacyStatusLabels.has(configuredStatusLabel.trim().toLowerCase())
    ? "Status: Available"
    : configuredStatusLabel;
  const displayStatusCtaLabel = statusCtaLabel.trim().toLowerCase() === "contact me" ? "Contact" : statusCtaLabel;
  const displayStatusMessage = legacyStatusMessages.has(configuredStatusMessage.trim().toLowerCase())
    ? "Looking to automate workflows or integrate APIs?"
    : configuredStatusMessage;
  const statusLedClass = statusState === "busy" ? "status-led status-led--busy" : "status-led status-led--available";

  return (
    <>
      <Head>
        <title>JRProgramming</title>
      </Head>
      <main className="min-h-screen px-4 py-10 md:px-6 md:py-16">
        <section className="mx-auto w-full max-w-5xl pb-8 pt-3 md:pt-4">
          {showStatusCta && (
            <div className={`mb-8 flex items-center gap-3 rounded-lg px-4 py-3 md:mb-9 ${statusState === "busy" ? "border border-amber-400/35 bg-amber-500/10" : "border border-emerald-400/35 bg-emerald-500/10"}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={statusLedClass} aria-hidden="true" />
                <p className={`hidden text-xs font-semibold uppercase tracking-[0.24em] sm:block ${statusState === "busy" ? "text-amber-200" : "text-emerald-200"}`}>
                  {displayStatusLabel}
                </p>
                <span className="hidden text-primary-text/50 sm:inline">|</span>
                <p className="text-sm leading-snug text-primary-text/90 sm:text-[15px]">{displayStatusMessage}</p>
              </div>

              <Link
                href={statusCtaHref}
                className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] transition ${statusState === "busy" ? "border border-amber-300/50 bg-amber-500/20 text-amber-100 hover:border-amber-200 hover:bg-amber-500/30" : "border border-emerald-300/50 bg-emerald-500/20 text-emerald-100 hover:border-emerald-200 hover:bg-emerald-500/30"}`}
              >
                {displayStatusCtaLabel}
              </Link>
            </div>
          )}

          <div className="terminal-card px-6 pb-8 pt-14 text-center md:px-10 md:pb-10 md:pt-16">
            <p className="mb-4 text-xs uppercase tracking-[0.38em] text-primary-accentLight/60">
              {heroEyebrow}
            </p>
            <p className="mb-2 w-full pl-1 text-left text-xs uppercase tracking-[0.22em] text-emerald-300/55 md:pl-3">
              {"> user: jrconway"}
            </p>
            <h1 className="mb-4 text-5xl font-extrabold gradient-text animate-gradient md:text-7xl">
              {heroTitle}
            </h1>
            <div className="mx-auto mb-6 h-[2px] w-64 bg-gradient-to-r from-transparent via-primary-accent to-transparent shadow-[0_0_10px_rgba(168,85,247,0.35)] md:w-72" aria-hidden="true" />
            <p className="mx-auto mb-6 max-w-4xl text-[1.5rem] font-semibold leading-[1.42] text-primary-text md:text-[2.15rem] md:leading-[1.48]">
              {heroHeadline}
            </p>
            <div className="mx-auto mb-8 max-w-3xl space-y-2 text-sm leading-7 text-primary-text/72 md:text-lg">
              <p>{supportingLineOne}</p>
              <p>{supportingLineTwo}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={primaryCtaHref}
                className="inline-block min-w-44 rounded-lg bg-primary-accent px-8 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-primary-accentDark"
              >
                {primaryCtaLabel}
              </a>
              <Link
                href={secondaryCtaHref}
                className="inline-block min-w-44 rounded-lg border border-primary-accent/25 bg-slate-950/35 px-8 py-3 text-center font-semibold text-primary-accentLight/80 transition hover:border-primary-accent/55 hover:bg-slate-950/60 hover:text-primary-accentLight"
              >
                {secondaryCtaLabel}
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
                <article key={service.title} className="rounded-xl border border-primary-accent/20 bg-slate-950/45 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-accentLight">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-300/85" aria-hidden="true" />
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.95] text-primary-text/68">{service.body}</p>
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
              <article className="rounded-xl border border-primary-accent/20 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Experience</p>
                <p className="mt-3 text-5xl font-black text-white md:text-[3.85rem]">{`${yearsExperience}+`}</p>
                <p className="mt-2 text-sm text-primary-text/55">Years building production systems</p>
              </article>

              <article className="rounded-xl border border-primary-accent/20 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Delivered Work</p>
                <p className="mt-3 text-5xl font-black text-white md:text-[3.85rem]">{totalProjectsDelivered}</p>
                <p className="mt-2 text-sm text-primary-text/55">Total projects and major implementations</p>
              </article>

              <article className="rounded-xl border border-primary-accent/20 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-accentLight">Automation/API Focus</p>
                <p className="mt-3 text-5xl font-black text-white md:text-[3.85rem]">{automationFocusedProjects}</p>
                <p className="mt-2 text-sm text-primary-text/55">Projects centered on automation, APIs, and CRM workflows</p>
              </article>
            </div>

            <div className="mt-8">
              <article className="mx-auto max-w-[58rem] rounded-xl border border-primary-accent/20 bg-slate-950/45 px-7 py-6 md:px-8">
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
              className="inline-block rounded-lg border border-primary-accent/40 bg-primary-accent px-8 py-3 font-semibold text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:border-emerald-300/60 hover:bg-primary-accentDark hover:shadow-[0_0_18px_rgba(74,222,128,0.32)]"
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
  const [featuredProjectsRaw, allProjectsRaw] = await Promise.all([
    prisma.project.findMany({
      where: {
        categories: {
          some: {
            category: {
              shortcode: "featured-projects",
            },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
          orderBy: { priority: "asc" },
        },
        categories: {
          include: {
            category: true,
          },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: [
        { end_date: { sort: "desc", nulls: "first" } },
        { start_date: "asc" },
      ],
      take: 4,
    }),
    prisma.project.findMany({
      select: {
        start_date: true,
        position: true,
        name: true,
        short: true,
        role: true,
        categories: {
          select: {
            category: {
              select: { shortcode: true },
            },
          },
        },
      },
    }),
  ]);

  const featuredProjects = JSON.parse(JSON.stringify(featuredProjectsRaw)) as Project[];

  type ProjectStats = {
    start_date?: string | null;
    position?: string | null;
    name: string;
    short: string;
    role?: string | null;
    categories: { category: { shortcode: string } }[];
  };

  const allProjects = JSON.parse(JSON.stringify(allProjectsRaw)) as ProjectStats[];

  const startYears = allProjects
    .map((project) => toYear(project.start_date))
    .filter((year): year is number => year !== null);
  const yearsExperience = calculateYearsExperience(startYears);

  const uniqueCompanies = Array.from(
    new Set(
      allProjects
        .map((project) => project.position?.trim())
        .filter((position): position is string => Boolean(position && position.length > 0))
        .filter((position) => !["Freelancer", "JR Programming"].includes(position)),
    ),
  );

  const companySet = new Set(uniqueCompanies.map((company) => company.toLowerCase()));
  const prioritizedCompanies = preferredCompanyNames.filter((company) => companySet.has(company.toLowerCase()));
  const fallbackCompanies = uniqueCompanies
    .filter((company) => !prioritizedCompanies.some((preferred) => preferred.toLowerCase() === company.toLowerCase()))
    .slice(0, 3);
  const displayedCompanies = [...prioritizedCompanies, ...fallbackCompanies].slice(0, 6);

  const totalProjectsDelivered = allProjects.length;
  const portfolioProjects = allProjects.filter((project) => (
    (project.categories ?? []).some((entry) => ["projects", "featured-projects"].includes(entry.category.shortcode))
  )).length;
  const automationFocusedProjects = allProjects.filter((project) => {
    const searchable = `${project.name} ${project.short} ${project.role ?? ""}`.toLowerCase();
    return ["automation", "api", "integration", "workflow", "crm"].some((keyword) => searchable.includes(keyword));
  }).length;

  return {
    props: {
      featuredProjects,
      yearsExperience,
      totalProjectsDelivered,
      automationFocusedProjects,
      portfolioProjects,
      displayedCompanies,
    },
  };
};
