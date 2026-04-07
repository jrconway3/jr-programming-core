import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { FormEvent, useMemo, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import { getAdminPageProps } from '../../lib/admin-auth';
import { prisma } from '../../prisma/adapter';

type AdminCategory = {
  id: number;
  title: string;
  shortcode: string;
  created_at: string;
  updated_at: string;
  projectCount: number;
};

type CategoriesPageProps = {
  adminUser: string;
  categories: AdminCategory[];
};

type CategoryFormState = {
  title: string;
  shortcode: string;
};

const emptyForm: CategoryFormState = {
  title: '',
  shortcode: '',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminCategories({ adminUser, categories: initialCategories }: CategoriesPageProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => (
      category.title.toLowerCase().includes(query)
      || category.shortcode.toLowerCase().includes(query)
    ));
  }, [categories, search]);

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setForm({
      title: category.title,
      shortcode: category.shortcode,
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { category?: AdminCategory; error?: string };

      if (!response.ok || !payload.category) {
        throw new Error(payload.error || 'Unable to save category.');
      }

      if (editingId) {
        setCategories((current) => current.map((category) => category.id === editingId ? payload.category! : category));
      } else {
        setCategories((current) => [payload.category!, ...current]);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save category.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Delete the ${category.title} category and remove it from all projects?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to delete category.');
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));

      if (editingId === category.id) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete category.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Categories | JRProgramming</title>
      </Head>

      <AdminShell
        title="Project Categories"
        description="Maintain the public shortcode taxonomy that groups projects into browsable landing pages."
        adminUser={adminUser}
      >
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <div className="border-b border-primary-accent/15 pb-4">
              <h2 className="text-xl font-bold text-primary-accentLight">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <p className="mt-2 text-sm text-primary-text/70">Titles are public labels. Shortcodes become the page path, so keep them stable.</p>
            </div>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                Title
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                Shortcode
                <input
                  required
                  type="text"
                  value={form.shortcode}
                  onChange={(event) => setForm((current) => ({ ...current, shortcode: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              {error && (
                <div className="rounded-lg border border-red-400/45 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg border border-primary-accent/40 bg-primary-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-primary-accent/30 px-5 py-3 text-sm font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </article>

          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <div className="flex flex-col gap-4 border-b border-primary-accent/15 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-accentLight">Existing Categories</h2>
                <p className="mt-2 text-sm text-primary-text/70">{filteredCategories.length} category result{filteredCategories.length === 1 ? '' : 's'}.</p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or shortcode"
                className="w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent lg:max-w-sm"
              />
            </div>

            <div className="mt-5 space-y-4">
              {filteredCategories.length === 0 && (
                <div className="rounded-xl border border-dashed border-primary-accent/20 px-4 py-8 text-sm text-primary-text/70">
                  No categories match the current search.
                </div>
              )}

              {filteredCategories.map((category) => (
                <div key={category.id} className="rounded-xl border border-primary-accent/12 bg-slate-950/40 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-primary-text">{category.title}</h3>
                        <span className="rounded-full border border-primary-accent/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">
                          /{category.shortcode}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-primary-text/75">Used by {category.projectCount} project{category.projectCount === 1 ? '' : 's'}.</p>
                      <p className="mt-2 text-xs text-primary-text/55">Updated {formatDate(category.updated_at)}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="rounded-lg border border-primary-accent/30 px-4 py-2 text-sm font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === category.id}
                        onClick={() => handleDelete(category)}
                        className="rounded-lg border border-red-400/35 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === category.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </AdminShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CategoriesPageProps> = async (context) => {
  return getAdminPageProps(context, async () => {
    const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return {
      categories: categories.map((category) => ({
        id: category.id,
        title: category.title,
        shortcode: category.shortcode,
        created_at: category.created_at.toISOString(),
        updated_at: category.updated_at.toISOString(),
        projectCount: category._count.projects,
      })),
    };
  });
};