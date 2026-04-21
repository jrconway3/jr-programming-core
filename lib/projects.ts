import { prisma } from '../prisma/adapter';
import { serializeProject, serializeProjects } from '../models/projects';
import type { Project, ProjectDetail } from '../models/projects';
import type { Category } from '../models/categories';

const projectWithRelationsInclude = {
  skills: {
    include: { skill: true },
    orderBy: { priority: 'asc' },
  },
  categories: {
    include: { category: true },
    orderBy: { priority: 'asc' },
  },
} as const;

const projectWithFullInclude = {
  ...projectWithRelationsInclude,
  links: { orderBy: { priority: 'asc' } },
  gallery: { orderBy: { priority: 'asc' } },
} as const;

const dateOrder = [
  { end_date: { sort: 'desc' as const, nulls: 'first' as const } },
  { start_date: 'asc' as const },
];

export type ProjectStatsEntry = {
  start_date?: string | null;
  position?: string | null;
  name: string;
  short: string;
  role?: string | null;
  categories: { category: { shortcode: string } }[];
};

export async function getProjectsByShortcode(shortcode: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { categories: { some: { category: { shortcode } } } },
    include: projectWithRelationsInclude,
    orderBy: dateOrder,
  });
  return serializeProjects(rows);
}

export async function getFeaturedProjects(take = 4): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { categories: { some: { category: { shortcode: 'featured-projects' } } } },
    include: projectWithRelationsInclude,
    orderBy: dateOrder,
    take,
  });
  return serializeProjects(rows);
}

export async function getAllProjectStats(): Promise<ProjectStatsEntry[]> {
  const rows = await prisma.project.findMany({
    select: {
      start_date: true,
      position: true,
      name: true,
      short: true,
      role: true,
      categories: {
        select: { category: { select: { shortcode: true } } },
      },
    },
  });
  // Dates from a select query are already plain values after JSON serialization
  return JSON.parse(JSON.stringify(rows));
}

export async function getProjectById(id: number): Promise<ProjectDetail | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    include: projectWithFullInclude,
  });
  if (!row) return null;
  return serializeProject<ProjectDetail>(row);
}

export async function getCategoryByShortcode(shortcode: string): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { shortcode },
    select: { id: true, title: true, shortcode: true },
  });
}
