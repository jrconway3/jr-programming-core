import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, readAdminSessionValue, sanitizeAdminNextPath } from './lib/admin-session';

const publicAdminPagePaths = new Set([
  '/admin/login',
]);

const publicAdminApiPaths = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
]);

function isPublicAdminPath(pathname: string): boolean {
  return publicAdminPagePaths.has(pathname) || publicAdminApiPaths.has(pathname);
}

function isAdminApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/admin');
}

function buildUnauthorizedApiResponse(): NextResponse {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('next', sanitizeAdminNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`));
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  const rawSessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  let sessionValue = rawSessionValue;

  if (rawSessionValue) {
    try {
      sessionValue = decodeURIComponent(rawSessionValue);
    } catch {
      sessionValue = rawSessionValue;
    }
  }

  const session = await readAdminSessionValue(sessionValue, sessionSecret);

  if (session) {
    return NextResponse.next();
  }

  if (isAdminApiPath(pathname)) {
    return buildUnauthorizedApiResponse();
  }

  return buildLoginRedirect(request);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};