import { prisma } from 'prisma/adapter';

export type AdminInquiryRecord = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
  status: string;
  spam_score: number;
  spam_reason: string | null;
  user_agent: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAdminInquiriesPageData(limit = 150): Promise<{ inquiries: AdminInquiryRecord[] }> {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  return {
    inquiries: inquiries.map((inquiry) => ({
      ...inquiry,
      sent_at: inquiry.sent_at ? inquiry.sent_at.toISOString() : null,
      created_at: inquiry.created_at.toISOString(),
      updated_at: inquiry.updated_at.toISOString(),
    })),
  };
}
