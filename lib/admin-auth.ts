import { createHmac, timingSafeEqual } from 'node:crypto';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ADMIN_SESSION_COOKIE, SESSION_DURATION_SECONDS, sanitizeAdminNextPath } from './admin-session';
export { sanitizeAdminNextPath } from './admin-session';

type AdminSession = {
  username: string;
  expiresAt: number;
};

type AdminPageProps = {
  adminUser: string;
};

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();

      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
      return cookies;
    }, {});
}

function getCookie(req: NextApiRequest | GetServerSidePropsContext['req'], name: string): string | null {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[name] ?? null;
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim() || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  return {
    username,
    password,
    sessionSecret,
  };
}

export function isAdminAuthConfigured(): boolean {
  const { password, sessionSecret } = getAdminConfig();
  return Boolean(password && sessionSecret);
}

function signSession(username: string, expiresAt: number, sessionSecret: string): string {
  return createHmac('sha256', sessionSecret)
    .update(`${username}.${expiresAt}`)
    .digest('hex');
}

function createSessionValue(username: string, expiresAt: number): string | null {
  const { sessionSecret } = getAdminConfig();

  if (!sessionSecret) {
    return null;
  }

  const signature = signSession(username, expiresAt, sessionSecret);
  return `${username}.${expiresAt}.${signature}`;
}

function readSessionValue(sessionValue: string | null): AdminSession | null {
  if (!sessionValue) {
    return null;
  }

  const { sessionSecret } = getAdminConfig();

  if (!sessionSecret) {
    return null;
  }

  const lastSeparator = sessionValue.lastIndexOf('.');
  const secondLastSeparator = lastSeparator > 0 ? sessionValue.lastIndexOf('.', lastSeparator - 1) : -1;

  if (lastSeparator === -1 || secondLastSeparator === -1) {
    return null;
  }

  const username = sessionValue.slice(0, secondLastSeparator);
  const expiresAtRaw = sessionValue.slice(secondLastSeparator + 1, lastSeparator);
  const signature = sessionValue.slice(lastSeparator + 1);

  if (!username || !expiresAtRaw || !signature) {
    return null;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);

  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    return null;
  }

  const expectedSignature = signSession(username, expiresAt, sessionSecret);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  return {
    username,
    expiresAt,
  };
}

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure' : '';
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();

  return [
    `${name}=${encodeCookieValue(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expires}`,
    secure,
  ].filter(Boolean).join('; ');
}

export function createAdminSessionCookie(username: string): string | null {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const sessionValue = createSessionValue(username, expiresAt);

  if (!sessionValue) {
    return null;
  }

  return buildCookie(ADMIN_SESSION_COOKIE, sessionValue, SESSION_DURATION_SECONDS);
}

export function clearAdminSessionCookie(): string {
  return buildCookie(ADMIN_SESSION_COOKIE, '', 0);
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const config = getAdminConfig();

  if (!config.password || !config.sessionSecret) {
    return false;
  }

  return safeCompare(username, config.username) && safeCompare(password, config.password);
}

export function getAdminSession(
  req: NextApiRequest | GetServerSidePropsContext['req'],
): AdminSession | null {
  const sessionValue = getCookie(req, ADMIN_SESSION_COOKIE);
  return readSessionValue(sessionValue);
}

export function requireAdminApi(req: NextApiRequest, res: NextApiResponse): AdminSession | null {
  const session = getAdminSession(req);

  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  return session;
}

export async function getAdminPageProps<P extends Record<string, unknown>>(
  context: GetServerSidePropsContext,
  loader?: () => Promise<P> | P,
): Promise<GetServerSidePropsResult<P & AdminPageProps>> {
  const session = getAdminSession(context.req);

  if (!session) {
    return {
      redirect: {
        destination: `/admin/login?next=${encodeURIComponent(sanitizeAdminNextPath(context.resolvedUrl))}`,
        permanent: false,
      },
    };
  }

  const props = loader ? await loader() : ({} as P);

  return {
    props: {
      ...props,
      adminUser: session.username,
    },
  };
}
