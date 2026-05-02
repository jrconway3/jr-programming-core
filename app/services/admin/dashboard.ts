import { prisma } from 'prisma/adapter';

export type DashboardInquiryRecord = {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
};

export async function getAdminDashboardPageData(): Promise<{
  projectCount: number;
  categoryCount: number;
  inquiryCount: number;
  pendingInquiryCount: number;
  recentInquiries: DashboardInquiryRecord[];
}> {
  const [projectCount, categoryCount, inquiryCount, pendingInquiryCount, recentInquiries] = await Promise.all([
    prisma.project.count(),
    prisma.category.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'pending' } }),
    prisma.inquiry.findMany({
      orderBy: { created_at: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        created_at: true,
      },
    }),
  ]);

  return {
    projectCount,
    categoryCount,
    inquiryCount,
    pendingInquiryCount,
    recentInquiries: recentInquiries.map((inquiry) => ({
      ...inquiry,
      created_at: inquiry.created_at.toISOString(),
    })),
  };
}
