import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminSessionCookie } from '../lib/admin-auth';
import { proxy } from '../proxy';

const originalEnv = { ...process.env };

function extractCookiePair(setCookie: string): string {
  return setCookie.split(';')[0] ?? setCookie;
}

function createRequest(pathname: string, cookieHeader?: string) {
  return new NextRequest(`https://jrprogramming.test${pathname}`, {
    headers: cookieHeader
      ? { cookie: cookieHeader }
      : undefined,
  });
}

describe('admin proxy protection', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('allows the admin login page through without authentication', async () => {
    const response = await proxy(createRequest('/admin/login'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects unauthenticated admin pages to the login page', async () => {
    const response = await proxy(createRequest('/admin/projects?tab=active'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://jrprogramming.test/admin/login?next=%2Fadmin%2Fprojects%3Ftab%3Dactive',
    );
  });

  it('returns 401 for unauthenticated admin API requests', async () => {
    const response = await proxy(createRequest('/api/admin/projects'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
  });

  it('allows authenticated admin page requests through', async () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('admin');
    const response = await proxy(createRequest('/admin/projects', extractCookiePair(setCookie!)));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('rejects invalid admin session cookies at the proxy layer', async () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('admin');
    const tamperedCookie = `${extractCookiePair(setCookie!).slice(0, -1)}x`;
    const response = await proxy(createRequest('/admin/projects', tamperedCookie));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://jrprogramming.test/admin/login?next=%2Fadmin%2Fprojects',
    );
  });
});