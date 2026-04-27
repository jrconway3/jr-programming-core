import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminSession, sanitizeAdminNextPath } from 'app/services/admin/auth';
import { extractApiErrorMessage } from 'app/helpers/response';

type LoginPageProps = {
  nextPath: string;
};

export default function AdminLogin({ nextPath }: LoginPageProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
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

      const payload = await response.json() as {
        ok?: boolean;
        data?: {
          next?: string;
        };
      };

      if (!response.ok || !payload.ok) {
        throw new Error(extractApiErrorMessage(payload, 'Unable to sign in.'));
      }

      await router.push(payload.data?.next || '/admin');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign In | JRProgramming</title>
      </Head>

      <main className="flex min-h-screen items-center justify-center px-4 py-12 md:px-6">
        <section className="w-full max-w-md rounded-2xl border border-primary-accent/20 bg-slate-950/50 p-6 shadow-2xl backdrop-blur md:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <h1 className="text-center text-2xl font-semibold text-primary-text">Sign In</h1>

            <label className="block text-xs uppercase tracking-[0.25em] text-primary-accentLight">
              Username
              <input
                required
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
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
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg border border-primary-accent/40 bg-primary-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </section>
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
      nextPath,
    },
  };
};
