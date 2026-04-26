import { Prisma } from '@prisma/client';

export type AdminCategoryOption = {
  id: number;
  title: string;
  shortcode: string;
};

export type AdminProjectLinkRecord = {
  id: number;
  website: string;
  url: string;
  priority: number;
};

export type AdminProjectGalleryRecord = {
  id: number;
  title: string;
  image: string;
  priority: number;
};

export type AdminProjectCategoryRecord = {
  category_id: number;
  priority: number;
  category: AdminCategoryOption;
};

export type AdminProjectRecord = {
  id: number;
  name: string;
  shortcode: string | null;
  short: string;
  role: string | null;
  position: string | null;
  extended: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  links: AdminProjectLinkRecord[];
  gallery: AdminProjectGalleryRecord[];
  categories: AdminProjectCategoryRecord[];
  job: {
    relation_id: number;
    relation_type: string;
    relation_priority: number;
    job_id: number;
    summary: string | null;
    start_date: string | null;
    end_date: string | null;
    priority: number;
    company: {
      id: number;
      name: string;
      shortcode: string | null;
      website: string | null;
    } | null;
    roles: Array<{
      id: number;
      title: string;
      short_summary: string | null;
      start_date: string | null;
      end_date: string | null;
      priority: number;
      is_current: boolean;
    }>;
  } | null;
  skillsCount: number;
};

type NormalizedJobRoleInput = {
  title: string;
  short_summary: string | null;
  start_date: Date | null;
  end_date: Date | null;
  priority: number;
  is_current: boolean;
};

type NormalizedJobPayload = {
  id: number | null;
  summary: string | null;
  start_date: Date | null;
  end_date: Date | null;
  priority: number;
  company_id: number | null;
  company_name: string | null;
  company_shortcode: string | null;
  company_website: string | null;
  roles: NormalizedJobRoleInput[];
};

export type NormalizedJobAssignment = {
  job_id: number | null;
  relation_type: string;
  relation_priority: number;
  job_payload: NormalizedJobPayload | null;
};

export type NormalizedProjectInput = {
  name: string;
  shortcode: string | null;
  short: string;
  role: string | null;
  position: string | null;
  extended: string | null;
  start_date: Date | null;
  end_date: Date | null;
  links: Array<{
    website: string;
    url: string;
    priority: number;
  }>;
  gallery: Array<{
    title: string;
    image: string;
    priority: number;
  }>;
  categories: Array<{
    category_id: number;
    priority: number;
  }>;
  job_assignment: NormalizedJobAssignment | null;
};

export const adminProjectInclude = Prisma.validator<Prisma.ProjectInclude>()({
  links: {
    orderBy: { priority: 'asc' },
  },
  gallery: {
    orderBy: { priority: 'asc' },
  },
  categories: {
    include: {
      category: true,
    },
    orderBy: { priority: 'asc' },
  },
  _count: {
    select: {
      skills: true,
    },
  },
});

type AdminProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof adminProjectInclude;
}>;

type NormalizationResult =
  | { ok: true; data: NormalizedProjectInput }
  | { ok: false; error: string };

function parsePriority(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? '0'), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalInteger(value: unknown): number | null | 'invalid' {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : 'invalid';
}

function parseOptionalDate(value: unknown): Date | null | 'invalid' {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}-01T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? 'invalid' : parsed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? 'invalid' : parsed;
  }

  return 'invalid';
}

function isValidHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSafeGalleryImageSource(value: string): boolean {
  if (value.startsWith('/')) {
    return !value.startsWith('//') && !value.includes('\\');
  }

  return isValidHttpsUrl(value);
}

function normalizeShortcode(value: unknown): string | null | 'invalid' {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length < 3 || trimmed.length > 80) {
    return 'invalid';
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return 'invalid';
  }

  return trimmed;
}

