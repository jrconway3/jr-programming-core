import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminSession, isAdminAuthConfigured, sanitizeAdminNextPath } from '../../lib/admin-auth';

type LoginPageProps = {
  configured: boolean;
  nextPath: string;
};

export default function AdminLogin({ configured, nextPath }: LoginPageProps) {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, next: nextPath }),
      });

      const payload = (await response.json()) as { error?: string; next?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to sign in.');
      }

      await router.push(payload.next || '/admin');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | JRProgramming</title>
      </Head>

      <main className="min-h-screen px-4 py-12 md:px-6">
        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="terminal-card p-6 md:p-8">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-primary-accentLight">Private Admin</p>
            <h1 className="text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">Control room for inquiries and portfolio data.</h1>
            <p className="mt-6 text-sm leading-7 text-primary-text/85 md:text-base">
              This area is intended for site administration only. Use it to review incoming inquiries and keep projects and categories current without touching the public pages directly.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-primary-accent/20 bg-slate-950/35 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-accentLight">Inquiries</h2>
                <p className="mt-3 text-xs leading-6 text-primary-text/75">Review new leads, mark spam, and keep delivery outcomes visible.</p>
              </article>
              <article className="rounded-xl border border-primary-accent/20 bg-slate-950/35 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-accentLight">Projects</h2>
                <p className="mt-3 text-xs leading-6 text-primary-text/75">Create, edit, and reorganize the projects and categories that power the site.</p>
              </article>
            </div>
          </section>

          <section className="terminal-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-accentLight">Sign In</h2>
              <p className="mt-3 text-sm leading-6 text-primary-text/75">Authenticate with the admin credentials configured on the server.</p>
            </div>

            {!configured && (
              <div className="mb-5 rounded-lg border border-amber-400/45 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in the environment before using the admin area.
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                Username
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
                Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="mt-2 block w-full rounded-lg border border-primary-accent/40 bg-slate-950/60 px-4 py-3 text-sm text-primary-text shadow-inner transition focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              {error && (
                <div className="rounded-lg border border-red-400/45 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!configured || isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg border border-primary-accent/40 bg-primary-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing In...' : 'Enter Admin'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<LoginPageProps> = async (context) => {
  const session = getAdminSession(context.req);
  const nextPath = sanitizeAdminNextPath(context.query.next);

  if (session) {
    return {
      redirect: {
        destination: nextPath,
        permanent: false,
      },
    };
  }

  return {
    props: {
      configured: isAdminAuthConfigured(),
      nextPath,
    },
  };
};
