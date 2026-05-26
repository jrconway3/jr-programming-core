import Link from "next/link";
import { toSecureAssetUrl } from "app/helpers/common";
import type { ProjectWithCardView } from "app/helpers/project-card";

interface Props {
  project: ProjectWithCardView;
}

export default function ProjectCard({ project }: Props) {
  const technologyPreview = project.preview_skills.length > 0 ? project.preview_skills : project.skills;
  const galleryImage = project.gallery?.[0]?.image ? toSecureAssetUrl(project.gallery[0].image) : null;

  return (
    <Link
      key={project.id}
      href={project.card.href}
      className={`terminal-card group relative flex flex-col h-full cursor-pointer transition-all duration-150 ease-out hover:scale-[1.01]${galleryImage ? " !pt-0" : ""}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent shadow-none transition-all duration-150 ease-out group-hover:border-emerald-300/50 group-hover:shadow-[0_0_10px_rgba(74,222,128,0.1)]"
      />

      {/* Image slot — bleeds to top edge by zeroing card padding-top */}
      {galleryImage && (
        <div className="h-[275px] overflow-hidden rounded-t-[9px] bg-slate-900 flex-shrink-0 relative">
          <img
            src={galleryImage}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Date tab — bleeds to right card border */}
      {project.date_range && (
        <span className="absolute right-0 top-10 z-10 whitespace-nowrap rounded-l-full border border-r-0 border-primary-accent/50 bg-slate-950/90 py-1 pl-3 pr-4 text-xs text-primary-text/65">
          {project.date_range}
        </span>
      )}

      {/* Card content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-5">
          <h3 className="text-2xl font-semibold text-primary-text transition group-hover:text-emerald-100">{project.name}</h3>
          {(project.role || project.card.companyName) && (
            <p className="mt-2 text-sm font-medium text-primary-accentLight">
              {project.role}
              {project.role && project.card.companyName ? " — " : ""}
              {project.card.companyName}
            </p>
          )}
        </div>

        <div className="flex flex-col flex-1 text-sm leading-[1.9] text-primary-text/80">
          <p>{project.short}</p>

          {technologyPreview.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Technologies</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {technologyPreview.map((skillEntry) => (
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

          <div className="mt-auto pt-4 text-sm font-semibold text-primary-accentLight underline-offset-4 transition group-hover:text-emerald-200 group-hover:underline group-hover:decoration-emerald-300">
            {project.card.ctaLabel} →
          </div>
        </div>
      </div>
    </Link>
  );
}
