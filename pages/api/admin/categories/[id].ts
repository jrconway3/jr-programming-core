import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from '../../../../lib/admin-auth';
import { normalizeShortcode } from '../../../../lib/admin-categories';
import { prisma } from '../../../../prisma/adapter';

type CategoryResponse = {
  category?: {
    id: number;
    title: string;
    shortcode: string;
    created_at: string;
    updated_at: string;
    projectCount: number;
  };
  success?: boolean;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<CategoryResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  const rawId = req.query.id;

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return res.status(400).json({ error: 'Invalid category id.' });
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid category id.' });
  }

  if (req.method === 'PUT') {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const shortcode = normalizeShortcode(typeof req.body?.shortcode === 'string' ? req.body.shortcode : '');

    if (!title) {
      return res.status(400).json({ error: 'Category title is required.' });
    }

    if (!shortcode) {
      return res.status(400).json({ error: 'Category shortcode is required.' });
    }

    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          title,
          shortcode,
          updated_at: new Date(),
        },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      });

      return res.status(200).json({
        category: {
          id: category.id,
          title: category.title,
          shortcode: category.shortcode,
          created_at: category.created_at.toISOString(),
          updated_at: category.updated_at.toISOString(),
          projectCount: category._count.projects,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ error: 'That shortcode is already in use.' });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found.' });
      }

      console.error('PUT /api/admin/categories/[id] failed', error);
      return res.status(500).json({ error: 'Failed to update category.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.projectCategory.deleteMany({
          where: { category_id: id },
        });

        await tx.category.delete({
          where: { id },
        });
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found.' });
      }

      console.error('DELETE /api/admin/categories/[id] failed', error);
      return res.status(500).json({ error: 'Failed to delete category.' });
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
