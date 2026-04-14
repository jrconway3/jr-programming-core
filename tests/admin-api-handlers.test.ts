import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

type JsonValue = Record<string, unknown>;

type MockRequest = {
  method?: string;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
};

type MockResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: JsonValue | null;
  status: (code: number) => MockResponse;
  json: (payload: JsonValue) => MockResponse;
  setHeader: (name: string, value: string) => void;
};

const {
  PrismaClientKnownRequestErrorMock,
  requireAdminApiMock,
  getAdminSessionMock,
  sanitizeAdminNextPathMock,
  validateAdminCredentialsMock,
  createAdminSessionCookieMock,
  normalizeProjectPayloadMock,
  serializeAdminProjectMock,
  prismaMock,
} = vi.hoisted(() => ({
  PrismaClientKnownRequestErrorMock: class PrismaClientKnownRequestErrorMock extends Error {
    code: string;

    constructor(code: string) {
      super(`Prisma error ${code}`);
      this.code = code;
    }
  },
  requireAdminApiMock: vi.fn(),
  getAdminSessionMock: vi.fn(),
  sanitizeAdminNextPathMock: vi.fn(),
  validateAdminCredentialsMock: vi.fn(),
  createAdminSessionCookieMock: vi.fn(),
  normalizeProjectPayloadMock: vi.fn(),
  serializeAdminProjectMock: vi.fn(),
  prismaMock: {
    category: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    settings: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    inquiry: {
      update: vi.fn(),
    },
    project: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectCategory: {
      deleteMany: vi.fn(),
    },
    projectGallery: {
      deleteMany: vi.fn(),
    },
    projectLink: {
      deleteMany: vi.fn(),
    },
    projectSkill: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: PrismaClientKnownRequestErrorMock,
  },
}));

vi.mock('../lib/admin-auth', () => ({
  requireAdminApi: requireAdminApiMock,
  getAdminSession: getAdminSessionMock,
  sanitizeAdminNextPath: sanitizeAdminNextPathMock,
  validateAdminCredentials: validateAdminCredentialsMock,
  createAdminSessionCookie: createAdminSessionCookieMock,
}));

vi.mock('../lib/admin-projects', () => ({
  adminProjectInclude: { _count: true },
  normalizeProjectPayload: normalizeProjectPayloadMock,
  serializeAdminProject: serializeAdminProjectMock,
}));

vi.mock('../prisma/adapter', () => ({
  prisma: prismaMock,
}));

function createRequest(overrides: MockRequest = {}) {
  return {
    method: 'GET',
    body: {},
    query: {},
    headers: {},
    ...overrides,
  };
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: JsonValue) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
  };
}

function createKnownPrismaError(code: string) {
  return new PrismaClientKnownRequestErrorMock(code);
}

