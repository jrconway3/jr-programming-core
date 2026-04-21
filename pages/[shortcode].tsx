import { GetServerSideProps } from "next";
import { Category } from "../models/categories";
import { Project } from "../models/projects";
import { getProjectsByShortcode, getCategoryByShortcode } from "../lib/projects";
import ProjectCategoryPage from "../components/ProjectCategoryPage";

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
