import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../prisma/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { shortcode } = req.query;
    if (typeof shortcode !== 'string') {
      return res.status(400).json({ error: 'Invalid shortcode' });
    }
    try {
      const category = await prisma.category.findUnique({
        where: { shortcode },
        select: { id: true, title: true, shortcode: true },
      });
      if (!category) return res.status(404).json({ error: 'Category not found' });
      res.status(200).json(category);
    } catch (error) {
      console.error('GET /api/categories/[shortcode] failed', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
