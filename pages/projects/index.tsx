import type { GetServerSideProps } from 'next';
import type { Category } from 'app/models/categories';
import type { Project } from 'app/models/projects';
import { getAllProjects, getCategoryByShortcode, getFilterCategories } from 'app/repositories/projects';
import ProjectCategoryPage from 'components/projects/ProjectCategoryPage';

type Props = {
  category: Category;
  projects: Project[];
  filterCategories: Category[];
  initialSkillFilter?: string;
};

export default function ProjectsPage({ category, projects, filterCategories, initialSkillFilter }: Props) {
  return (
    <ProjectCategoryPage
      initialCategory={category}
      initialProjects={projects}
      filterCategories={filterCategories}
      initialSkillFilter={initialSkillFilter}
      titleOverride="Portfolio"
      sectionLabel="Case Studies"
      cardVariant="project"
      emptyStateLabel="No portfolio case studies are available yet."
      searchPlaceholder="Search case studies"
      descriptionOverride="Selected systems, tools, and implementations that show the kinds of business problems I solve and the work I can deliver."
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const filterParam = typeof context.query.filter === 'string' ? context.query.filter : undefined;

  const [category, projects, filterCategories] = await Promise.all([
    getCategoryByShortcode('projects'),
    getAllProjects(),
    getFilterCategories(),
  ]);

  const resolvedCategory = category ?? { id: 0, title: 'Portfolio', shortcode: 'projects', priority: 0, show_in_filter: false };

  return {
    props: {
      category: resolvedCategory,
      projects,
      filterCategories,
      ...(filterParam ? { initialSkillFilter: filterParam } : {}),
    },
  };
};
