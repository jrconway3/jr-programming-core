import type { Job, JobTransformerInput } from 'app/models/jobs';
import { buildDateRange, toIsoDate } from 'app/helpers/common';

export function transformJob(job: JobTransformerInput): Job {
  const startDate = toIsoDate(job.start_date);
  const endDate = toIsoDate(job.end_date);
  const roles = job.roles.map((role) => ({
    id: role.id,
    title: role.title,
    short_summary: role.short_summary,
    start_date: toIsoDate(role.start_date),
    end_date: toIsoDate(role.end_date),
    priority: role.priority,
    is_current: role.is_current,
  }));
  const roleNames = roles.map((role) => role.title);
  const currentRole = roles.find((role) => role.is_current);
  const primaryRole = currentRole?.title ?? roleNames[0] ?? 'Role';
  const priorRoles = roleNames.filter((role) => role !== primaryRole);
  const displayCompanyLabel = job.company?.name ?? 'Company';
  const displaySummary = currentRole?.short_summary
    ?? roles[0]?.short_summary
    ?? job.summary
    ?? 'Additional details are available on this role page.';
  const href = job.shortcode ? `/experience/${job.shortcode}` : '/experience';

  return {
    id: job.id,
    shortcode: job.shortcode ?? null,
    is_primary_tier: job.is_primary_tier,
    summary: job.summary ?? null,
    start_date: startDate,
    end_date: endDate,
    priority: job.priority,
    company: job.company ? {
      id: job.company.id,
      name: job.company.name,
      shortcode: job.company.shortcode ?? null,
      website: job.company.website ?? null,
    } : null,
    roles,
    impacts: job.impacts,
    keySystems: job.keySystems,
    moreProjects: job.moreProjects,
    role_names: roleNames,
    primary_role: primaryRole,
    prior_roles: priorRoles,
    date_range: buildDateRange(startDate, endDate),
    all_projects: [...job.keySystems, ...job.moreProjects],
    display_company_label: displayCompanyLabel,
    display_summary: displaySummary,
    href,
  };
}
