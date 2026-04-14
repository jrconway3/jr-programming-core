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
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<CategoryResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const shortcode = normalizeShortcode(typeof req.body?.shortcode === 'string' ? req.body.shortcode : '');

  if (!title) {
    return res.status(400).json({ error: 'Category title is required.' });
  }

  if (!shortcode) {
    return res.status(400).json({ error: 'Category shortcode is required.' });
  }

  try {
    const category = await prisma.category.create({
      data: {
        title,
        shortcode,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return res.status(201).json({
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

    console.error('POST /api/admin/categories failed', error);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
}
