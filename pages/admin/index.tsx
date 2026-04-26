import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import AdminShell from '../../components/admin/AdminShell';
import { getAdminPageProps } from 'app/services/admin/auth';
import { prisma } from '../../prisma/adapter';

type DashboardInquiry = {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
};

type DashboardPageProps = {
  adminUser: string;
  projectCount: number;
  categoryCount: number;
  inquiryCount: number;
  pendingInquiryCount: number;
  recentInquiries: DashboardInquiry[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminDashboard({
  adminUser,
  projectCount,
  categoryCount,
  inquiryCount,
  pendingInquiryCount,
  recentInquiries,
}: DashboardPageProps) {
  const summaryCards = [
    { label: 'Projects', value: projectCount, href: '/admin/projects' },
    { label: 'Categories', value: categoryCount, href: '/admin/categories' },
    { label: 'Inquiries', value: inquiryCount, href: '/admin/inquiries' },
    { label: 'Pending', value: pendingInquiryCount, href: '/admin/inquiries' },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | JRProgramming</title>
      </Head>

      <AdminShell
        title="Admin Dashboard"
        description="A single place to monitor incoming inquiries and maintain the portfolio data that drives the public site."
        adminUser={adminUser}
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-5 transition hover:border-primary-accent/45 hover:bg-slate-950/60"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-primary-accentLight">{card.label}</p>
              <p className="mt-4 text-4xl font-bold text-primary-text">{card.value}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <div className="flex items-center justify-between gap-4 border-b border-primary-accent/15 pb-4">
              <div>
                <h2 className="text-xl font-bold text-primary-accentLight">Recent Inquiries</h2>
                <p className="mt-2 text-sm text-primary-text/70">Latest contact submissions with current status.</p>
              </div>
              <Link href="/admin/inquiries" className="text-sm text-primary-accentLight transition hover:text-primary-text">
                Open queue
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {recentInquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-primary-accent/20 px-4 py-6 text-sm text-primary-text/70">
                  No inquiries have been submitted yet.
                </div>
              )}

              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-xl border border-primary-accent/10 bg-slate-950/45 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-primary-text">{inquiry.subject}</p>
                      <p className="mt-1 text-sm text-primary-text/75">{inquiry.name} · {inquiry.email}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="inline-flex rounded-full border border-primary-accent/30 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">
                        {inquiry.status}
                      </span>
                      <p className="mt-2 text-xs text-primary-text/60">{formatDate(inquiry.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <h2 className="text-xl font-bold text-primary-accentLight">Recommended Setup</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-primary-text/75">
              <p>Keep credentials in environment variables only. This admin area expects ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.</p>
              <p>Use categories to control the public shortcode pages, then assign projects to those categories from the projects screen.</p>
              <p>Inquiry statuses are operational metadata only, so you can use them to track review and follow-up without affecting the public site.</p>
            </div>
          </article>
        </section>
      </AdminShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (context) => {
  return getAdminPageProps(context, async () => {
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
  });
};