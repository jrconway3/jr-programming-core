import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createAdminSessionCookie,
  getAdminSession,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from '../../../../lib/admin-auth';

type LoginResponse = {
  error?: string;
  next?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const existingSession = getAdminSession(req);

  if (existingSession) {
    return res.status(200).json({ next: sanitizeAdminNextPath(req.body?.next) });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const nextPath = sanitizeAdminNextPath(req.body?.next);

  if (!validateAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const sessionCookie = createAdminSessionCookie(username);

  if (!sessionCookie) {
    return res.status(500).json({ error: 'Unable to create an admin session.' });
  }

  res.setHeader('Set-Cookie', sessionCookie);
  return res.status(200).json({ next: nextPath });
}
