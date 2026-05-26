import { Prisma } from '@prisma/client';
import { prisma } from 'prisma/adapter';
import type { Project, ProjectDetail } from 'app/models/projects';
import type { Category } from 'app/models/categories';
import type { HomeProjectStatsEntry } from 'app/models/home';
import type { NormalizedJobAssignment } from 'app/services/admin/projects';
import {
  transformProject,
  transformProjects,
} from 'app/transformers/projects';
import { transformJob } from 'app/transformers/jobs';
import type { Job, PrismaExperienceFacade, JobRow } from 'app/models/jobs';

const jobRoleOrder = [
  { priority: 'asc' as const },
  { start_date: 'asc' as const },
];

const projectCoreInclude = {
  skills: {
    include: { skill: true },
    orderBy: { priority: 'asc' },
  },
  categories: {
    include: { category: true },
    orderBy: { priority: 'asc' },
  },
} as const;

const projectWithRelationsInclude = {
  ...projectCoreInclude,
  job: {
    take: 1,
    orderBy: { priority: 'asc' },
    include: {
      job: {
        include: {
          company: true,
          roles: {
            orderBy: jobRoleOrder,
          },
          impacts: {
            orderBy: { priority: 'asc' },
          },
        },
      },
    },
  },
} as const;

const projectWithFullInclude = {
  ...projectWithRelationsInclude,
  skills: {
    include: { skill: true },
    orderBy: { priority: 'asc' },
  },
  categories: {
    include: { category: true },
    orderBy: { priority: 'asc' },
  },
} as const;

const dateOrder = [
  { end_date: { sort: 'desc' as const, nulls: 'first' as const } },
  { start_date: 'asc' as const },
];

async function fetchProjectGalleryBridges(id: number, take?: number) {
  return prisma.galleryBridge.findMany({
    where: { relation_type: 'project', relation_id: id },
    include: { gallery: true },
    orderBy: { priority: 'asc' },
    ...(take ? { take } : {}),
  });
}

async function fetchProjectLinkBridges(id: number) {
  return prisma.linkBridge.findMany({
    where: { relation_type: 'project', relation_id: id },
    include: { link: true },
    orderBy: { priority: 'asc' },
  });
}

async function batchFetchGalleryBridges(ids: number[]) {
  if (ids.length === 0) return new Map<number, Array<{ gallery: { id: number; title: string; image: string; priority: number } }>>();
  const bridges = await prisma.galleryBridge.findMany({
    where: { relation_type: 'project', relation_id: { in: ids } },
    include: { gallery: true },
    orderBy: { priority: 'asc' },
  });
  const byProject = new Map<number, typeof bridges>();
  for (const b of bridges) {
    const arr = byProject.get(b.relation_id) ?? [];
    arr.push(b);
    byProject.set(b.relation_id, arr);
  }
  return byProject;
}

async function mapJob(
  job: JobRow,
): Promise<Job> {
  const keySystemRelations = job.project_relations
    .filter((relation) => relation.relation_type === 'key_system')
    .sort((left, right) => left.priority - right.priority);

  const nonKeySystemRelations = job.project_relations
    .filter((relation) => relation.relation_type !== 'key_system')
    .sort((left, right) => left.priority - right.priority);

  const keySystems = transformProjects(keySystemRelations.map((relation) => relation.project));
  const keySystemIds = new Set(keySystems.map((project) => project.id));
  const moreProjects = transformProjects(nonKeySystemRelations.map((relation) => relation.project))
    .filter((project) => !keySystemIds.has(project.id));

  return JSON.parse(JSON.stringify(transformJob({
    id: job.id,
    shortcode: job.shortcode,
    is_primary_tier: job.is_primary_tier,
    summary: job.summary,
    start_date: job.start_date,
    end_date: job.end_date,
    priority: job.priority,
    company: job.company,
    roles: job.roles,
    impacts: job.impacts,
    keySystems,
    moreProjects,
  }))) as Job;
}

export async function getProjectsByShortcode(shortcode: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { categories: { some: { category: { shortcode } } } },
    include: projectWithRelationsInclude,
    orderBy: dateOrder,
  });
  const byProject = await batchFetchGalleryBridges(rows.map((r) => r.id));
  return transformProjects(rows.map((r) => ({
    ...r,
    gallery: (byProject.get(r.id) ?? []).map((b) => b.gallery),
  })));
}

export async function getFeaturedProjects(take = 4): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { categories: { some: { category: { shortcode: 'featured-projects' } } } },
    include: projectWithRelationsInclude,
    orderBy: dateOrder,
    take,
  });
  const byProject = await batchFetchGalleryBridges(rows.map((r) => r.id));
  return transformProjects(rows.map((r) => ({
    ...r,
    gallery: (byProject.get(r.id) ?? []).map((b) => b.gallery),
  })));
}

export async function getAllProjectStats(): Promise<HomeProjectStatsEntry[]> {
  const rows = await prisma.project.findMany({
    select: {
      start_date: true,
      position: true,
      name: true,
      short: true,
      role: true,
      categories: {
        select: { category: { select: { shortcode: true } } },
      },
    },
  });
  // Dates from a select query are already plain values after JSON serialization
  return JSON.parse(JSON.stringify(rows));
}

export async function getProjectById(id: number): Promise<ProjectDetail | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    include: projectWithFullInclude,
  });
  if (!row) return null;
  const [galleryBridges, linkBridges] = await Promise.all([
    fetchProjectGalleryBridges(id),
    fetchProjectLinkBridges(id),
  ]);
  return transformProject({
    ...row,
    gallery: galleryBridges.map((b) => b.gallery),
    links: linkBridges.map((b) => b.link),
  });
}

