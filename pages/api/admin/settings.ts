import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../lib/admin-auth';
import { editableSiteSettingKeys, mergeSettingsWithDefaults } from '../../../lib/site-settings';
import { prisma } from '../../../prisma/adapter';

type SettingsPayload = {
  settings?: Record<string, unknown>;
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAdminApi(req, res);

  if (!session) {
    return;
  }

  const { settings } = (req.body ?? {}) as SettingsPayload;

  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    res.status(400).json({ error: 'A settings object is required.' });
    return;
  }

  const submittedEntries = Object.entries(settings).filter(([key]) => editableSettingKeySet.has(key));

  if (submittedEntries.length === 0) {
    res.status(400).json({ error: 'No editable settings were provided.' });
    return;
  }

  const normalizedSettings: Record<string, string> = {};

  for (const [key, value] of submittedEntries) {
    if (typeof value !== 'string') {
      res.status(400).json({ error: `Invalid value supplied for ${key}.` });
      return;
    }

    const trimmed = value.trim();

    if (relativeHrefKeys.has(key) && !isSafeRelativeHref(trimmed)) {
      res.status(400).json({ error: `Value for '${key}' must be a relative path or anchor (starting with / or #).` });
      return;
    }

    if (httpsUrlKeys.has(key) && !isSafeHttpsUrl(trimmed)) {
      res.status(400).json({ error: `Value for '${key}' must be a valid https:// URL.` });
      return;
    }

    normalizedSettings[key] = trimmed;
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const existingRows = await transaction.settings.findMany({
        where: {
          key: {
            in: Object.keys(normalizedSettings),
          },
        },
        orderBy: [
          { updated_at: 'desc' },
          { id: 'desc' },
        ],
      });

      const currentRowsByKey = new Map<string, { id: number }>();

      for (const row of existingRows) {
        if (!currentRowsByKey.has(row.key)) {
          currentRowsByKey.set(row.key, { id: row.id });
        }
      }

      for (const [key, value] of Object.entries(normalizedSettings)) {
        const currentRow = currentRowsByKey.get(key);

        if (currentRow) {
          await transaction.settings.update({
            where: { id: currentRow.id },
            data: { value, updated_at: new Date() },
          });
        } else {
          await transaction.settings.create({
            data: {
              key,
              value,
            },
          });
        }
      }
    });

    res.status(200).json({
      settings: mergeSettingsWithDefaults(
        Object.entries(normalizedSettings).map(([key, value]) => ({ key, value })),
      ),
    });
  } catch (error) {
    console.error('PUT /api/admin/settings failed', error);
    res.status(500).json({ error: 'Failed to save settings.' });
  }
}