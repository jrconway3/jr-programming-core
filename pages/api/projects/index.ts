import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../prisma/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const shortcode = typeof req.query.shortcode === 'string' ? req.query.shortcode : undefined;
      const sortByDate = req.query.sort === 'date';
      const projects = await prisma.project.findMany({
        where: shortcode
          ? { categories: { some: { category: { shortcode } } } }
          : undefined,
        orderBy: sortByDate
          ? [
              { end_date: { sort: 'desc', nulls: 'first' } },
              { start_date: 'asc' },
            ]
          : undefined,
      });
      res.status(200).json(projects);
    } catch (error) {
      console.error('GET /api/projects failed', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
