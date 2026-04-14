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
  success?: boolean;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  const rawId = req.query.id;

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return res.status(400).json({ error: 'Invalid project id.' });
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid project id.' });
  }

  if (req.method === 'PUT') {
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
      const project = await prisma.$transaction(async (tx) => {
        await tx.project.update({
          where: { id },
          data: {
            name: data.name,
            short: data.short,
            role: data.role,
            position: data.position,
            extended: data.extended,
            start_date: data.start_date,
            end_date: data.end_date,
            updated_at: new Date(),
          },
        });

        await tx.projectGallery.deleteMany({
          where: { project_id: id },
        });

        await tx.projectCategory.deleteMany({
          where: { project_id: id },
        });

        await tx.projectLink.deleteMany({
          where: { project_id: id },
        });

        return tx.project.update({
          where: { id },
          data: {
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
            updated_at: new Date(),
          },
          include: adminProjectInclude,
        });
      });

      return res.status(200).json({ project: serializeAdminProject(project) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found.' });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ error: 'Unable to update project with the submitted data.' });
      }

      console.error('PUT /api/admin/projects/[id] failed', error);
      return res.status(500).json({ error: 'Failed to update project.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.projectGallery.deleteMany({
          where: { project_id: id },
        });

        await tx.projectCategory.deleteMany({
          where: { project_id: id },
        });

        await tx.projectSkill.deleteMany({
          where: { project_id: id },
        });

        await tx.projectLink.deleteMany({
          where: { project_id: id },
        });

        await tx.project.delete({
          where: { id },
        });
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found.' });
      }

      console.error('DELETE /api/admin/projects/[id] failed', error);
      return res.status(500).json({ error: 'Failed to delete project.' });
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
