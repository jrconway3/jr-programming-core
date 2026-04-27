import type { NextApiRequest, NextApiResponse } from 'next';
import {
  transformHealthMisconfigured,
  transformHealthOk,
  transformHealthUnavailable,
} from 'app/transformers/health';
import { sendApiError, sendApiSuccess } from 'app/helpers/response';

const requiredDbEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

type PrismaInstance = typeof import('prisma/adapter').prisma;

function getMissingDbEnv(): string[] {
  return requiredDbEnv.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendApiError(res, 405, 'Method not allowed');
  }

  const missingEnv = getMissingDbEnv();
  if (missingEnv.length > 0) {
    const health = transformHealthMisconfigured(missingEnv);
    return sendApiError(res, 503, 'Database configuration is incomplete.', undefined, health);
  }

  let prisma: PrismaInstance | null = null;
  try {
    const adapter = await import('prisma/adapter');
    prisma = adapter.prisma;

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    return sendApiSuccess(res, 200, transformHealthOk());
  } catch (error) {
    console.error('GET /api/health failed', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    const health = transformHealthUnavailable(message);
    return sendApiError(res, 503, 'Database is unavailable.', undefined, health);
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => undefined);
    }
  }
}
