import type { GetServerSideProps } from 'next';
import type { Category } from 'app/models/categories';
import type { Project } from 'app/models/projects';
import { getProjectsByShortcode, getCategoryByShortcode, getFilterCategories } from 'app/repositories/projects';
import ProjectCategoryPage from 'components/projects/ProjectCategoryPage';

type Props = {
  category: Category;
  projects: Project[];
  filterCategories: Category[];
};

export default function ProjectsPage({ category, projects, filterCategories }: Props) {
  return (
    <ProjectCategoryPage
      initialCategory={category}
      initialProjects={projects}
      filterCategories={filterCategories}
      titleOverride="Portfolio"
      sectionLabel="Case Studies"
      cardVariant="project"
      emptyStateLabel="No portfolio case studies are available yet."
      searchPlaceholder="Search case studies"
      descriptionOverride="Selected systems, tools, and implementations that show the kinds of business problems I solve and the work I can deliver."
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [category, projects, filterCategories] = await Promise.all([
    getCategoryByShortcode('projects'),
    getProjectsByShortcode('projects'),
    getFilterCategories(),
  ]);

  if (!category) {
    return { notFound: true };
  }

  return {
    props: {
      category,
      projects,
      filterCategories,
    },
  };
};
