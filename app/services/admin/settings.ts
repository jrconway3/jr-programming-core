import { prisma } from 'prisma/adapter';
import { editableSiteSettingKeys, mergeSettingsWithDefaults } from 'app/services/settings';

export async function getAdminSettingsPageData(): Promise<{ settings: Record<string, string> }> {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: editableSiteSettingKeys,
      },
    },
    orderBy: [
      { updated_at: 'desc' },
      { id: 'desc' },
    ],
  });

  return {
    settings: mergeSettingsWithDefaults(settings),
  };
}
