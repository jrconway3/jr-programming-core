import type { NextApiRequest, NextApiResponse } from 'next';
import {
  transformHealthMisconfigured,
  transformHealthOk,
  transformHealthUnavailable,
  type HealthRecord,
} from 'app/transformers/health';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';

const requiredDbEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

type PrismaInstance = typeof import('../../prisma/adapter').prisma;

function getMissingDbEnv(): string[] {
  return requiredDbEnv.filter((key) => !process.env[key] || process.env[key]?.trim() === '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendApiError(res, 405, 'Method not allowed');
  }

  const missingEnv = getMissingDbEnv();
  if (missingEnv.length > 0) {
    return sendApiSuccess(res as NextApiResponse<ApiEnvelope<HealthRecord>>, 503, transformHealthMisconfigured(missingEnv));
  }

  let prisma: PrismaInstance | null = null;
  try {
    const adapter = await import('../../prisma/adapter');
    prisma = adapter.prisma;

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    return sendApiSuccess(res as NextApiResponse<ApiEnvelope<HealthRecord>>, 200, transformHealthOk());
  } catch (error) {
    console.error('GET /api/health failed', error);

    return sendApiSuccess(
      res as NextApiResponse<ApiEnvelope<HealthRecord>>,
      503,
      transformHealthUnavailable(error instanceof Error ? error.message : 'Unknown error'),
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => undefined);
    }
  }
}
