export type CategoryRecord = {
  id: number;
  title: string;
  shortcode: string;
};

export type AdminCategoryRecord = {
  id: number;
  title: string;
  shortcode: string;
  created_at: string;
  updated_at: string;
  projectCount: number;
};

export function transformCategory(category: CategoryRecord): CategoryRecord {
  return {
    id: category.id,
    title: category.title,
    shortcode: category.shortcode,
  };
}

export function transformAdminCategory(category: {
  id: number;
  title: string;
  shortcode: string;
  created_at: Date;
  updated_at: Date;
  _count: { projects: number };
}): AdminCategoryRecord {
  return {
    id: category.id,
    title: category.title,
    shortcode: category.shortcode,
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
    projectCount: category._count.projects,
  };
}
