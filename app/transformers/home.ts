import type { HomePageMetrics, HomeProjectStatsEntry } from "app/models/home";

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

export function transformHomePageMetrics(allProjects: HomeProjectStatsEntry[]): HomePageMetrics {
  const startYears = allProjects
    .map((project) => toYear(project.start_date))
    .filter((year): year is number => year !== null);

  const uniqueCompanies = Array.from(
    new Set(
      allProjects
        .map((project) => project.position?.trim())
        .filter((position): position is string => Boolean(position && position.length > 0))
        .filter((position) => !["Freelancer", "JR Programming"].includes(position)),
    ),
  );

  const totalProjectsDelivered = allProjects.length;
  const portfolioProjects = allProjects.filter((project) => (
    (project.categories ?? []).some((entry) => ["projects", "featured-projects"].includes(entry.category.shortcode))
  )).length;

  const automationFocusedProjects = allProjects.filter((project) => {
    const searchable = `${project.name} ${project.short} ${project.role ?? ""}`.toLowerCase();
    return ["automation", "api", "integration", "workflow", "crm"].some((keyword) => searchable.includes(keyword));
  }).length;

  return {
    yearsExperience: calculateYearsExperience(startYears),
    totalProjectsDelivered,
    automationFocusedProjects,
    portfolioProjects,
    displayedCompanies: uniqueCompanies.slice(0, 6),
  };
}
