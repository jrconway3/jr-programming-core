import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  getAdminPagePropsMock,
  clearAdminSessionCookieMock,
  getAdminProjectsPageDataMock,
  serializeAdminProjectMock,
  prismaMock,
} = vi.hoisted(() => ({
  getAdminPagePropsMock: vi.fn(),
  clearAdminSessionCookieMock: vi.fn(),
  getAdminProjectsPageDataMock: vi.fn(),
  serializeAdminProjectMock: vi.fn(),
  prismaMock: {
    project: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    settings: {
      findMany: vi.fn(),
    },
    inquiry: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('app/services/admin/auth', () => ({
  getAdminPageProps: getAdminPagePropsMock,
  clearAdminSessionCookie: clearAdminSessionCookieMock,
}));

vi.mock('app/services/admin/projects', () => ({
  getAdminProjectsPageData: getAdminProjectsPageDataMock,
  adminProjectInclude: { include: 'adminProjectInclude' },
  serializeAdminProject: serializeAdminProjectMock,
}));

vi.mock('prisma/adapter', () => ({
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

let logoutHandler: typeof import('../pages/api/admin/auth/logout').default;
let dashboardGetServerSideProps: typeof import('../pages/admin/index').getServerSideProps;
let inquiriesGetServerSideProps: typeof import('../pages/admin/inquiries').getServerSideProps;
let categoriesGetServerSideProps: typeof import('../pages/admin/categories').getServerSideProps;
let projectsGetServerSideProps: typeof import('../pages/admin/projects').getServerSideProps;
let settingsGetServerSideProps: typeof import('../pages/admin/settings').getServerSideProps;

describe('admin logout and page server loaders', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    logoutHandler = (await import('../pages/api/admin/auth/logout')).default;
    dashboardGetServerSideProps = (await import('../pages/admin/index')).getServerSideProps;
    inquiriesGetServerSideProps = (await import('../pages/admin/inquiries')).getServerSideProps;
    categoriesGetServerSideProps = (await import('../pages/admin/categories')).getServerSideProps;
    projectsGetServerSideProps = (await import('../pages/admin/projects')).getServerSideProps;
    settingsGetServerSideProps = (await import('../pages/admin/settings')).getServerSideProps;

    clearAdminSessionCookieMock.mockReturnValue('jr_admin_session=; Path=/; HttpOnly');
    getAdminProjectsPageDataMock.mockReset();
    getAdminProjectsPageDataMock.mockResolvedValue({
      categories: [],
      projects: [],
    });

    getAdminPagePropsMock.mockImplementation(async (_context, loadPageProps) => {
      const extraProps = loadPageProps ? await loadPageProps() : {};
      return {
        props: {
          adminUser: 'admin',
          ...extraProps,
        },
      };
    });
  });

  it('logout handler rejects non-POST methods', async () => {
    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    await logoutHandler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
    expect(res.body).toEqual({ ok: false, error: { message: 'Method not allowed' } });
  });

  it('logout handler clears the session cookie', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createResponse();

    await logoutHandler(req as never, res as never);

    expect(clearAdminSessionCookieMock).toHaveBeenCalledOnce();
    expect(res.headers['Set-Cookie']).toBe('jr_admin_session=; Path=/; HttpOnly');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { success: true } });
  });

  it('dashboard getServerSideProps loads and serializes summary data', async () => {
    const createdAt = new Date('2026-04-01T12:00:00.000Z');
    prismaMock.project.count.mockResolvedValue(12);
    prismaMock.category.count.mockResolvedValue(4);
    prismaMock.inquiry.count.mockResolvedValueOnce(20).mockResolvedValueOnce(7);
    prismaMock.inquiry.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Hello',
        status: 'pending',
        created_at: createdAt,
      },
    ]);

    const result = await dashboardGetServerSideProps({} as never);

    expect(prismaMock.project.count).toHaveBeenCalledOnce();
    expect(prismaMock.category.count).toHaveBeenCalledOnce();
    expect(prismaMock.inquiry.count).toHaveBeenCalledTimes(2);
    expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: 'desc' },
        take: 6,
      }),
    );
    expect(result).toEqual({
      props: {
        adminUser: 'admin',
        projectCount: 12,
        categoryCount: 4,
        inquiryCount: 20,
        pendingInquiryCount: 7,
        recentInquiries: [
          {
            id: 1,
            name: 'Jane',
            email: 'jane@example.com',
            subject: 'Hello',
            status: 'pending',
            created_at: createdAt.toISOString(),
          },
        ],
      },
    });
  });

  it('inquiries getServerSideProps converts date fields to strings', async () => {
    const createdAt = new Date('2026-04-01T12:00:00.000Z');
    const updatedAt = new Date('2026-04-01T13:00:00.000Z');
    const sentAt = new Date('2026-04-01T14:00:00.000Z');

    prismaMock.inquiry.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Jane',
        email: 'jane@example.com',
        company: null,
        subject: 'Hello',
        message: 'Test',
        status: 'pending',
        spam_score: 0,
        spam_reason: null,
        user_agent: null,
        sent_at: sentAt,
        created_at: createdAt,
        updated_at: updatedAt,
      },
    ]);

    const result = await inquiriesGetServerSideProps({} as never);

    expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: 'desc' },
        take: 150,
      }),
    );
    expect(result).toEqual({
      props: {
        adminUser: 'admin',
        inquiries: [
          {
            id: 1,
            name: 'Jane',
            email: 'jane@example.com',
            company: null,
            subject: 'Hello',
            message: 'Test',
            status: 'pending',
            spam_score: 0,
            spam_reason: null,
            user_agent: null,
            sent_at: sentAt.toISOString(),
            created_at: createdAt.toISOString(),
            updated_at: updatedAt.toISOString(),
          },
        ],
      },
    });
  });

  it('categories getServerSideProps maps project counts from relation counts', async () => {
    const createdAt = new Date('2026-04-01T12:00:00.000Z');
    const updatedAt = new Date('2026-04-01T13:00:00.000Z');

    prismaMock.category.findMany.mockResolvedValue([
      {
        id: 5,
        title: 'Projects',
        shortcode: 'projects',
        created_at: createdAt,
        updated_at: updatedAt,
        _count: { projects: 11 },
      },
    ]);

    const result = await categoriesGetServerSideProps({} as never);

    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: 'asc' },
      }),
    );
    expect(result).toEqual({
      props: {
        adminUser: 'admin',
        categories: [
          {
            id: 5,
            title: 'Projects',
            shortcode: 'projects',
            created_at: createdAt.toISOString(),
            updated_at: updatedAt.toISOString(),
            projectCount: 11,
          },
        ],
      },
    });
  });

  it('projects getServerSideProps returns selected categories and serialized projects', async () => {
    getAdminProjectsPageDataMock.mockResolvedValue({
      categories: [{ id: 1, title: 'Projects', shortcode: 'projects' }],
      projects: [{ id: 10, name: 'Serialized Project' }],
    });

    const result = await projectsGetServerSideProps({} as never);

    expect(getAdminProjectsPageDataMock).toHaveBeenCalledOnce();
    expect(result).toEqual({
      props: {
        adminUser: 'admin',
        categories: [{ id: 1, title: 'Projects', shortcode: 'projects' }],
        projects: [{ id: 10, name: 'Serialized Project' }],
      },
    });
  });

  it('settings getServerSideProps merges stored hero settings with defaults', async () => {
    prismaMock.settings.findMany.mockResolvedValue([
      {
        id: 2,
        key: 'home/banner/title',
        value: 'David Conway Jr.',
        updated_at: new Date('2026-04-14T00:00:00.000Z'),
      },
      {
        id: 3,
        key: 'home/banner/cta/primary/label',
        value: 'View My Work',
        updated_at: new Date('2026-04-14T00:00:00.000Z'),
      },
    ]);

    const result = await settingsGetServerSideProps({} as never);

    expect(prismaMock.settings.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          key: {
            in: expect.arrayContaining(['home/banner/title', 'home/banner/subtitle']),
          },
        },
      }),
    );
    expect(result).toEqual({
      props: {
        adminUser: 'admin',
        settings: expect.objectContaining({
          'home/banner/title': 'David Conway Jr.',
          'home/banner/cta/primary/label': 'View My Work',
          'home/banner/subtitle': 'I help businesses automate workflows, integrate APIs, and scale backend systems',
        }),
      },
    });
  });
});
