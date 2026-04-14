import { GetServerSideProps } from "next";
import { prisma } from "../prisma/adapter";
import { Category } from "../models/categories";
import { Project } from "../models/projects";
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

  const [category, projectsRaw] = await Promise.all([
    prisma.category.findUnique({
      where: { shortcode },
      select: { id: true, title: true, shortcode: true },
    }),
    prisma.project.findMany({
      where: {
        categories: {
          some: {
            category: {
              shortcode,
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

  const projects = JSON.parse(JSON.stringify(projectsRaw)) as Project[];

  return { props: { category, projects } };
};
