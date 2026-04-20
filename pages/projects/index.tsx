import type { GetServerSideProps } from 'next';
import { prisma } from '../../prisma/adapter';
import type { Category } from '../../models/categories';
import type { Project } from '../../models/projects';
import ProjectCategoryPage from '../../components/ProjectCategoryPage';

type Props = {
  category: Category;
  projects: Project[];
};

export default function ProjectsPage({ category, projects }: Props) {
  return (
    <ProjectCategoryPage
      initialCategory={category}
      initialProjects={projects}
      titleOverride="Portfolio"
      sectionLabel="Case Studies"
      cardVariant="project"
      emptyStateLabel="No portfolio case studies are available yet."
      searchPlaceholder="Search case studies, technologies, or client names"
      descriptionOverride="This section is the portfolio view: selected systems, tools, and implementations that show the kinds of business problems I solve and the work I can deliver."
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [category, projectsRaw] = await Promise.all([
    prisma.category.findUnique({
      where: { shortcode: 'projects' },
      select: { id: true, title: true, shortcode: true },
    }),
    prisma.project.findMany({
      where: {
        categories: {
          some: {
            category: {
              shortcode: 'projects',
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