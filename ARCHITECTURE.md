# Next.js Architecture Playbook

Opinionated pattern reference for Next.js + Prisma + TypeScript projects. Carry this into any new project to enforce the same structural rules from day one.

---

## Layer Contract

```
DB (Prisma)
  └─ repositories/       raw queries, no shaping
       └─ transformers/  map DB rows → typed models, compute all display fields
            └─ services/ compose data for pages, enforce auth gates
                 └─ pages/ render-only; zero DB access, zero derivation
                      └─ pages/api/ API routes (only layer allowed to use Prisma directly)
```

### Rules

| Layer | Allowed | Forbidden |
|---|---|---|
| `pages/` (non-API) | Import from `app/services/`, `app/helpers/`, `app/models/` | `prisma/adapter`, `@prisma/client`, data derivation |
| `pages/api/` | Import from any `app/` layer, `prisma/adapter` | — |
| `app/services/` | Import from repositories, transformers, models | Direct Prisma outside of explicit service files |
| `app/transformers/` | Map raw input → typed model | Side effects, DB access |
| `app/repositories/` | `prisma` queries only | Business logic, formatting |

---

## Directory Layout

```
app/
  helpers/         Pure utilities consumed by pages or components
  hooks/           React hooks (client-side data fetching)
  models/          TypeScript interfaces for all domain objects
  repositories/    Prisma query functions, return raw typed rows
  services/        Compose repository + transformer output for SSR loaders
    admin/         Admin-scoped service loaders
  transformers/    Map DB rows → typed models; compute display fields here
components/
  admin/
  projects/
pages/
  api/             Only place Prisma is allowed outside app/repositories
  admin/
prisma/
  adapter.ts       Single Prisma client export
  schema.prisma
```

---

## Transformer Contract

Transformers compute **all** display-level derived fields. Pages read them directly; no derivation in pages.

```ts
// app/transformers/jobs.ts
export function transformJob(raw: JobRow): Job {
  const roles = raw.roles.sort((a, b) => a.priority - b.priority);
  const primaryRole = roles[0]?.title ?? 'Engineer';
  const priorRoles = roles.slice(1).map((r) => r.title);

  return {
    ...coreFields(raw),
    primary_role: primaryRole,
    prior_roles: priorRoles,
    date_range: buildDateRange(raw.start_date, raw.end_date),
    // pre-computed display fields consumed directly by pages
    display_company_label: raw.company?.name ?? '',
    display_summary: raw.summary ?? primaryRole,
    href: raw.shortcode ? `/experience/${raw.shortcode}` : '/experience',
  };
}
```

### Checklist before marking a transformer done

- [ ] All date ranges formatted here, not in pages
- [ ] All label/summary fallback logic here
- [ ] All href values computed here
- [ ] `preview_skills` sliced here (e.g. `skills.slice(0, 4)`) for card-compact rendering
- [ ] No `Date` objects leak into models — serialize to ISO strings

---

## Admin SSR Pattern

Every admin page uses a single auth gate. The loader function is a pure async function in `app/services/admin/`.

```ts
// pages/admin/categories.tsx
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  return getAdminPageProps(context, () => getAdminCategoriesPageData());
};
```

```ts
// app/services/admin/auth.ts
export async function getAdminPageProps<T extends Record<string, unknown>>(
  context: GetServerSidePropsContext,
  loader?: () => Promise<T>,
): Promise<GetServerSidePropsResult<{ adminUser: string } & T>> {
  // validate session cookie → redirect to /admin/login if missing
  // call loader() and spread result into props
}
```

```ts
// app/services/admin/categories.ts
export async function getAdminCategoriesPageData() {
  const rows = await prisma.category.findMany({
    orderBy: { title: 'asc' },
    include: { _count: { select: { projects: true } } },
  });
  return { categories: rows.map(transformAdminCategory) };
}
```

### Checklist

- [ ] Every admin `getServerSideProps` delegates to `getAdminPageProps`
- [ ] Every admin loader lives in `app/services/admin/<name>.ts`
- [ ] All `Date` objects serialized to ISO strings inside the loader before returning props

---

## Card View Helper Pattern

When a component renders the same card layout for multiple contexts (e.g. project cards on a portfolio page vs. inside an experience entry), compute the context-specific fields in a helper before passing to the component.

```ts
// app/helpers/project-card.ts
export function withProjectCardView(
  project: Project,
  variant: 'project' | 'experience' = 'project',
): ProjectWithCardView {
  const isExperience = variant === 'experience';
  return {
    ...project,
    card: {
      href: isExperience ? project.job_href : project.href,
      companyName: isExperience ? null : project.job?.company?.name ?? null,
      focusLabel: isExperience ? 'Role' : 'Built For',
      focusValue: project.position || project.role || 'Client project',
      ctaLabel: isExperience ? 'View project details' : 'View case study',
    },
  };
}
```

```tsx
// usage in any page
<ProjectCard project={withProjectCardView(project, 'experience')} />
```

The component itself has **no branching** — it reads `project.card.*` only.

---

## ESLint Boundary Rule

Add this block to `eslint.config.js` (flat config) to enforce the layer contract at lint time:

```js
// eslint.config.js
{
  files: ['pages/**/*.{ts,tsx}'],
  ignores: ['pages/api/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          regex: '^(prisma/adapter|@prisma/client)',
          message: 'Pages must not import from the DB layer directly. Move DB access into app/services/ or app/repositories/.',
        },
      ],
    }],
  },
},
```

> This uses the `regex` property supported in ESLint v9 flat config. If using an older eslint version with legacy `.eslintrc`, replace with `group: ['prisma/adapter', '@prisma/client']`.

---

## Vitest Mock Pattern for SSR Tests

When testing `getServerSideProps` of admin pages, mock the service loader — never mock Prisma inside SSR page tests.

```ts
// tests/admin-ssr.test.ts
const { getAdminPagePropsMock, getAdminCategoriesPageDataMock } = vi.hoisted(() => ({
  getAdminPagePropsMock: vi.fn(),
  getAdminCategoriesPageDataMock: vi.fn(),
}));

vi.mock('app/services/admin/auth', () => ({
  getAdminPageProps: getAdminPagePropsMock,
}));

vi.mock('app/services/admin/categories', () => ({
  getAdminCategoriesPageData: getAdminCategoriesPageDataMock,
}));

beforeEach(() => {
  getAdminCategoriesPageDataMock.mockResolvedValue({ categories: [] });

  getAdminPagePropsMock.mockImplementation(async (_ctx, loader) => ({
    props: { adminUser: 'admin', ...(loader ? await loader() : {}) },
  }));
});
```

> Mock the service layer, not the DB. If you need to test the service loader itself (query shape, date serialization), write a dedicated unit test for the service function with Prisma mocked there.

---

## New Project Setup Checklist

- [ ] Create `app/{helpers,hooks,models,repositories,services,transformers}/` directories
- [ ] Create `prisma/adapter.ts` as single Prisma client export
- [ ] Add ESLint boundary rule for `pages/` to `eslint.config.js`
- [ ] Create `app/services/admin/auth.ts` with `getAdminPageProps` before building any admin page
- [ ] Keep `Date` objects out of all model interfaces — transformers serialize to strings
- [ ] Add `preview_skills` (or equivalent preview slice) to any model that feeds a card component
- [ ] One Vitest mock per service module, not per Prisma method, in SSR tests
