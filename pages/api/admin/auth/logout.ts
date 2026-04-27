import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAdminSessionCookie } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';

type LogoutResponse = ApiEnvelope<{ success: true }>;

export default function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendApiError(res, 405, 'Method not allowed');
  }

  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  return sendApiSuccess(res, 200, { success: true });
}
