import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from '../../../../lib/admin-auth';
import { prisma } from '../../../../prisma/adapter';

type InquiryResponse = {
  inquiry?: {
    id: number;
    status: string;
    updated_at: string;
  };
  error?: string;
};

const allowedStatuses = new Set([
  'pending',
  'reviewed',
  'responded',
  'archived',
  'spam',
  'delivery_failed',
  'sent',
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse<InquiryResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawId = req.query.id;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return res.status(400).json({ error: 'Invalid inquiry id.' });
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid inquiry id.' });
  }

  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ error: 'Invalid inquiry status.' });
  }

  try {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
      select: {
        id: true,
        status: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      inquiry: {
        ...inquiry,
        updated_at: inquiry.updated_at.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    console.error('PATCH /api/admin/inquiries/[id] failed', error);
    return res.status(500).json({ error: 'Failed to update inquiry.' });
  }
}
