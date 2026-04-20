import type { GetServerSideProps } from 'next';
import type { Category } from '../models/categories';
import type { Project } from '../models/projects';
import { getProjectsByShortcode, getCategoryByShortcode } from '../lib/projects';
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
  const [category, projects] = await Promise.all([
    getCategoryByShortcode('experience'),
    getProjectsByShortcode('experience'),
  ]);

  if (!category) {
    return { notFound: true };
  }

  return {
    props: {
      category,
      projects,
    },
  };
};