import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../prisma/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/health failed', error);

    return res.status(503).json({
      status: 'error',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}
