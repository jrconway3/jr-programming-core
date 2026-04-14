import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../lib/admin-auth';
import { editableSiteSettingKeys, mergeSettingsWithDefaults } from '../../../lib/site-settings';
import { prisma } from '../../../prisma/adapter';

type SettingsPayload = {
  settings?: Record<string, unknown>;
};

const editableSettingKeySet = new Set(editableSiteSettingKeys);

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

    normalizedSettings[key] = value.trim();
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
            data: { value },
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