export function normalizeProjectPayload(body: unknown): NormalizationResult {
  const input = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const shortcode = normalizeShortcode(input.shortcode);
  const short = typeof input.short === 'string' ? input.short.trim() : '';
  const role = typeof input.role === 'string' ? input.role.trim() : '';
  const position = typeof input.position === 'string' ? input.position.trim() : '';
  const extended = typeof input.extended === 'string' ? input.extended.trim() : '';
  const startDate = parseOptionalDate(input.start_date);
  const endDate = parseOptionalDate(input.end_date);

  if (!name) {
    return { ok: false, error: 'Project name is required.' };
  }

  if (!short) {
    return { ok: false, error: 'Project summary is required.' };
  }

  if (shortcode === 'invalid') {
    return { ok: false, error: 'Project shortcode must be 3-80 chars and use only lowercase letters, numbers, and hyphens.' };
  }

  if (startDate === 'invalid' || endDate === 'invalid') {
    return { ok: false, error: 'Project dates must use YYYY-MM or YYYY-MM-DD.' };
  }

  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    return { ok: false, error: 'Project end date must be after the start date.' };
  }

  const rawLinks = Array.isArray(input.links) ? input.links : [];
  const rawGallery = Array.isArray(input.gallery) ? input.gallery : [];
  const rawCategories = Array.isArray(input.categories) ? input.categories : [];

  const links: NormalizedProjectInput['links'] = [];

  for (const rawLink of rawLinks) {
    if (typeof rawLink !== 'object' || rawLink === null) {
      continue;
    }

    const link = rawLink as Record<string, unknown>;
    const website = typeof link.website === 'string' ? link.website.trim() : '';
    const url = typeof link.url === 'string' ? link.url.trim() : '';

    if (!website && !url) {
      continue;
    }

    if (!website || !url) {
      return { ok: false, error: 'Each project link needs both a label and a URL.' };
    }

    if (!isValidHttpsUrl(url)) {
      return { ok: false, error: 'Project links must use a valid https URL.' };
    }

    links.push({
      website,
      url,
      priority: parsePriority(link.priority),
    });
  }

  const gallery: NormalizedProjectInput['gallery'] = [];

  for (const rawItem of rawGallery) {
    if (typeof rawItem !== 'object' || rawItem === null) {
      continue;
    }

    const item = rawItem as Record<string, unknown>;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const image = typeof item.image === 'string' ? item.image.trim() : '';

    if (!title && !image) {
      continue;
    }

    if (!title || !image) {
      return { ok: false, error: 'Each gallery item needs both a title and an image URL.' };
    }

    if (!isSafeGalleryImageSource(image)) {
      return { ok: false, error: 'Gallery images must use an absolute path or a valid https URL.' };
    }

    gallery.push({
      title,
      image,
      priority: parsePriority(item.priority),
    });
  }

  const categoryMap = new Map<number, number>();

  for (const rawCategory of rawCategories) {
    if (typeof rawCategory !== 'object' || rawCategory === null) {
      continue;
    }

    const category = rawCategory as Record<string, unknown>;
    const categoryId = Number.parseInt(String(category.category_id ?? ''), 10);

    if (!Number.isInteger(categoryId)) {
      return { ok: false, error: 'Project categories must reference a valid category.' };
    }

    categoryMap.set(categoryId, parsePriority(category.priority));
  }

  const rawJobId = parseOptionalInteger(input.job_id);
  const relationPriority = parsePriority(input.job_relation_priority);
  const relationTypeRaw = typeof input.job_relation_type === 'string' ? input.job_relation_type.trim().toLowerCase() : '';
  const relationType = relationTypeRaw || 'key_system';

  if (rawJobId === 'invalid') {
    return { ok: false, error: 'Job assignment must reference a valid job id.' };
  }

  if (!/^[a-z_][a-z0-9_]*$/.test(relationType)) {
    return { ok: false, error: 'Job relation type must use lowercase letters, numbers, and underscores.' };
  }

  const rawJob = typeof input.job === 'object' && input.job !== null
    ? input.job as Record<string, unknown>
    : null;

  let normalizedJob: NormalizedJobPayload | null = null;

  if (rawJob) {
    const jobId = parseOptionalInteger(rawJob.id);
    const companyId = parseOptionalInteger(rawJob.company_id);
    const jobStartDate = parseOptionalDate(rawJob.start_date);
    const jobEndDate = parseOptionalDate(rawJob.end_date);

    if (jobId === 'invalid' || companyId === 'invalid') {
      return { ok: false, error: 'Job payload contains an invalid id.' };
    }

    if (jobStartDate === 'invalid' || jobEndDate === 'invalid') {
      return { ok: false, error: 'Job dates must use YYYY-MM or YYYY-MM-DD.' };
    }

    if (jobStartDate && jobEndDate && jobStartDate.getTime() > jobEndDate.getTime()) {
      return { ok: false, error: 'Job end date must be after the start date.' };
    }

    const companyName = typeof rawJob.company_name === 'string' ? rawJob.company_name.trim() : '';
    const companyWebsite = typeof rawJob.company_website === 'string' ? rawJob.company_website.trim() : '';
    const companyShortcode = normalizeShortcode(rawJob.company_shortcode);

    if (companyShortcode === 'invalid') {
      return { ok: false, error: 'Company shortcode must be 3-80 chars and use only lowercase letters, numbers, and hyphens.' };
    }

    if (companyWebsite && !isValidHttpsUrl(companyWebsite)) {
      return { ok: false, error: 'Company website must use a valid https URL.' };
    }

    const rawRoles = Array.isArray(rawJob.roles) ? rawJob.roles : [];
    const roles: NormalizedJobRoleInput[] = [];

    for (const rawRole of rawRoles) {
      if (typeof rawRole !== 'object' || rawRole === null) {
        continue;
      }

      const role = rawRole as Record<string, unknown>;
      const title = typeof role.title === 'string' ? role.title.trim() : '';
      const shortSummary = typeof role.short_summary === 'string' ? role.short_summary.trim() : '';
      const roleStartDate = parseOptionalDate(role.start_date);
      const roleEndDate = parseOptionalDate(role.end_date);

      if (!title) {
        return { ok: false, error: 'Each job role must include a title.' };
      }

      if (roleStartDate === 'invalid' || roleEndDate === 'invalid') {
        return { ok: false, error: 'Job role dates must use YYYY-MM or YYYY-MM-DD.' };
      }

      if (roleStartDate && roleEndDate && roleStartDate.getTime() > roleEndDate.getTime()) {
        return { ok: false, error: 'Job role end date must be after the start date.' };
      }

      roles.push({
        title,
        short_summary: shortSummary || null,
        start_date: roleStartDate,
        end_date: roleEndDate,
        priority: parsePriority(role.priority),
        is_current: Boolean(role.is_current),
      });
    }

    normalizedJob = {
      id: jobId,
      summary: typeof rawJob.summary === 'string' ? (rawJob.summary.trim() || null) : null,
      start_date: jobStartDate,
      end_date: jobEndDate,
      priority: parsePriority(rawJob.priority),
      company_id: companyId,
      company_name: companyName || null,
      company_shortcode: companyShortcode || null,
      company_website: companyWebsite || null,
      roles,
    };
  }

  const jobAssignment = rawJobId || normalizedJob
    ? {
      job_id: rawJobId,
      relation_type: relationType,
      relation_priority: relationPriority,
      job_payload: normalizedJob,
    }
    : null;

  return {
    ok: true,
    data: {
      name,
      shortcode,
      short,
      role: role || null,
      position: position || null,
      extended: extended || null,
      start_date: startDate,
      end_date: endDate,
      links,
      gallery,
      categories: Array.from(categoryMap.entries()).map(([category_id, priority]) => ({
        category_id,
        priority,
      })),
      job_assignment: jobAssignment,
    },
  };
}

