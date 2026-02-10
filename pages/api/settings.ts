import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../prisma/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await prisma.settings.findMany();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
