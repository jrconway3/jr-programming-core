import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { transformAdminCategory } from 'app/transformers/categories';
import { normalizeShortcode } from 'app/services/admin/categories';
import { prisma } from 'prisma/adapter';

type CategoryResponse = ApiEnvelope<{ category: ReturnType<typeof transformAdminCategory> }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<CategoryResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendApiError(res, 405, 'Method not allowed');
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const shortcode = normalizeShortcode(typeof req.body?.shortcode === 'string' ? req.body.shortcode : '');

  if (!title) {
    return sendApiError(res, 400, 'Category title is required.');
  }

  if (!shortcode) {
    return sendApiError(res, 400, 'Category shortcode is required.');
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

    return sendApiSuccess(res, 201, {
      category: transformAdminCategory(category),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return sendApiError(res, 409, 'That shortcode is already in use.');
    }

    console.error('POST /api/admin/categories failed', error);
    return sendApiError(res, 500, 'Failed to create category.');
  }
}