export function serializeAdminProject(project: AdminProjectWithRelations): AdminProjectRecord {
  const projectExtras = project as unknown as {
    shortcode?: string | null;
    job?: Array<{
      id: number;
      relation_type: string;
      priority: number;
      job: {
        id: number;
        summary: string | null;
        start_date: Date | null;
        end_date: Date | null;
        priority: number;
        company: {
          id: number;
          name: string;
          shortcode: string | null;
          website: string | null;
        } | null;
        roles: Array<{
          id: number;
          title: string;
          short_summary: string | null;
          start_date: Date | null;
          end_date: Date | null;
          priority: number;
          is_current: boolean;
        }>;
      };
    }>;
  };
  const jobRelation = projectExtras.job?.[0] ?? null;

  return {
    id: project.id,
    name: project.name,
    shortcode: projectExtras.shortcode ?? null,
    short: project.short,
    role: project.role,
    position: project.position,
    extended: project.extended,
    start_date: project.start_date ? project.start_date.toISOString() : null,
    end_date: project.end_date ? project.end_date.toISOString() : null,
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
    links: project.links.map((link) => ({
      id: link.id,
      website: link.website,
      url: link.url,
      priority: link.priority,
    })),
    gallery: project.gallery.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      priority: item.priority,
    })),
    categories: project.categories.map((categoryEntry) => ({
      category_id: categoryEntry.category_id,
      priority: categoryEntry.priority,
      category: {
        id: categoryEntry.category.id,
        title: categoryEntry.category.title,
        shortcode: categoryEntry.category.shortcode,
      },
    })),
    job: jobRelation ? {
      relation_id: jobRelation.id,
      relation_type: jobRelation.relation_type,
      relation_priority: jobRelation.priority,
      job_id: jobRelation.job.id,
      summary: jobRelation.job.summary,
      start_date: jobRelation.job.start_date ? jobRelation.job.start_date.toISOString() : null,
      end_date: jobRelation.job.end_date ? jobRelation.job.end_date.toISOString() : null,
      priority: jobRelation.job.priority,
      company: jobRelation.job.company ? {
        id: jobRelation.job.company.id,
        name: jobRelation.job.company.name,
        shortcode: jobRelation.job.company.shortcode,
        website: jobRelation.job.company.website,
      } : null,
      roles: jobRelation.job.roles.map((roleEntry) => ({
        id: roleEntry.id,
        title: roleEntry.title,
        short_summary: roleEntry.short_summary,
        start_date: roleEntry.start_date ? roleEntry.start_date.toISOString() : null,
        end_date: roleEntry.end_date ? roleEntry.end_date.toISOString() : null,
        priority: roleEntry.priority,
        is_current: roleEntry.is_current,
      })),
    } : null,
    skillsCount: project._count.skills,
  };
}
