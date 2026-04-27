import { GetServerSideProps } from "next";
import { Category } from "app/models/categories";
import type { Project } from "app/models/projects";
import { getProjectsByShortcode, getCategoryByShortcode } from "app/repositories/projects";
import ProjectCategoryPage from "components/projects/ProjectCategoryPage";

interface Props {
  category: Category;
  projects: Project[];
}

export default function ShortcodePage({ category, projects }: Props) {
  if (!category) return null;
  return <ProjectCategoryPage initialCategory={category} initialProjects={projects} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { shortcode } = context.params as { shortcode: string };

  const [category, projects] = await Promise.all([
    getCategoryByShortcode(shortcode),
    getProjectsByShortcode(shortcode),
  ]);

  if (!category) {
    return { notFound: true };
  }

  return { props: { category, projects } };
};
