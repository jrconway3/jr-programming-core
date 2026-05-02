import Link from "next/link";
import type { ProjectWithCardView } from "app/helpers/project-card";

interface Props {
  project: ProjectWithCardView;
}

export default function ProjectCard({ project }: Props) {

  return (
    <Link
      key={project.id}
      href={project.card.href}
      className="terminal-card group relative block cursor-pointer p-6 transition-all duration-150 ease-out hover:scale-[1.01]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent shadow-none transition-all duration-150 ease-out group-hover:border-emerald-300/50 group-hover:shadow-[0_0_10px_rgba(74,222,128,0.1)]"
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-primary-text transition group-hover:text-emerald-100">{project.name}</h3>
          {(project.role || project.card.companyName) && (
            <p className="mt-2 text-sm font-medium text-primary-accentLight">
              {project.role}
              {project.role && project.card.companyName ? " · " : ""}
              {project.card.companyName}
            </p>
          )}
        </div>

        {project.date_range && (
          <span className="whitespace-nowrap rounded-full border border-primary-accent/40 bg-primary-accent/8 px-3 py-1 text-xs text-primary-text/75 shadow-[0_0_10px_rgba(168,85,247,0.12)]">
            {project.date_range}
          </span>
        )}
      </div>

      <div className="space-y-7 text-sm leading-[1.9] text-primary-text/80">
        <div>
          <p>{project.short}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">{project.card.focusLabel}</p>
            <p className="mt-3 text-primary-text/75">{project.card.focusValue}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Focus</p>
            <p className="mt-3 text-primary-text/75">{project.role || "Web application development"}</p>
          </div>
        </div>

        {project.skills.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Technologies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.map((skillEntry) => (
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

        <div className="pt-2 text-sm font-semibold text-primary-accentLight underline-offset-4 transition group-hover:text-emerald-200 group-hover:underline group-hover:decoration-emerald-300">{project.card.ctaLabel}</div>
      </div>
    </Link>
  );
}