export async function getCategoryByShortcode(shortcode: string): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { shortcode },
    select: { id: true, title: true, shortcode: true, show_in_filter: true },
  });
}

export async function getFilterCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { show_in_filter: true },
    select: { id: true, title: true, shortcode: true, show_in_filter: true },
    orderBy: { title: 'asc' },
  });
  return rows;
}

export async function getAdjacentProjectsByCategory(
  id: number,
  categoryShortcode: string,
): Promise<{ prev: { href: string; name: string } | null; next: { href: string; name: string } | null }> {
  const rows = await prisma.project.findMany({
    where: { categories: { some: { category: { shortcode: categoryShortcode } } } },
    select: { id: true, name: true },
    orderBy: dateOrder,
  });
  const idx = rows.findIndex((r) => r.id === id);
  const toRef = (r: typeof rows[0] | undefined) =>
    r ? { href: `/projects/${r.id}`, name: r.name } : null;
  return { prev: toRef(rows[idx - 1]), next: toRef(rows[idx + 1]) };
}

export async function getJobs(): Promise<Job[]> {
  const prismaWithJobs = prisma as unknown as PrismaExperienceFacade;

  const jobs = await prismaWithJobs.job.findMany({
    include: {
      company: true,
      roles: {
        orderBy: jobRoleOrder,
      },
      impacts: {
        orderBy: { priority: 'asc' },
      },
      project_relations: {
        orderBy: { priority: 'asc' },
        include: {
          project: {
            include: projectWithRelationsInclude,
          },
        },
      },
    },
    orderBy: [
      { is_primary_tier: 'desc' },
      { priority: 'asc' },
      { end_date: { sort: 'desc', nulls: 'first' } },
      { start_date: 'asc' },
    ],
  });

  const entries = await Promise.all(jobs.map((job) => mapJob(job)));

  return entries;
}

export async function getJobByShortcode(shortcode: string): Promise<Job | null> {
  const prismaWithJobs = prisma as unknown as PrismaExperienceFacade;

  const job = await prismaWithJobs.job.findUnique({
    where: { shortcode },
    include: {
      company: true,
      roles: {
        orderBy: jobRoleOrder,
      },
      impacts: {
        orderBy: { priority: 'asc' },
      },
      project_relations: {
        orderBy: { priority: 'asc' },
        include: {
          project: {
            include: projectWithRelationsInclude,
          },
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  return mapJob(job);
}

export async function getExperienceProjectByShortcodes(
  jobShortcode: string,
  projectShortcode: string,
): Promise<ProjectDetail | null> {
  const prismaWithJobs = prisma as unknown as PrismaExperienceFacade;

  const row = await prismaWithJobs.project.findFirst({
    where: {
      shortcode: projectShortcode,
      job: {
        some: {
          job: {
            shortcode: jobShortcode,
          },
        },
      },
    },
    include: projectWithFullInclude,
  });

  if (!row) {
    return null;
  }

  const [galleryBridges, linkBridges] = await Promise.all([
    fetchProjectGalleryBridges(row.id),
    fetchProjectLinkBridges(row.id),
  ]);
  return transformProject({
    ...row,
    gallery: galleryBridges.map((b) => b.gallery),
    links: linkBridges.map((b) => b.link),
  });
}

export async function resolveJobIdForAssignment(
  tx: Prisma.TransactionClient,
  assignment: NormalizedJobAssignment | null,
): Promise<number | null> {
  if (!assignment) {
    return null;
  }

  let resolvedJobId = assignment.job_id;

  if (!assignment.job_payload) {
    return resolvedJobId;
  }

  const now = new Date();
  const jobPayload = assignment.job_payload;
  let companyId = jobPayload.company_id;

  if (!companyId && jobPayload.company_name) {
    const existingCompany = await tx.company.findUnique({
      where: { name: jobPayload.company_name },
      select: { id: true },
    });

    if (existingCompany) {
      companyId = existingCompany.id;

      await tx.company.update({
        where: { id: companyId },
        data: {
          shortcode: jobPayload.company_shortcode,
          website: jobPayload.company_website,
          updated_at: now,
        },
      });
    } else {
      const company = await tx.company.create({
        data: {
          name: jobPayload.company_name,
          shortcode: jobPayload.company_shortcode,
          website: jobPayload.company_website,
        },
        select: { id: true },
      });

      companyId = company.id;
    }
  }

  if (resolvedJobId == null) {
    resolvedJobId = jobPayload.id;
  }

  const roleRows = jobPayload.roles.map((role, index) => ({
    title: role.title,
    short_summary: role.short_summary,
    start_date: role.start_date,
    end_date: role.end_date,
    priority: Number.isInteger(role.priority) ? role.priority : index,
    is_current: role.is_current,
  }));

  if (resolvedJobId == null) {
    const createdJob = await tx.job.create({
      data: {
        company_id: companyId,
        summary: jobPayload.summary,
        start_date: jobPayload.start_date,
        end_date: jobPayload.end_date,
        priority: jobPayload.priority,
        roles: {
          create: roleRows,
        },
      },
      select: { id: true },
    });

    return createdJob.id;
  }

  await tx.job.update({
    where: { id: resolvedJobId },
    data: {
      company_id: companyId,
      summary: jobPayload.summary,
      start_date: jobPayload.start_date,
      end_date: jobPayload.end_date,
      priority: jobPayload.priority,
      updated_at: now,
    },
  });

  await tx.jobRole.deleteMany({
    where: { job_id: resolvedJobId },
  });

  if (roleRows.length > 0) {
    await tx.jobRole.createMany({
      data: roleRows.map((role) => ({
        ...role,
        job_id: resolvedJobId as number,
      })),
    });
  }

  return resolvedJobId;
}