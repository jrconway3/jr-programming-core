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
  skillsCount: number;
};

export type NormalizedProjectInput = {
  name: string;
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

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeProjectPayload(body: unknown): NormalizationResult {
  const input = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
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

    if (!isValidHttpUrl(url)) {
      return { ok: false, error: 'Project links must use a valid http or https URL.' };
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

  return {
    ok: true,
    data: {
      name,
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
    },
  };
}

export function serializeAdminProject(project: AdminProjectWithRelations): AdminProjectRecord {
  return {
    id: project.id,
    name: project.name,
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
    skillsCount: project._count.skills,
  };
}
