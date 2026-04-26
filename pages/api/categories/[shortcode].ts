import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../prisma/adapter';
import { transformCategory } from 'app/transformers/categories';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';

type CategoryResponse = ApiEnvelope<ReturnType<typeof transformCategory>>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<CategoryResponse>) {
  if (req.method === 'GET') {
    const { shortcode } = req.query;
    if (typeof shortcode !== 'string') {
      return sendApiError(res, 400, 'Invalid shortcode');
    }
    try {
      const category = await prisma.category.findUnique({
        where: { shortcode },
        select: { id: true, title: true, shortcode: true },
      });
      if (!category) return sendApiError(res, 404, 'Category not found');
      return sendApiSuccess(res, 200, transformCategory(category));
    } catch (error) {
      console.error('GET /api/categories/[shortcode] failed', error);
      return sendApiError(res, 500, 'Failed to fetch category');
    }
  } else {
    return sendApiError(res, 405, 'Method not allowed');
  }
}
