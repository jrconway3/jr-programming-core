import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { createAdminSessionCookie } from 'app/services/admin/auth';
import nextConfig from '../next.config.mjs';
import { config, proxy } from '../proxy';

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

  it('matches admin page routes', () => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/admin' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/admin/projects' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/admin/login' })).toBe(true);
  });

  it('matches admin API routes', () => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/admin/projects' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/admin/projects/42' })).toBe(true);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/admin/auth/login' })).toBe(true);
  });

  it('does not match non-admin routes', () => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/' })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/contact' })).toBe(false);
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: '/api/contact' })).toBe(false);
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

  it('allows authenticated admin requests when the session username requires cookie decoding', async () => {
    process.env.ADMIN_PASSWORD = 'secret-password';
    process.env.ADMIN_SESSION_SECRET = 'top-secret-signing-key';

    const setCookie = createAdminSessionCookie('owner@example.com');
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