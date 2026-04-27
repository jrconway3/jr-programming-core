import { buildDateRange } from 'app/helpers/common';
import type { Job } from 'app/models/jobs';
import type { Project } from 'app/models/projects';
import type { ExperiencePageDataInput, ExperiencePageData } from 'app/models/jobs';

function sortByStartDateDesc(a: Project, b: Project): number {
  const aTime = a.start_date ? new Date(a.start_date).getTime() : 0;
  const bTime = b.start_date ? new Date(b.start_date).getTime() : 0;
  return bTime - aTime;
}

function sortJobsByPriority(left: Job, right: Job): number {
  if (left.priority !== right.priority) {
    return left.priority - right.priority;
  }

  const leftStart = left.start_date ? new Date(left.start_date).getTime() : 0;
  const rightStart = right.start_date ? new Date(right.start_date).getTime() : 0;
  return rightStart - leftStart;
}

export function buildExperiencePageData({ projects, jobs }: ExperiencePageDataInput): ExperiencePageData {
  const primaryJobs = jobs
    .filter((job) => job.is_primary_tier)
    .sort(sortJobsByPriority);

  const earlierJobs = jobs
    .filter((job) => !job.is_primary_tier)
    .sort(sortJobsByPriority);

  const featuredJob = primaryJobs[0] ?? jobs[0] ?? null;
  const jobKeySystems = featuredJob?.keySystems ?? [];

  const featuredEntries = featuredJob
    ? (jobKeySystems.length > 0 ? jobKeySystems : projects.slice(0, 1))
    : projects.slice(0, 1);

  const featuredPrimary = featuredEntries[0] ?? null;
  const orderedRoles = featuredJob?.roles ?? [];
  const currentRole = orderedRoles.find((role) => role.is_current);

  const primaryRole = currentRole?.title
    ?? orderedRoles[0]?.title
    ?? featuredPrimary?.role
    ?? '';

  const priorRoles = orderedRoles
    .filter((role) => role.title !== primaryRole)
    .map((role) => role.title);

  const featuredStart = featuredJob?.start_date
    ?? featuredEntries
      .map((entry) => entry.start_date)
      .filter((value): value is string => Boolean(value))
      .sort()[0];

  const featuredEnd = featuredJob?.end_date
    ?? featuredEntries
      .map((entry) => entry.end_date)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1);

  const featuredDateRange = buildDateRange(featuredStart, featuredEnd);

  const featuredOrgLabel = featuredJob?.company?.name
    ?? featuredPrimary?.position
    ?? featuredPrimary?.name
    ?? '';

  const featuredOverview = featuredJob?.summary
    ?? featuredPrimary?.short
    ?? '';

  const keySystems = [...featuredEntries]
    .sort(sortByStartDateDesc)
    .map((entry) => ({
      id: entry.id,
      title: entry.name,
      description: entry.short,
      href: featuredJob?.shortcode && entry.shortcode
        ? `/experience/${featuredJob.shortcode}/${entry.shortcode}`
        : `/projects/${entry.id}`,
    }));

  const impactItems = (featuredJob?.impacts ?? [])
    .map((impact) => impact.description?.trim())
    .filter((summary): summary is string => Boolean(summary));

  const href = featuredJob?.shortcode ? `/experience/${featuredJob.shortcode}` : '/experience';

  return {
    earlierJobs,
    featuredPrimary,
    primaryRole,
    priorRoles,
    featuredDateRange,
    featuredOrgLabel,
    featuredOverview,
    keySystems,
    impactItems,
    href,
  };
}
