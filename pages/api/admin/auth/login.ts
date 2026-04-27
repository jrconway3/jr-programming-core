import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createAdminSessionCookie,
  getAdminSession,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';

type LoginResponse = ApiEnvelope<{ next: string }>;

export default function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendApiError(res, 405, 'Method not allowed');
  }

  const existingSession = getAdminSession(req);

  if (existingSession) {
    return sendApiSuccess(res, 200, { next: sanitizeAdminNextPath(req.body?.next) });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const nextPath = sanitizeAdminNextPath(req.body?.next);

  if (!validateAdminCredentials(username, password)) {
    return sendApiError(res, 401, 'Invalid username or password.');
  }

  const sessionCookie = createAdminSessionCookie(username);

  if (!sessionCookie) {
    return sendApiError(res, 500, 'Unable to create an admin session.');
  }

  res.setHeader('Set-Cookie', sessionCookie);
  return sendApiSuccess(res, 200, { next: nextPath });
}
