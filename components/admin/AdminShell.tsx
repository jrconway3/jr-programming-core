import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, ReactNode, useState } from 'react';

type AdminShellProps = {
  title: string;
  description: string;
  adminUser: string;
  children: ReactNode;
};

const navigationItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/categories', label: 'Categories' },
];

export default function AdminShell({ title, description, adminUser, children }: AdminShellProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningOut(true);

    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/admin/login');
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 md:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6">
        <section className="terminal-card px-6 pb-6 pt-14 md:px-8">
          <div className="flex flex-col gap-5 border-b border-primary-accent/20 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight">Private Admin</p>
              <div>
                <h1 className="text-3xl font-extrabold gradient-text animate-gradient md:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-7 text-primary-text/80 md:text-base">{description}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-xl border border-primary-accent/25 bg-slate-950/35 px-4 py-4 text-xs uppercase tracking-[0.22em] text-primary-text/70 lg:items-end">
              <span>Signed in as {adminUser}</span>
              <form onSubmit={handleSignOut}>
                <button
                  type="submit"
                  disabled={isSigningOut}
                  className="rounded-lg border border-primary-accent/40 bg-primary-accent px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-white transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </form>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-3">
            {navigationItems.map((item) => {
              const isActive = router.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 text-sm transition ${isActive ? 'border-primary-accent bg-primary-accent/15 text-primary-accentLight' : 'border-primary-accent/25 text-primary-text/75 hover:border-primary-accent/50 hover:text-primary-accentLight'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </section>

        {children}
      </div>
    </main>
  );
}