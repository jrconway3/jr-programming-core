import { GetServerSideProps } from "next";
import type { ProjectDetail } from "app/models/projects";
import { getProjectById, getAdjacentProjectsByCategory } from "app/repositories/projects";
import { ProjectDetailView } from "components/projects/ProjectDetailView";

interface AdjacentProject {
  href: string;
  name: string;
}

interface Props {
  project: ProjectDetail;
  prevProject: AdjacentProject | null;
  nextProject: AdjacentProject | null;
}

export default function ProjectPage({ project, prevProject, nextProject }: Props) {
  return <ProjectDetailView project={project} prevProject={prevProject} nextProject={nextProject} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = parseInt(context.params?.id as string, 10);
  if (isNaN(id)) return { notFound: true };

  const [project, adjacent] = await Promise.all([
    getProjectById(id),
    getAdjacentProjectsByCategory(id, 'projects'),
  ]);

  if (!project) return { notFound: true };

  return {
    props: {
      project,
      prevProject: adjacent.prev,
      nextProject: adjacent.next,
    },
  };
};
