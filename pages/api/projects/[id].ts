import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../prisma/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          links: { orderBy: { priority: 'asc' } },
          gallery: { orderBy: { priority: 'asc' } },
          skills: {
            include: { skill: true },
            orderBy: { priority: 'asc' },
          },
          categories: {
            include: { category: true },
            orderBy: { priority: 'asc' },
          },
        },
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.status(200).json(project);
    } catch (error) {
      console.error('GET /api/projects/[id] failed', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
