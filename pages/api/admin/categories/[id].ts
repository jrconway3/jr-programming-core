import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { transformAdminCategory } from 'app/transformers/categories';
import { normalizeShortcode } from 'app/services/admin/categories';
import { prisma } from 'prisma/adapter';

type CategoryResponse = ApiEnvelope<{
  category?: ReturnType<typeof transformAdminCategory>;
  success?: boolean;
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<CategoryResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  const rawId = req.query.id;

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return sendApiError(res, 400, 'Invalid category id.');
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return sendApiError(res, 400, 'Invalid category id.');
  }

  if (req.method === 'PUT') {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const shortcode = normalizeShortcode(typeof req.body?.shortcode === 'string' ? req.body.shortcode : '');

    if (!title) {
      return sendApiError(res, 400, 'Category title is required.');
    }

    if (!shortcode) {
      return sendApiError(res, 400, 'Category shortcode is required.');
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

      return sendApiSuccess(res, 200, {
        category: transformAdminCategory(category),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return sendApiError(res, 409, 'That shortcode is already in use.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, 404, 'Category not found.');
      }

      console.error('PUT /api/admin/categories/[id] failed', error);
      return sendApiError(res, 500, 'Failed to update category.');
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

      return sendApiSuccess(res, 200, { success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, 404, 'Category not found.');
      }

      console.error('DELETE /api/admin/categories/[id] failed', error);
      return sendApiError(res, 500, 'Failed to delete category.');
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return sendApiError(res, 405, 'Method not allowed');
}
