import { afterEach, describe, expect, it } from 'vitest';
import type { GetServerSidePropsContext } from 'next';
import {
  createAdminSessionCookie,
  getAdminPageProps,
  getAdminSession,
  isAdminAuthConfigured,
  requireAdminApi,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from '../lib/admin-auth';

type JsonValue = Record<string, unknown>;

type MockResponse = {
  statusCode: number;
  body: JsonValue | null;
  status: (code: number) => MockResponse;
  json: (payload: JsonValue) => MockResponse;
};

const originalEnv = { ...process.env };

function createRequest(cookieHeader?: string) {
  return {
    headers: {
      cookie: cookieHeader,
    },
  };
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: JsonValue) {
      this.body = payload;
      return this;
    },
  };
}

function extractCookiePair(setCookie: string): string {
  return setCookie.split(';')[0] ?? setCookie;
}

function createContext(cookieHeader?: string, resolvedUrl = '/admin/projects') {
  return {
    req: createRequest(cookieHeader),
    resolvedUrl,
  } as GetServerSidePropsContext;
}

describe('admin auth helpers', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('reports when admin auth is configured', () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    expect(isAdminAuthConfigured()).toBe(true);
  });

  it('reports when admin auth is missing required configuration', () => {
    delete process.env.ADMIN_PASSWORD;
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    expect(isAdminAuthConfigured()).toBe(false);
  });

  it('validates credentials against configured values', () => {
    process.env.ADMIN_USERNAME = 'owner';
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    expect(validateAdminCredentials('owner', 'secret-password')).toBe(true);
    expect(validateAdminCredentials('owner', 'wrong')).toBe(false);
    expect(validateAdminCredentials('admin', 'secret-password')).toBe(false);
  });

  it('creates a signed cookie that round-trips through getAdminSession', () => {
    process.env.ADMIN_USERNAME = 'owner';
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('owner');

    expect(setCookie).toBeTruthy();

    const session = getAdminSession(createRequest(extractCookiePair(setCookie!)) as never);

    expect(session).toMatchObject({ username: 'owner' });
    expect(session?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects tampered admin session cookies', () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('admin');
    const tamperedCookie = `${extractCookiePair(setCookie!).slice(0, -1)}x`;

    expect(getAdminSession(createRequest(tamperedCookie) as never)).toBeNull();
  });

  it('returns a 401 response when an admin API request has no session', () => {
    const res = createResponse();

    const session = requireAdminApi(createRequest() as never, res as never);

    expect(session).toBeNull();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Authentication required' });
  });

  it('returns the session when an admin API request is authenticated', () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('admin');
    const req = createRequest(extractCookiePair(setCookie!));
    const res = createResponse();

    const session = requireAdminApi(req as never, res as never);

    expect(session).toMatchObject({ username: 'admin' });
    expect(res.statusCode).toBe(200);
  });

  it('redirects unauthenticated admin pages to login with a safe next path', async () => {
    const result = await getAdminPageProps(createContext(undefined, '/admin/projects?tab=active'));

    expect(result).toEqual({
      redirect: {
        destination: '/admin/login?next=%2Fadmin%2Fprojects%3Ftab%3Dactive',
        permanent: false,
      },
    });
  });

  it('returns page props for authenticated admin pages', async () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('admin');
    const result = await getAdminPageProps(
      createContext(extractCookiePair(setCookie!), '/admin/projects'),
      async () => ({ section: 'projects' }),
    );

    expect(result).toEqual({
      props: {
        section: 'projects',
        adminUser: 'admin',
      },
    });
  });

  it('sanitizes /admin/login next path to avoid redirect loops', () => {
    expect(sanitizeAdminNextPath('/admin/login')).toBe('/admin');
    expect(sanitizeAdminNextPath('/admin/login?next=%2Fadmin%2Flogin')).toBe('/admin');
  });
});
