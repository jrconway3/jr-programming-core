import type { NextApiRequest, NextApiResponse } from 'next';

const requiredDbEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

type PrismaInstance = typeof import('../../prisma/adapter').prisma;

function getMissingDbEnv(): string[] {
  return requiredDbEnv.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const missingEnv = getMissingDbEnv();
  if (missingEnv.length > 0) {
    return res.status(503).json({
      status: 'error',
      database: 'misconfigured',
      missingEnv,
      timestamp: new Date().toISOString(),
    });
  }

  let prisma: PrismaInstance | null = null;
  try {
    const adapter = await import('../../prisma/adapter');
    prisma = adapter.prisma;

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
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => undefined);
    }
  }
}
