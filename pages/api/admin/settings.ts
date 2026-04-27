import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { editableSiteSettingKeys, mergeSettingsWithDefaults } from 'app/services/settings';
import { prisma } from 'prisma/adapter';

type SettingsPayload = {
  settings?: Record<string, unknown>;
};

type AdminSettingsResponse = ApiEnvelope<{ settings: Record<string, unknown> }>;

const editableSettingKeySet = new Set(editableSiteSettingKeys);

// Keys whose values must be safe relative paths/anchors.
const relativeHrefKeys = new Set([
  'home/banner/cta/primary/href',
  'home/banner/cta/secondary/href',
  'home/status/cta/href',
]);

// Keys whose values must be valid https:// URLs.
const httpsUrlKeys = new Set(['footer/font/url']);

function isSafeRelativeHref(value: string): boolean {
  if (value.startsWith('#')) {
    return true;
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('\\') || value.includes('\\')) {
    return false;
  }

  try {
    const baseUrl = new URL('https://example.com');
    const resolvedUrl = new URL(value, baseUrl);
    return resolvedUrl.origin === baseUrl.origin && resolvedUrl.pathname.startsWith('/');
  } catch {
    return false;
  }
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.length > 0 &&
      url.username === '' &&
      url.password === ''
    );
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AdminSettingsResponse>) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    sendApiError(res, 405, 'Method not allowed');
    return;
  }

  if (!requireAdminApi(req, res)) {
    return;
  }

  const { settings } = (req.body ?? {}) as SettingsPayload;

  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    sendApiError(res, 400, 'A settings object is required.');
    return;
  }

  const submittedEntries = Object.entries(settings).filter(([key]) => editableSettingKeySet.has(key));

  if (submittedEntries.length === 0) {
    sendApiError(res, 400, 'No editable settings were provided.');
    return;
  }

  const normalizedSettings: Record<string, string> = {};

  for (const [key, value] of submittedEntries) {
    if (typeof value !== 'string') {
      sendApiError(res, 400, `Invalid value supplied for ${key}.`);
      return;
    }

    const trimmed = value.trim();

    if (relativeHrefKeys.has(key) && !isSafeRelativeHref(trimmed)) {
      sendApiError(res, 400, `Value for '${key}' must be a relative path or anchor (starting with / or #).`);
      return;
    }

    if (httpsUrlKeys.has(key) && !isSafeHttpsUrl(trimmed)) {
      sendApiError(res, 400, `Value for '${key}' must be a valid https:// URL.`);
      return;
    }

    normalizedSettings[key] = trimmed;
  }

  try {
    await prisma.$transaction(
      Object.entries(normalizedSettings).map(([key, value]) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return sendApiSuccess(res, 200, {
      settings: mergeSettingsWithDefaults(
        Object.entries(normalizedSettings).map(([key, value]) => ({ key, value })),
      ),
    });
  } catch (error) {
    console.error('PUT /api/admin/settings failed', error);
    return sendApiError(res, 500, 'Failed to save settings.');
  }
}