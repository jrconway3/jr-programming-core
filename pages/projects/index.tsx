import type { GetServerSideProps } from 'next';
import Head from 'next/head';
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
    <>
      <Head>
        <link rel="canonical" href="https://jrconway.net/projects" key="canonical" />
        <meta property="og:title" content="Portfolio — 53 Projects in Laravel, PHP, APIs & Automation" key="og:title" />
        <meta property="og:description" content="Browse 53 production projects including CRM systems, Chrome extensions, API integrations, and automation tools built across a decade of professional work." key="og:description" />
        <meta property="og:url" content="https://jrconway.net/projects" />
      </Head>
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
        seoTitle="Portfolio — 53 Projects in Laravel, PHP, APIs & Automation | David Conway Jr."
        seoDescription="Browse 53 production projects including CRM systems, Chrome extensions, API integrations, and automation tools built across a decade of professional work."
      />
    </>
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
