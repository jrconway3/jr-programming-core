import Link from "next/link";
import { Project } from "models/projects";
import { buildDateRange } from "models/projects";

interface Props {
  project: Project;
  variant?: "project" | "experience";
}

export default function ProjectCard({ project, variant = "project" }: Props) {
  const dateRange = buildDateRange(project.start_date, project.end_date);
  const experienceProjectHref = project.job?.shortcode && project.shortcode
    ? `/experience/${project.job.shortcode}/${project.shortcode}`
    : `/projects/${project.id}`;
  const projectHref = `/projects/${project.id}`;
  const skills = project.skills.slice(0, 4);
  const categories = project.categories;

  if (variant === "experience") {
    return (
      <Link
        key={project.id}
        href={experienceProjectHref}
        className="terminal-card block cursor-pointer p-6 transition-all duration-150 ease-out hover:scale-[1.01] hover:!border-emerald-300/50 hover:!shadow-[0_0_10px_rgba(74,222,128,0.1)]"
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary-accentLight">Work History</p>
            <h3 className="mt-2 text-2xl font-semibold text-primary-text">{project.name}</h3>
            {project.role && (
              <p className="mt-2 text-sm font-medium text-primary-accentLight">{project.role}</p>
            )}
            {project.position && (
              <p className="mt-1 text-sm text-primary-text/70">{project.position}</p>
            )}
          </div>

          {dateRange && (
            <span className="whitespace-nowrap rounded-full border border-primary-accent/25 px-3 py-1 text-xs text-primary-text/65">{dateRange}</span>
          )}
        </div>

        <div className="space-y-3 text-sm leading-7 text-primary-text/80">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Role Summary</p>
            <p className="mt-2">{project.short}</p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category.shortcode}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-text/60"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      key={project.id}
      href={projectHref}
      className="terminal-card group relative block cursor-pointer p-6 transition-all duration-150 ease-out hover:scale-[1.01]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent shadow-none transition-all duration-150 ease-out group-hover:border-emerald-300/50 group-hover:shadow-[0_0_10px_rgba(74,222,128,0.1)]"
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-primary-accentLight">Case Study</p>
          <h3 className="mt-2 text-2xl font-semibold text-primary-text transition group-hover:text-emerald-100">{project.name}</h3>
        </div>

        {dateRange && (
          <span className="whitespace-nowrap rounded-full border border-primary-accent/40 bg-primary-accent/8 px-3 py-1 text-xs text-primary-text/75 shadow-[0_0_10px_rgba(168,85,247,0.12)]">{dateRange}</span>
        )}
      </div>

      <div className="space-y-7 text-sm leading-[1.9] text-primary-text/80">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">What It Does</p>
          <p className="mt-4">{project.short}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Built For</p>
            <p className="mt-3 text-primary-text/75">{project.position || project.role || "Client project"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Focus</p>
            <p className="mt-3 text-primary-text/75">{project.role || "Web application development"}</p>
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Technologies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skillEntry) => (
                <span
                  key={skillEntry.id}
                  className="rounded-full border border-primary-accent/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-accentLight"
                >
                  {skillEntry.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-sm font-semibold text-primary-accentLight underline-offset-4 transition group-hover:text-emerald-200 group-hover:underline group-hover:decoration-emerald-300">View case study</div>
      </div>
    </Link>
  );
}