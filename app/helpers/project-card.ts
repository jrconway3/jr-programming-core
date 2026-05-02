import type { Project } from "app/models/projects";

export type ProjectCardVariant = "project" | "experience";

export type ProjectCardView = {
  href: string;
  companyName: string | null;
  focusLabel: string;
  focusValue: string;
  ctaLabel: string;
};

export type ProjectWithCardView = Project & {
  card: ProjectCardView;
};

export function withProjectCardView(project: Project, variant: ProjectCardVariant = "project"): ProjectWithCardView {
  const isExperience = variant === "experience";

  return {
    ...project,
    card: {
      href: isExperience ? project.job_href : project.href,
      companyName: isExperience ? null : project.job?.company?.name ?? null,
      focusLabel: isExperience ? "Role" : "Built For",
      focusValue: project.position || project.role || "Client project",
      ctaLabel: isExperience ? "View project details" : "View case study",
    },
  };
}