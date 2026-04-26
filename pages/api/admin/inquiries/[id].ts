import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { transformInquiryStatus } from 'app/transformers/inquiries';
import { prisma } from '../../../../prisma/adapter';

type InquiryResponse = ApiEnvelope<{ inquiry: ReturnType<typeof transformInquiryStatus> }>;

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
    return sendApiError(res, 405, 'Method not allowed');
  }

  const rawId = req.query.id;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return sendApiError(res, 400, 'Invalid inquiry id.');
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return sendApiError(res, 400, 'Invalid inquiry id.');
  }

  if (!allowedStatuses.has(status)) {
    return sendApiError(res, 400, 'Invalid inquiry status.');
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

    return sendApiSuccess(res, 200, {
      inquiry: transformInquiryStatus(inquiry),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return sendApiError(res, 404, 'Inquiry not found.');
    }

    console.error('PATCH /api/admin/inquiries/[id] failed', error);
    return sendApiError(res, 500, 'Failed to update inquiry.');
  }
}
