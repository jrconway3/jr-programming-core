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
  const primaryRole = roles.find((role) => role.is_current)?.title ?? roleNames[0] ?? 'Role';
  const priorRoles = roleNames.filter((role) => role !== primaryRole);

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
  };
}
