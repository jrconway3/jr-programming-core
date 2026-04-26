import type { Project, ProjectTransformerInput } from 'app/models/projects';
import { buildDateRange, toIsoDate, toIsoRequired } from '../helpers/common';

export function transformProject(project: ProjectTransformerInput): Project {
  const relation = project.job?.[0] ?? null;
  const href = `/projects/${project.id}`;
  const jobHref = relation?.job.shortcode && project.shortcode
    ? `/experience/${relation.job.shortcode}/${project.shortcode}`
    : href;
  const startDate = toIsoDate(project.start_date);
  const endDate = toIsoDate(project.end_date);

  const skills = project.skills.map(({ priority, skill }) => ({
    id: skill.id,
    priority,
    name: skill.name,
    desc: skill.desc,
    rating: skill.rating,
  }));

  return {
    id: project.id,
    name: project.name,
    shortcode: project.shortcode ?? null,
    short: project.short,
    role: project.role,
    position: project.position,
    extended: project.extended,
    start_date: startDate,
    end_date: endDate,
    created_at: toIsoRequired(project.created_at),
    updated_at: toIsoRequired(project.updated_at),
    skills,
    preview_skills: skills.slice(0, 4),
    categories: project.categories.map(({ priority, category }) => ({
      id: category.id,
      priority,
      title: category.title,
      shortcode: category.shortcode,
    })),
    job: relation ? {
      relation_id: relation.id,
      relation_type: relation.relation_type,
      relation_priority: relation.priority,
      id: relation.job.id,
      shortcode: relation.job.shortcode ?? null,
      summary: relation.job.summary ?? null,
      start_date: toIsoDate(relation.job.start_date),
      end_date: toIsoDate(relation.job.end_date),
      priority: relation.job.priority,
      company: relation.job.company ? {
        id: relation.job.company.id,
        name: relation.job.company.name,
        shortcode: relation.job.company.shortcode ?? null,
        website: relation.job.company.website ?? null,
      } : null,
      roles: relation.job.roles.map((role) => ({
        id: role.id,
        title: role.title,
        short_summary: role.short_summary ?? null,
        start_date: toIsoDate(role.start_date),
        end_date: toIsoDate(role.end_date),
        priority: role.priority,
        is_current: role.is_current,
      })),
      impacts: relation.job.impacts.map((impact) => ({
        id: impact.id,
        description: impact.description,
        priority: impact.priority,
      })),
    } : null,
    links: (project.links ?? []).map((link) => ({
      id: link.id,
      website: link.website,
      url: link.url,
      priority: link.priority,
    })),
    gallery: (project.gallery ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      priority: item.priority,
    })),
    date_range: buildDateRange(startDate, endDate),
    href: href,
    job_href: jobHref,
  };
}

export function transformProjects(projects: ProjectTransformerInput[]): Project[] {
  return projects.map((project) => transformProject(project));
}
