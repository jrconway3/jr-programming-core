export type AdminSession = {
  username: string;
  expiresAt: number;
};

export const ADMIN_SESSION_COOKIE = 'jr_admin_session';
export const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function buildSessionPayload(username: string, expiresAt: number): string {
  return `${username}.${expiresAt}`;
}

function hexFromBuffer(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function safeCompare(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function signSessionPayload(payload: string, sessionSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return hexFromBuffer(signature);
}

export async function readAdminSessionValue(
  sessionValue: string | null | undefined,
  sessionSecret: string | null | undefined,
): Promise<AdminSession | null> {
  if (!sessionValue || !sessionSecret) {
    return null;
  }

  const [username, expiresAtRaw, signature] = sessionValue.split('.');

  if (!username || !expiresAtRaw || !signature) {
    return null;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);

  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    return null;
  }

  const expectedSignature = await signSessionPayload(buildSessionPayload(username, expiresAt), sessionSecret);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  return {
    username,
    expiresAt,
  };
}

export function sanitizeAdminNextPath(nextValue: unknown): string {
  if (typeof nextValue !== 'string') {
    return '/admin';
  }

  if (!nextValue.startsWith('/')) {
    return '/admin';
  }

  if (nextValue.startsWith('//') || nextValue.startsWith('/api/')) {
    return '/admin';
  }

  if (!nextValue.startsWith('/admin')) {
    return '/admin';
  }

  return nextValue;
}
