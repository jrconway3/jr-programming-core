import type { HomePageMetrics, HomeProjectStatsEntry } from "app/models/home";

export function transformHomePageMetrics(allProjects: HomeProjectStatsEntry[], experienceStartYear: number): HomePageMetrics {
  const yearsExperience = Math.max(1, new Date().getUTCFullYear() - experienceStartYear);

  const uniqueCompanies = Array.from(
    new Set(
      allProjects
        .map((project) => project.position?.trim())
        .filter((position): position is string => Boolean(position && position.length > 0))
        .filter((position) => !["Freelancer", "JR Programming"].includes(position)),
    ),
  );

  const totalProjectsDelivered = allProjects.length;

  const automationFocusedProjects = allProjects.filter((project) => {
    const searchable = `${project.name} ${project.short} ${project.role ?? ""}`.toLowerCase();
    return ["automation", "api", "integration", "workflow", "crm"].some((keyword) => searchable.includes(keyword));
  }).length;

  return {
    yearsExperience,
    totalProjectsDelivered,
    automationFocusedProjects,
    displayedCompanies: uniqueCompanies.slice(0, 6),
  };
}
