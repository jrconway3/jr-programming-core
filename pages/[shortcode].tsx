import { GetServerSideProps } from "next";
import { prisma } from "../prisma/adapter";
import { Category } from "../models/categories";
import ProjectCategoryPage from "../components/ProjectCategoryPage";

interface Props {
  category: Category;
}

export default function ShortcodePage({ category }: Props) {
  if (!category) return null;
  return <ProjectCategoryPage shortcode={category.shortcode} initialCategory={category} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { shortcode } = context.params as { shortcode: string };

  const category = await prisma.category.findUnique({
    where: { shortcode },
    select: { id: true, title: true, shortcode: true },
  });

  if (!category) {
    return { notFound: true };
  }

  return { props: { category } };
};