let loginHandler: typeof import('../pages/api/admin/auth/login').default;
let categoriesCreateHandler: typeof import('../pages/api/admin/categories/index').default;
let categoriesByIdHandler: typeof import('../pages/api/admin/categories/[id]').default;
let inquiriesByIdHandler: typeof import('../pages/api/admin/inquiries/[id]').default;
let projectsCreateHandler: typeof import('../pages/api/admin/projects/index').default;
let projectsByIdHandler: typeof import('../pages/api/admin/projects/[id]').default;
let settingsHandler: typeof import('../pages/api/admin/settings').default;
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('admin API handlers', () => {
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    loginHandler = (await import('../pages/api/admin/auth/login')).default;
    categoriesCreateHandler = (await import('../pages/api/admin/categories/index')).default;
    categoriesByIdHandler = (await import('../pages/api/admin/categories/[id]')).default;
    inquiriesByIdHandler = (await import('../pages/api/admin/inquiries/[id]')).default;
    projectsCreateHandler = (await import('../pages/api/admin/projects/index')).default;
    projectsByIdHandler = (await import('../pages/api/admin/projects/[id]')).default;
    settingsHandler = (await import('../pages/api/admin/settings')).default;

    requireAdminApiMock.mockReturnValue({ username: 'admin' });
    getAdminSessionMock.mockReturnValue(null);
    sanitizeAdminNextPathMock.mockReturnValue('/admin');
    validateAdminCredentialsMock.mockReturnValue(false);
    createAdminSessionCookieMock.mockReturnValue('jr_admin_session=signed; Path=/; HttpOnly');

    serializeAdminProjectMock.mockImplementation((project) => project);

    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
    consoleErrorSpy.mockClear();
  });

  it('login handler rejects non-POST methods', async () => {
    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    await loginHandler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('login handler returns next path when session already exists', async () => {
    getAdminSessionMock.mockReturnValue({ username: 'admin' });
    sanitizeAdminNextPathMock.mockReturnValue('/admin/projects');
    const req = createRequest({ method: 'POST', body: { next: '/admin/projects' } });
    const res = createResponse();

    await loginHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ next: '/admin/projects' });
    expect(validateAdminCredentialsMock).not.toHaveBeenCalled();
  });

  it('login handler sets cookie for valid credentials', async () => {
    validateAdminCredentialsMock.mockReturnValue(true);
    sanitizeAdminNextPathMock.mockReturnValue('/admin/inquiries');
    const req = createRequest({
      method: 'POST',
      body: { username: 'admin', password: 'secret', next: '/admin/inquiries' },
    });
    const res = createResponse();

    await loginHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Set-Cookie']).toContain('jr_admin_session=signed');
    expect(res.body).toEqual({ next: '/admin/inquiries' });
  });

  it('categories create handler rejects invalid method', async () => {
    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    await categoriesCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('categories create handler validates required fields', async () => {
    const req = createRequest({ method: 'POST', body: { title: '  ', shortcode: '  ' } });
    const res = createResponse();

    await categoriesCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Category title is required.' });
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it('categories create handler returns created category', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prismaMock.category.create.mockResolvedValue({
      id: 22,
      title: 'Work History',
      shortcode: 'work-history',
      created_at: now,
      updated_at: now,
      _count: { projects: 3 },
    });

    const req = createRequest({
      method: 'POST',
      body: { title: ' Work History ', shortcode: 'Work History' },
    });
    const res = createResponse();

    await categoriesCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(201);
    expect(prismaMock.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'Work History', shortcode: 'work-history' },
      }),
    );
    expect(res.body).toMatchObject({
      category: {
        id: 22,
        title: 'Work History',
        shortcode: 'work-history',
        projectCount: 3,
      },
    });
  });

  it('categories create handler maps duplicate shortcode errors to 409', async () => {
    prismaMock.category.create.mockRejectedValue(createKnownPrismaError('P2002'));

    const req = createRequest({
      method: 'POST',
      body: { title: 'Projects', shortcode: 'projects' },
    });
    const res = createResponse();

    await categoriesCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'That shortcode is already in use.' });
  });

  it('categories create handler returns 500 for unexpected errors', async () => {
    prismaMock.category.create.mockRejectedValue(new Error('db offline'));

    const req = createRequest({
      method: 'POST',
      body: { title: 'Projects', shortcode: 'projects' },
    });
    const res = createResponse();

    await categoriesCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create category.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('categories by id handler rejects invalid id', async () => {
    const req = createRequest({ method: 'PUT', query: { id: 'abc' } });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid category id.' });
  });

  it('categories by id handler rejects array id values', async () => {
    const req = createRequest({ method: 'PUT', query: { id: ['12', '13'] as unknown as string } });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid category id.' });
  });

  it('categories by id handler deletes category within transaction', async () => {
    const req = createRequest({ method: 'DELETE', query: { id: '12' } });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(prismaMock.projectCategory.deleteMany).toHaveBeenCalledWith({ where: { category_id: 12 } });
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: 12 } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('categories by id handler maps missing records to 404 on update', async () => {
    prismaMock.category.update.mockRejectedValue(createKnownPrismaError('P2025'));

    const req = createRequest({
      method: 'PUT',
      query: { id: '12' },
      body: { title: 'Updated', shortcode: 'updated' },
    });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Category not found.' });
  });

  it('categories by id handler maps duplicate shortcode errors to 409 on update', async () => {
    prismaMock.category.update.mockRejectedValue(createKnownPrismaError('P2002'));

    const req = createRequest({
      method: 'PUT',
      query: { id: '12' },
      body: { title: 'Updated', shortcode: 'duplicate' },
    });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'That shortcode is already in use.' });
  });

  it('categories by id handler maps missing records to 404 on delete', async () => {
    prismaMock.category.delete.mockRejectedValue(createKnownPrismaError('P2025'));

    const req = createRequest({ method: 'DELETE', query: { id: '12' } });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Category not found.' });
  });

  it('categories by id handler returns 500 for unexpected update errors', async () => {
    prismaMock.category.update.mockRejectedValue(new Error('db offline'));

    const req = createRequest({
      method: 'PUT',
      query: { id: '12' },
      body: { title: 'Updated', shortcode: 'updated' },
    });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update category.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('categories by id handler returns 500 for unexpected delete errors', async () => {
    prismaMock.category.delete.mockRejectedValue(new Error('db offline'));

    const req = createRequest({ method: 'DELETE', query: { id: '12' } });
    const res = createResponse();

    await categoriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete category.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('inquiries handler validates status values', async () => {
    const req = createRequest({ method: 'PATCH', query: { id: '1' }, body: { status: 'invalid' } });
    const res = createResponse();

    await inquiriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid inquiry status.' });
  });

  it('inquiries handler rejects array id values', async () => {
    const req = createRequest({
      method: 'PATCH',
      query: { id: ['1', '2'] as unknown as string },
      body: { status: 'reviewed' },
    });
    const res = createResponse();

    await inquiriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid inquiry id.' });
  });

  it('inquiries handler returns updated inquiry payload', async () => {
    const updatedAt = new Date('2026-04-01T12:00:00.000Z');
    prismaMock.inquiry.update.mockResolvedValue({ id: 5, status: 'reviewed', updated_at: updatedAt });

    const req = createRequest({ method: 'PATCH', query: { id: '5' }, body: { status: 'reviewed' } });
    const res = createResponse();

    await inquiriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      inquiry: {
        id: 5,
        status: 'reviewed',
        updated_at: updatedAt.toISOString(),
      },
    });
  });

  it('inquiries handler maps missing inquiry to 404', async () => {
    prismaMock.inquiry.update.mockRejectedValue(createKnownPrismaError('P2025'));

    const req = createRequest({ method: 'PATCH', query: { id: '7' }, body: { status: 'reviewed' } });
    const res = createResponse();

    await inquiriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Inquiry not found.' });
  });

  it('inquiries handler returns 500 for unexpected errors', async () => {
    prismaMock.inquiry.update.mockRejectedValue(new Error('db offline'));

    const req = createRequest({ method: 'PATCH', query: { id: '7' }, body: { status: 'reviewed' } });
    const res = createResponse();

    await inquiriesByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update inquiry.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('settings handler rejects invalid methods', async () => {
    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    await settingsHandler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('PUT');
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('settings handler validates the request payload', async () => {
    const req = createRequest({ method: 'PUT', body: {} });
    const res = createResponse();

    await settingsHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'A settings object is required.' });
  });

  it('settings handler updates existing rows and creates missing rows', async () => {
    prismaMock.settings.findMany.mockResolvedValue([
      { id: 5, key: 'home/banner/title', value: 'Old Title', updated_at: new Date('2026-04-14T00:00:00.000Z') },
    ]);
    prismaMock.settings.update.mockResolvedValue({ id: 5 });
    prismaMock.settings.create.mockResolvedValue({ id: 9 });

    const req = createRequest({
      method: 'PUT',
      body: {
        settings: {
          'home/banner/title': 'David Conway Jr.',
          'home/banner/eyebrow': 'Backend Developer',
        },
      },
    });
    const res = createResponse();

    await settingsHandler(req as never, res as never);

    expect(prismaMock.settings.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          key: {
            in: ['home/banner/title', 'home/banner/eyebrow'],
          },
        },
      }),
    );
    expect(prismaMock.settings.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { value: 'David Conway Jr.' },
    });
    expect(prismaMock.settings.create).toHaveBeenCalledWith({
      data: {
        key: 'home/banner/eyebrow',
        value: 'Backend Developer',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      settings: {
        'home/banner/title': 'David Conway Jr.',
        'home/banner/eyebrow': 'Backend Developer',
      },
    });
  });

  it('settings handler returns 500 for unexpected errors', async () => {
    prismaMock.settings.findMany.mockRejectedValue(new Error('db offline'));

    const req = createRequest({
      method: 'PUT',
      body: {
        settings: {
          'home/banner/title': 'David Conway Jr.',
        },
      },
    });
    const res = createResponse();

    await settingsHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to save settings.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('projects create handler returns validation errors from normalization', async () => {
    normalizeProjectPayloadMock.mockReturnValue({ ok: false, error: 'Project name is required.' });
    const req = createRequest({ method: 'POST', body: {} });
    const res = createResponse();

    await projectsCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Project name is required.' });
  });

  it('projects create handler checks category existence', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [{ category_id: 1, priority: 1 }],
      },
    });
    prismaMock.category.findMany.mockResolvedValue([]);

    const req = createRequest({ method: 'POST', body: { name: 'Project A' } });
    const res = createResponse();

    await projectsCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'One or more selected categories no longer exist.' });
  });

  it('projects create handler returns serialized project on success', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.create.mockResolvedValue({ id: 101, name: 'Project A' });
    serializeAdminProjectMock.mockReturnValue({ id: 101, name: 'Project A' });

    const req = createRequest({ method: 'POST', body: { name: 'Project A' } });
    const res = createResponse();

    await projectsCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ project: { id: 101, name: 'Project A' } });
  });

  it('projects create handler maps known Prisma errors to 400', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.create.mockRejectedValue(createKnownPrismaError('P2003'));

    const req = createRequest({ method: 'POST', body: { name: 'Project A' } });
    const res = createResponse();

    await projectsCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Unable to create project with the submitted data.' });
  });

  it('projects create handler returns 500 for unexpected errors', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.create.mockRejectedValue(new Error('db offline'));

    const req = createRequest({ method: 'POST', body: { name: 'Project A' } });
    const res = createResponse();

    await projectsCreateHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create project.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('projects by id handler validates project id', async () => {
    const req = createRequest({ method: 'PUT', query: { id: 'nope' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid project id.' });
  });

  it('projects by id handler rejects array id values', async () => {
    const req = createRequest({ method: 'PUT', query: { id: ['41', '42'] as unknown as string } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid project id.' });
  });

  it('projects by id handler deletes project-related records in transaction', async () => {
    const req = createRequest({ method: 'DELETE', query: { id: '41' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(prismaMock.projectGallery.deleteMany).toHaveBeenCalledWith({ where: { project_id: 41 } });
    expect(prismaMock.projectCategory.deleteMany).toHaveBeenCalledWith({ where: { project_id: 41 } });
    expect(prismaMock.projectSkill.deleteMany).toHaveBeenCalledWith({ where: { project_id: 41 } });
    expect(prismaMock.projectLink.deleteMany).toHaveBeenCalledWith({ where: { project_id: 41 } });
    expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: 41 } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('projects by id handler maps missing records to 404 on update', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.update.mockRejectedValue(createKnownPrismaError('P2025'));

    const req = createRequest({ method: 'PUT', query: { id: '41' }, body: { name: 'Project A' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Project not found.' });
  });

  it('projects by id handler maps known Prisma errors to 400 on update', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.update.mockRejectedValue(createKnownPrismaError('P2002'));

    const req = createRequest({ method: 'PUT', query: { id: '41' }, body: { name: 'Project A' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Unable to update project with the submitted data.' });
  });

  it('projects by id handler maps missing records to 404 on delete', async () => {
    prismaMock.project.delete.mockRejectedValue(createKnownPrismaError('P2025'));

    const req = createRequest({ method: 'DELETE', query: { id: '41' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Project not found.' });
  });

  it('projects by id handler returns 500 for unexpected update errors', async () => {
    normalizeProjectPayloadMock.mockReturnValue({
      ok: true,
      data: {
        name: 'Project A',
        short: 'Short',
        role: 'Developer',
        position: 'Freelancer',
        extended: null,
        start_date: null,
        end_date: null,
        links: [],
        gallery: [],
        categories: [],
      },
    });
    prismaMock.project.update.mockRejectedValue(new Error('db offline'));

    const req = createRequest({ method: 'PUT', query: { id: '41' }, body: { name: 'Project A' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update project.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('projects by id handler returns 500 for unexpected delete errors', async () => {
    prismaMock.project.delete.mockRejectedValue(new Error('db offline'));

    const req = createRequest({ method: 'DELETE', query: { id: '41' } });
    const res = createResponse();

    await projectsByIdHandler(req as never, res as never);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete project.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
