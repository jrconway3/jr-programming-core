import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'prisma/adapter';
import { transformSettings } from 'app/transformers/settings';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';

type SettingsResponse = ApiEnvelope<ReturnType<typeof transformSettings>>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<SettingsResponse>) {
  if (req.method === 'GET') {
    try {
      const settings = await prisma.settings.findMany();
      return sendApiSuccess(res, 200, transformSettings(settings));
    } catch (error) {
      console.error('GET /api/settings failed', error);
      return sendApiError(res, 500, 'Failed to fetch settings');
    }
  } else {
    return sendApiError(res, 405, 'Method not allowed');
  }
}
