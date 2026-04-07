import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from '../../../../lib/admin-auth';
import {
  adminProjectInclude,
  normalizeProjectPayload,
  serializeAdminProject,
} from '../../../../lib/admin-projects';
import { prisma } from '../../../../prisma/adapter';

type ProjectResponse = {
  project?: ReturnType<typeof serializeAdminProject>;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const normalized = normalizeProjectPayload(req.body);

  if (!normalized.ok) {
    return res.status(400).json({ error: normalized.error });
  }

  const { data } = normalized;
  const categoryIds = data.categories.map((category) => category.category_id);

  if (categoryIds.length > 0) {
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: { id: true },
    });

    if (existingCategories.length !== categoryIds.length) {
      return res.status(400).json({ error: 'One or more selected categories no longer exist.' });
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        short: data.short,
        role: data.role,
        position: data.position,
        extended: data.extended,
        start_date: data.start_date,
        end_date: data.end_date,
        links: {
          create: data.links,
        },
        gallery: {
          create: data.gallery.map((item) => ({
            ...item,
            link_id: null,
          })),
        },
        categories: {
          create: data.categories,
        },
      },
      include: adminProjectInclude,
    });

    return res.status(201).json({ project: serializeAdminProject(project) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ error: 'Unable to create project with the submitted data.' });
    }

    console.error('POST /api/admin/projects failed', error);
    return res.status(500).json({ error: 'Failed to create project.' });
  }
}
