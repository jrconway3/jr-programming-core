import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import { getAdminPageProps } from '../../lib/admin-auth';
import { prisma } from '../../prisma/adapter';

type AdminInquiry = {
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

type InquiriesPageProps = {
  adminUser: string;
  inquiries: AdminInquiry[];
};

const statusOptions = ['all', 'pending', 'reviewed', 'responded', 'archived', 'spam', 'delivery_failed', 'sent'] as const;
const updateStatusOptions = ['pending', 'reviewed', 'responded', 'archived', 'spam', 'delivery_failed', 'sent'] as const;

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not sent';
  }

  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminInquiries({ adminUser, inquiries: initialInquiries }: InquiriesPageProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
      const query = search.trim().toLowerCase();

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        inquiry.name,
        inquiry.email,
        inquiry.company || '',
        inquiry.subject,
        inquiry.message,
      ].some((field) => field.toLowerCase().includes(query));
    });
  }, [inquiries, search, statusFilter]);

  async function updateInquiryStatus(id: number, status: string) {
    setError(null);
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as {
        inquiry?: { id: number; status: string; updated_at: string };
        error?: string;
      };

      if (!response.ok || !payload.inquiry) {
        throw new Error(payload.error || 'Unable to update inquiry.');
      }

      setInquiries((current) => current.map((inquiry) => (
        inquiry.id === id
          ? { ...inquiry, status: payload.inquiry!.status, updated_at: payload.inquiry!.updated_at }
          : inquiry
      )));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update inquiry.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Inquiries | JRProgramming</title>
      </Head>

      <AdminShell
        title="Inquiry Queue"
        description="Review leads, spot spam, and track the status of every message sent through the contact form."
        adminUser={adminUser}
      >
        <section className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
          <div className="flex flex-col gap-4 border-b border-primary-accent/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary-accentLight">All Inquiries</h2>
              <p className="mt-2 text-sm text-primary-text/70">{filteredInquiries.length} matching result{filteredInquiries.length === 1 ? '' : 's'} across {inquiries.length} total inquiries.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.4fr_0.9fr]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, company, subject, or message"
                className="w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
                className="w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All statuses' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-400/45 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {filteredInquiries.length === 0 && (
              <div className="rounded-xl border border-dashed border-primary-accent/20 px-4 py-8 text-sm text-primary-text/70">
                No inquiries match the current search and status filters.
              </div>
            )}

            {filteredInquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-2xl border border-primary-accent/15 bg-slate-950/40 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4 xl:max-w-4xl">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-primary-text">{inquiry.subject}</h3>
                        <span className="rounded-full border border-primary-accent/30 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">
                          {inquiry.status}
                        </span>
                        {inquiry.spam_score > 0 && (
                          <span className="rounded-full border border-amber-400/35 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100">
                            Spam score {inquiry.spam_score}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-primary-text/75">{inquiry.name} · {inquiry.email}{inquiry.company ? ` · ${inquiry.company}` : ''}</p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-7 text-primary-text/85">{inquiry.message}</p>

                    {(inquiry.spam_reason || inquiry.user_agent) && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {inquiry.spam_reason && (
                          <div className="rounded-xl border border-primary-accent/10 bg-slate-950/45 p-4 text-xs leading-6 text-primary-text/70">
                            <p className="mb-1 uppercase tracking-[0.22em] text-primary-accentLight">Spam reasons</p>
                            <p>{inquiry.spam_reason}</p>
                          </div>
                        )}
                        {inquiry.user_agent && (
                          <div className="rounded-xl border border-primary-accent/10 bg-slate-950/45 p-4 text-xs leading-6 text-primary-text/70">
                            <p className="mb-1 uppercase tracking-[0.22em] text-primary-accentLight">User agent</p>
                            <p className="break-words">{inquiry.user_agent}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-xl border border-primary-accent/12 bg-slate-950/45 p-4 text-sm text-primary-text/75 xl:min-w-[250px]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Created</p>
                      <p className="mt-1">{formatDate(inquiry.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Updated</p>
                      <p className="mt-1">{formatDate(inquiry.updated_at)}</p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">Sent</p>
                      <p className="mt-1">{formatDate(inquiry.sent_at)}</p>
                    </div>

                    <label className="block text-[11px] uppercase tracking-[0.22em] text-primary-accentLight">
                      Update status
                      <select
                        value={inquiry.status}
                        disabled={updatingId === inquiry.id}
                        onChange={(event) => updateInquiryStatus(inquiry.id, event.target.value)}
                        className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-3 py-2 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updateStatusOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </AdminShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<InquiriesPageProps> = async (context) => {
  return getAdminPageProps(context, async () => {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { created_at: 'desc' },
      take: 150,
    });

    return {
      inquiries: inquiries.map((inquiry) => ({
        ...inquiry,
        sent_at: inquiry.sent_at ? inquiry.sent_at.toISOString() : null,
        created_at: inquiry.created_at.toISOString(),
        updated_at: inquiry.updated_at.toISOString(),
      })),
    };
  });
};