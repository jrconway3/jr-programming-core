import { prisma } from 'prisma/adapter';
import { transformAdminCategory, type AdminCategoryRecord } from 'app/transformers/categories';

export function normalizeShortcode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getAdminCategoriesPageData(): Promise<{ categories: AdminCategoryRecord[] }> {
  const categories = await prisma.category.findMany({
    orderBy: { title: 'asc' },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  return {
    categories: categories.map((category) => transformAdminCategory(category)),
  };
}