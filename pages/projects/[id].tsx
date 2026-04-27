import { GetServerSideProps } from "next";
import type { ProjectDetail } from "app/models/projects";
import { getProjectById } from "app/repositories/projects";
import { ProjectDetailView } from "components/projects/ProjectDetailView";

interface Props {
  project: ProjectDetail;
}

export default function ProjectPage({ project }: Props) {
  return <ProjectDetailView project={project} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = parseInt(context.params?.id as string, 10);
  if (isNaN(id)) return { notFound: true };

  const project = await getProjectById(id);

  if (!project) return { notFound: true };

  return { props: { project } };
};
