import { GetServerSideProps } from "next";
import type { ProjectDetail } from "app/models/projects";
import { getProjectById, getProjectByShortcode } from "app/repositories/projects";
import { ProjectDetailView } from "components/projects/ProjectDetailView";

interface Props {
  project: ProjectDetail;
}

export default function ProjectPage({ project }: Props) {
  return <ProjectDetailView project={project} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const slug = context.params?.shortcode as string;
  const numericId = parseInt(slug, 10);

  const project = isNaN(numericId)
    ? await getProjectByShortcode(slug)
    : await getProjectById(numericId);

  if (!project) return { notFound: true };

  return { props: { project } };
};
