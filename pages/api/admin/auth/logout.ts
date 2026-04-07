import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAdminSessionCookie } from '../../../../lib/admin-auth';

export default function handler(req: NextApiRequest, res: NextApiResponse<{ success: true } | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  return res.status(200).json({ success: true });
}
