import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { DragEvent, useMemo, useState } from 'react';
import AdminShell from 'components/admin/AdminShell';
import { getAdminPageProps } from 'app/services/admin/auth';
import { extractApiErrorMessage } from 'app/helpers/response';
import type { AdminCategoryOption, AdminProjectRecord } from 'app/services/admin/projects';
import { adminProjectInclude, serializeAdminProject } from 'app/services/admin/projects';
import { prisma } from 'prisma/adapter';

type ProjectsPageProps = {
  adminUser: string;
  categories: AdminCategoryOption[];
  projects: AdminProjectRecord[];
};

type ProjectFormLink = {
  key: string;
  website: string;
  url: string;
};

type ProjectFormGalleryItem = {
  key: string;
  title: string;
  image: string;
};

type ProjectFormCategory = {
  category_id: number;
  selected: boolean;
  priority: string;
};

type ProjectFormState = {
  name: string;
  short: string;
  role: string;
  position: string;
  extended: string;
  start_date: string;
  end_date: string;
  links: ProjectFormLink[];
  gallery: ProjectFormGalleryItem[];
  categories: ProjectFormCategory[];
};

const createKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (!movedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function toMonthInput(value: string | null): string {
  return value ? value.slice(0, 7) : '';
}

function createLinkRow(link?: AdminProjectRecord['links'][number]): ProjectFormLink {
  return {
    key: link ? `link-${link.id}` : createKey(),
    website: link?.website ?? '',
    url: link?.url ?? '',
  };
}

function createGalleryRow(item?: AdminProjectRecord['gallery'][number]): ProjectFormGalleryItem {
  return {
    key: item ? `gallery-${item.id}` : createKey(),
    title: item?.title ?? '',
    image: item?.image ?? '',
  };
}

function createEmptyForm(categories: AdminCategoryOption[]): ProjectFormState {
  return {
    name: '',
    short: '',
    role: '',
    position: '',
    extended: '',
    start_date: '',
    end_date: '',
    links: [createLinkRow()],
    gallery: [createGalleryRow()],
    categories: categories.map((category) => ({
      category_id: category.id,
      selected: false,
      priority: '0',
    })),
  };
}

function createFormFromProject(project: AdminProjectRecord, categories: AdminCategoryOption[]): ProjectFormState {
  const assignments = new Map(project.categories.map((categoryEntry) => [categoryEntry.category_id, categoryEntry.priority]));

  return {
    name: project.name,
    short: project.short,
    role: project.role ?? '',
    position: project.position ?? '',
    extended: project.extended ?? '',
    start_date: toMonthInput(project.start_date),
    end_date: toMonthInput(project.end_date),
    links: project.links.length > 0 ? project.links.map((link) => createLinkRow(link)) : [createLinkRow()],
    gallery: project.gallery.length > 0 ? project.gallery.map((item) => createGalleryRow(item)) : [createGalleryRow()],
    categories: categories.map((category) => ({
      category_id: category.id,
      selected: assignments.has(category.id),
      priority: String(assignments.get(category.id) ?? 0),
    })),
  };
}

function buildPayload(form: ProjectFormState) {
  return {
    name: form.name,
    short: form.short,
    role: form.role,
    position: form.position,
    extended: form.extended,
    start_date: form.start_date,
    end_date: form.end_date,
    links: form.links.map((link, index) => ({
      website: link.website,
      url: link.url,
      priority: index,
    })),
    gallery: form.gallery.map((item, index) => ({
      title: item.title,
      image: item.image,
      priority: index,
    })),
    categories: form.categories
      .filter((category) => category.selected)
      .map((category) => ({
        category_id: category.category_id,
        priority: category.priority,
      })),
  };
}

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminProjects({ adminUser, categories, projects: initialProjects }: ProjectsPageProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjects[0]?.id ?? null);
  const [form, setForm] = useState<ProjectFormState>(() => (
    initialProjects[0] ? createFormFromProject(initialProjects[0], categories) : createEmptyForm(categories)
  ));
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draggedLinkIndex, setDraggedLinkIndex] = useState<number | null>(null);
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => (
      project.name.toLowerCase().includes(query)
      || project.short.toLowerCase().includes(query)
      || (project.role || '').toLowerCase().includes(query)
      || project.categories.some((categoryEntry) => categoryEntry.category.title.toLowerCase().includes(query))
    ));
  }, [projects, search]);

  function selectProject(project: AdminProjectRecord) {
    setSelectedProjectId(project.id);
    setForm(createFormFromProject(project, categories));
    setError(null);
    setSuccessMessage(null);
  }

  function startNewProject() {
    setSelectedProjectId(null);
    setForm(createEmptyForm(categories));
    setError(null);
    setSuccessMessage(null);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleLinkDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    setDraggedLinkIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleLinkDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault();

    if (draggedLinkIndex === null || draggedLinkIndex === targetIndex) {
      setDraggedLinkIndex(null);
      return;
    }

    setForm((current) => ({
      ...current,
      links: reorderItems(current.links, draggedLinkIndex, targetIndex),
    }));
    setDraggedLinkIndex(null);
  }

  function moveLink(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    setForm((current) => {
      if (targetIndex < 0 || targetIndex >= current.links.length) {
        return current;
      }

      return {
        ...current,
        links: reorderItems(current.links, index, targetIndex),
      };
    });
  }

  function handleGalleryDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    setDraggedGalleryIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleGalleryDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault();

    if (draggedGalleryIndex === null || draggedGalleryIndex === targetIndex) {
      setDraggedGalleryIndex(null);
      return;
    }

    setForm((current) => ({
      ...current,
      gallery: reorderItems(current.gallery, draggedGalleryIndex, targetIndex),
    }));
    setDraggedGalleryIndex(null);
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    setForm((current) => {
      if (targetIndex < 0 || targetIndex >= current.gallery.length) {
        return current;
      }

      return {
        ...current,
        gallery: reorderItems(current.gallery, index, targetIndex),
      };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(selectedProjectId ? `/api/admin/projects/${selectedProjectId}` : '/api/admin/projects', {
        method: selectedProjectId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload(form)),
      });

      const payload = await response.json() as {
        ok?: boolean;
        data?: {
          project?: AdminProjectRecord;
        };
      };

      if (!response.ok || !payload.ok || !payload.data?.project) {
        throw new Error(extractApiErrorMessage(payload, 'Unable to save project.'));
      }

      setProjects((current) => {
        const remaining = current.filter((project) => project.id !== payload.data!.project!.id);
        return [payload.data!.project!, ...remaining].sort((left, right) => right.updated_at.localeCompare(left.updated_at));
      });

      setSelectedProjectId(payload.data.project.id);
      setForm(createFormFromProject(payload.data.project, categories));
      setSuccessMessage(selectedProjectId ? 'Project updated.' : 'Project created.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save project.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedProjectId) {
      return;
    }

    const project = projects.find((item) => item.id === selectedProjectId);

    if (!project) {
      return;
    }

    const confirmed = window.confirm(`Delete ${project.name} and all of its links, gallery items, and category assignments?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(selectedProjectId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/projects/${selectedProjectId}`, {
        method: 'DELETE',
      });

      const payload = await response.json() as {
        ok?: boolean;
        data?: {
          success?: boolean;
        };
      };

      if (!response.ok || !payload.ok || !payload.data?.success) {
        throw new Error(extractApiErrorMessage(payload, 'Unable to delete project.'));
      }

      const remainingProjects = projects.filter((item) => item.id !== selectedProjectId);
      setProjects(remainingProjects);

      if (remainingProjects[0]) {
        setSelectedProjectId(remainingProjects[0].id);
        setForm(createFormFromProject(remainingProjects[0], categories));
      } else {
        setSelectedProjectId(null);
        setForm(createEmptyForm(categories));
      }

      setSuccessMessage('Project deleted.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete project.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Projects | JRProgramming</title>
      </Head>

      <AdminShell
        title="Project Editor"
        description="Create and refine public portfolio entries, including summaries, dates, links, gallery items, and category assignments."
        adminUser={adminUser}
      >
        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <div className="flex flex-col gap-4 border-b border-primary-accent/15 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-primary-accentLight">Projects</h2>
                  <p className="mt-2 text-sm text-primary-text/70">{filteredProjects.length} project result{filteredProjects.length === 1 ? '' : 's'}.</p>
                </div>
                <button
                  type="button"
                  onClick={startNewProject}
                  className="rounded-lg border border-primary-accent/35 bg-primary-accent/10 px-4 py-2 text-sm font-semibold text-primary-accentLight transition hover:bg-primary-accent/20"
                >
                  New Project
                </button>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, summaries, roles, or categories"
                className="w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
              />
            </div>

            <div className="mt-5 space-y-3">
              {filteredProjects.length === 0 && (
                <div className="rounded-xl border border-dashed border-primary-accent/20 px-4 py-8 text-sm text-primary-text/70">
                  No projects match the current search.
                </div>
              )}

              {filteredProjects.map((project) => {
                const isActive = project.id === selectedProjectId;

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectProject(project)}
                    className={`w-full rounded-xl border p-4 text-left transition ${isActive ? 'border-primary-accent bg-primary-accent/10' : 'border-primary-accent/12 bg-slate-950/40 hover:border-primary-accent/30 hover:bg-slate-950/55'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-primary-text">{project.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-primary-text/70">{project.short}</p>
                      </div>
                      <span className="rounded-full border border-primary-accent/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-accentLight">
                        {project.skillsCount} skill{project.skillsCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.categories.map((categoryEntry) => (
                        <span key={`${project.id}-${categoryEntry.category_id}`} className="rounded-full border border-primary-accent/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary-text/65">
                          {categoryEntry.category.title}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-primary-text/50">Updated {formatUpdatedAt(project.updated_at)}</p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
            <div className="flex flex-col gap-4 border-b border-primary-accent/15 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-accentLight">{selectedProjectId ? 'Edit Project' : 'New Project'}</h2>
                <p className="mt-2 text-sm text-primary-text/70">Core project details, relationship data, and public display content all live here.</p>
              </div>

              {selectedProjectId && (
                <button
                  type="button"
                  disabled={deletingId === selectedProjectId}
                  onClick={handleDelete}
                  className="rounded-lg border border-red-400/35 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingId === selectedProjectId ? 'Deleting...' : 'Delete Project'}
                </button>
              )}
            </div>

            <div className="mt-5 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                  Name
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>

                <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                  Role
                  <input
                    type="text"
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                Short Summary
                <textarea
                  required
                  rows={3}
                  value={form.short}
                  onChange={(event) => setForm((current) => ({ ...current, short: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                  Position
                  <input
                    type="text"
                    value={form.position}
                    onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>

                <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                  Start Month
                  <input
                    type="month"
                    value={form.start_date}
                    onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>

                <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                  End Month
                  <input
                    type="month"
                    value={form.end_date}
                    onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-[0.24em] text-primary-accentLight">
                Extended Description
                <textarea
                  rows={8}
                  value={form.extended}
                  onChange={(event) => setForm((current) => ({ ...current, extended: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                />
              </label>

              <section className="rounded-2xl border border-primary-accent/12 bg-slate-950/35 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-primary-accentLight">Project Links</h3>
                    <p className="mt-1 text-sm text-primary-text/65">Public call-to-action buttons shown on the project page. Drag rows or use Move Up and Move Down to set their order.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, links: [...current.links, createLinkRow()] }))}
                    className="rounded-lg border border-primary-accent/30 px-4 py-2 text-sm font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight"
                  >
                    Add Link
                  </button>
                </div>

                <div className="space-y-4">
                  {form.links.map((link, index) => (
                    <div
                      key={link.key}
                      draggable
                      onDragStart={(event) => handleLinkDragStart(event, index)}
                      onDragOver={handleDragOver}
                      onDrop={(event) => handleLinkDrop(event, index)}
                      onDragEnd={() => setDraggedLinkIndex(null)}
                      className={`grid gap-3 rounded-xl border border-primary-accent/12 bg-slate-950/35 p-3 md:grid-cols-[auto_0.8fr_1.3fr_auto_auto] ${draggedLinkIndex === index ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab rounded-lg border border-primary-accent/20 bg-slate-950/70 px-3 py-3 text-sm font-semibold text-primary-text/55 active:cursor-grabbing">
                          ::
                        </div>
                        <span className="text-xs uppercase tracking-[0.22em] text-primary-text/55">{index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveLink(index, -1)}
                            className="rounded-lg border border-primary-accent/30 px-2 py-2 text-xs font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Move link ${index + 1} up`}
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === form.links.length - 1}
                            onClick={() => moveLink(index, 1)}
                            className="rounded-lg border border-primary-accent/30 px-2 py-2 text-xs font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Move link ${index + 1} down`}
                          >
                            Down
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={link.website}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          links: current.links.map((item, itemIndex) => itemIndex === index ? { ...item, website: event.target.value } : item),
                        }))}
                        placeholder="Label"
                        className="rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          links: current.links.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item),
                        }))}
                        placeholder="https://example.com (https only)"
                        className="rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({
                          ...current,
                          links: current.links.length > 1 ? current.links.filter((_, itemIndex) => itemIndex !== index) : [createLinkRow()],
                        }))}
                        className="rounded-lg border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-primary-accent/12 bg-slate-950/35 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-primary-accentLight">Gallery</h3>
                    <p className="mt-1 text-sm text-primary-text/65">Images shown on the public project detail page. Drag rows or use Move Up and Move Down to set their order.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, gallery: [...current.gallery, createGalleryRow()] }))}
                    className="rounded-lg border border-primary-accent/30 px-4 py-2 text-sm font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight"
                  >
                    Add Image
                  </button>
                </div>

                <div className="space-y-4">
                  {form.gallery.map((item, index) => (
                    <div
                      key={item.key}
                      draggable
                      onDragStart={(event) => handleGalleryDragStart(event, index)}
                      onDragOver={handleDragOver}
                      onDrop={(event) => handleGalleryDrop(event, index)}
                      onDragEnd={() => setDraggedGalleryIndex(null)}
                      className={`grid gap-3 rounded-xl border border-primary-accent/12 bg-slate-950/35 p-3 md:grid-cols-[auto_0.8fr_1.3fr_auto_auto] ${draggedGalleryIndex === index ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab rounded-lg border border-primary-accent/20 bg-slate-950/70 px-3 py-3 text-sm font-semibold text-primary-text/55 active:cursor-grabbing">
                          ::
                        </div>
                        <span className="text-xs uppercase tracking-[0.22em] text-primary-text/55">{index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveGalleryItem(index, -1)}
                            className="rounded-lg border border-primary-accent/30 px-2 py-2 text-xs font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Move image ${index + 1} up`}
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === form.gallery.length - 1}
                            onClick={() => moveGalleryItem(index, 1)}
                            className="rounded-lg border border-primary-accent/30 px-2 py-2 text-xs font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Move image ${index + 1} down`}
                          >
                            Down
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          gallery: current.gallery.map((galleryItem, itemIndex) => itemIndex === index ? { ...galleryItem, title: event.target.value } : galleryItem),
                        }))}
                        placeholder="Caption"
                        className="rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                      />
                      <input
                        type="text"
                        value={item.image}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          gallery: current.gallery.map((galleryItem, itemIndex) => itemIndex === index ? { ...galleryItem, image: event.target.value } : galleryItem),
                        }))}
                        placeholder="/images/project.png or https://example.com/image.png"
                        className="rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({
                          ...current,
                          gallery: current.gallery.length > 1 ? current.gallery.filter((_, itemIndex) => itemIndex !== index) : [createGalleryRow()],
                        }))}
                        className="rounded-lg border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-primary-accent/12 bg-slate-950/35 p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-primary-accentLight">Categories</h3>
                  <p className="mt-1 text-sm text-primary-text/65">Select every public category this project should appear under, then set sort priority within each category.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {categories.map((category) => {
                    const formCategory = form.categories.find((item) => item.category_id === category.id);

                    if (!formCategory) {
                      return null;
                    }

                    return (
                      <label key={category.id} className="rounded-xl border border-primary-accent/10 bg-slate-950/45 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={formCategory.selected}
                              onChange={(event) => setForm((current) => ({
                                ...current,
                                categories: current.categories.map((item) => item.category_id === category.id ? { ...item, selected: event.target.checked } : item),
                              }))}
                              className="mt-1 rounded border-primary-accent/40 bg-slate-950/65 text-primary-accent focus:ring-primary-accent"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-primary-text">{category.title}</span>
                              <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-primary-text/55">/{category.shortcode}</span>
                            </span>
                          </div>

                          <input
                            type="number"
                            value={formCategory.priority}
                            disabled={!formCategory.selected}
                            onChange={(event) => setForm((current) => ({
                              ...current,
                              categories: current.categories.map((item) => item.category_id === category.id ? { ...item, priority: event.target.value } : item),
                            }))}
                            className="w-24 rounded-lg border border-primary-accent/30 bg-slate-950/65 px-3 py-2 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {(error || successMessage) && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-400/45 bg-red-500/10 text-red-100' : 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'}`}>
                  {error || successMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-primary-accent/15 pt-5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="rounded-lg border border-primary-accent/40 bg-primary-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : selectedProjectId ? 'Save Project' : 'Create Project'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedProjectId) {
                      const selectedProject = projects.find((project) => project.id === selectedProjectId);

                      if (selectedProject) {
                        setForm(createFormFromProject(selectedProject, categories));
                      }
                    } else {
                      setForm(createEmptyForm(categories));
                    }

                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="rounded-lg border border-primary-accent/30 px-6 py-3 text-sm font-semibold text-primary-text/80 transition hover:border-primary-accent/55 hover:text-primary-accentLight"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </article>
        </section>
      </AdminShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ProjectsPageProps> = async (context) => {
  return getAdminPageProps(context, async () => {
    const [categories, projects] = await Promise.all([
      prisma.category.findMany({
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          shortcode: true,
        },
      }),
      prisma.project.findMany({
        orderBy: { updated_at: 'desc' },
        include: adminProjectInclude,
      }),
    ]);

    return {
      categories,
      projects: projects.map((project) => serializeAdminProject(project)),
    };
  });
};