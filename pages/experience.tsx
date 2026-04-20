import type { GetServerSideProps } from 'next';
import { prisma } from '../prisma/adapter';
import type { Category } from '../models/categories';
import type { Project } from '../models/projects';
import ProjectCategoryPage from '../components/ProjectCategoryPage';

type Props = {
  category: Category;
  projects: Project[];
};

export default function ExperiencePage({ category, projects }: Props) {
  return (
    <ProjectCategoryPage
      initialCategory={category}
      initialProjects={projects}
      titleOverride="Experience"
      sectionLabel="Work History"
      cardVariant="experience"
      emptyStateLabel="No work-history entries are available yet."
      searchPlaceholder="Search companies, roles, or experience summaries"
      descriptionOverride="This section is the professional timeline: the companies, long-term roles, and overlapping freelance engagements that shaped the depth behind the portfolio work."
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [category, projectsRaw] = await Promise.all([
    prisma.category.findUnique({
      where: { shortcode: 'experience' },
      select: { id: true, title: true, shortcode: true },
    }),
    prisma.project.findMany({
      where: {
        categories: {
          some: {
            category: {
              shortcode: 'experience',
            },
          },
        },
      },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { priority: 'asc' },
        },
        categories: {
          include: { category: true },
          orderBy: { priority: 'asc' },
        },
      },
      orderBy: [
        { end_date: { sort: 'desc', nulls: 'first' } },
        { start_date: 'asc' },
      ],
    }),
  ]);

  if (!category) {
    return { notFound: true };
  }

  const projects: Project[] = JSON.parse(JSON.stringify(projectsRaw.map((project) => ({
    ...project,
    skills: project.skills.map(({ priority, skill }) => ({ id: skill.id, priority, name: skill.name, desc: skill.desc, rating: skill.rating })),
    categories: project.categories.map(({ priority, category }) => ({ id: category.id, priority, title: category.title, shortcode: category.shortcode })),
  }))))

  return {
    props: {
      category,
      projects,
    },
  };
};